// Admin authentication controller
const supabase = require('../config/supabase');
const firebaseAuthUtils = require('../config/firebaseAuth');

/**
 * Admin Login
 * POST /api/auth/admin-login
 * Body: { email, password }
 * Returns: Firebase Custom Token
 */
exports.loginAdmin = async (req, res) => {
    console.log('--- Admin Login Attempt ---');
    console.log('Email:', req.body?.email);
    // Log environment variable presence
    console.log('FIREBASE_API_KEY present:', !!process.env.FIREBASE_API_KEY);
    // Log Supabase query
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find admin by email in database (new schema)
    const { data: admin, error: queryError } = await supabase
        .from('purchaseManager')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Supabase admin lookup:', { admin, queryError });

    if (queryError || !admin) {
      console.error('Admin not found in Supabase or query error:', queryError);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      console.error('Admin found but not active:', admin.status);
      return res.status(403).json({
        error: `Admin account is ${admin.status}. Please contact support.`,
      });
    }

    // Verify email and password against Firebase
    let firebaseUser;
    try {
      const fbAuth = await firebaseAuthUtils.verifyEmailPassword(email, password);
      firebaseUser = fbAuth;
      console.log('Firebase Auth Success:', fbAuth);
    } catch (firebaseError) {
      console.error('Firebase authentication failed:', firebaseError.message, firebaseError.response?.data);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Sync Firebase UID if not already stored (new schema: store in profile_image if needed, or skip if not used)
    // If you want to store firebase UID, add a new field or skip this step.

    // Set custom claims for admin (use purchaseManagerId as unique id)
    await firebaseAuthUtils.setCustomClaims(firebaseUser.uid, {
      admin: true,
      purchaseManagerId: admin.purchaseManagerId,
      email: admin.email,
      status: admin.status,
    });

    // Get fresh ID token that includes the custom claims
    let freshIdToken = firebaseUser.idToken;
    if (firebaseUser.refreshToken) {
      try {
        const refreshResult = await firebaseAuthUtils.refreshIdToken(firebaseUser.refreshToken);
        freshIdToken = refreshResult.idToken;
      } catch (refreshError) {
        console.warn('Could not refresh ID token:', refreshError.message);
        // Continue with original token if refresh fails
      }
    }

    // Generate Firebase Custom Token (unused but kept for reference)
    const customToken = await firebaseAuthUtils.createCustomToken(firebaseUser.uid, {
      admin: true,
      purchaseManagerId: admin.purchaseManagerId,
      email: admin.email,
      status: admin.status,
    });

    // Update updated_at
    await supabase
        .from('purchaseManager')
      .update({ updated_at: new Date().toISOString() })
      .eq('purchaseManagerId', admin.purchaseManagerId);

    res.json({
      message: 'Login successful',
      customToken,
      idToken: freshIdToken,
      admin: {
        purchaseManagerId: admin.purchaseManagerId,
        email: admin.email,
        name: admin.name,
        phone: admin.phone,
        companyId: admin.companyId,
        status: admin.status,
        created_at: admin.created_at,
        updated_at: admin.updated_at,
        profile_image: admin.profile_image,
      },
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ error: error.message || 'Failed to login' });
  }
};

/**
 * Get All Admins (Super Admin only)
 */
exports.getAllAdmins = async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from('purchase_admin')
      .select('purchaseManagerId, email, name, phone, companyId, status, profile_image, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      admins: admins || [],
      total: admins?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch admins' });
  }
};

/**
 * Create Admin (Super Admin only)
 * POST /api/auth/admins
 */
exports.createAdmin = async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      companyId,
      status = 'active',
      profile_image = null,
    } = req.body;

    // Validation
    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Email and name are required' 
      });
    }

    // Check if email already exists in database
    const { data: existingAdmin } = await supabase
        .from('purchaseManager')
      .select('purchaseManagerId')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return res.status(400).json({ 
        error: 'Email already exists' 
      });
    }

    // Create Firebase user WITHOUT password
    let firebaseUser;
    try {
      firebaseUser = await firebaseAuthUtils.createFirebaseUserNoPassword(email, name);
    } catch (firebaseError) {
      console.error('Firebase user creation error:', firebaseError.message);
      return res.status(400).json({ 
        error: firebaseError.message || 'Failed to create admin user' 
      });
    }

    // Create admin record in database
    const { data: newAdmin, error: dbError } = await supabase
        .from('purchaseManager')
      .insert([
        {
          email,
          name,
          phone: phone || null,
          companyId: companyId || null,
          status,
          profile_image,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('purchaseManagerId, email, name, phone, companyId, status, profile_image, created_at, updated_at')
      .single();

    if (dbError) {
      // If database insert fails, clean up Firebase user
      try {
        await firebaseAuthUtils.deleteFirebaseUser(firebaseUser.uid);
      } catch (err) {
        console.error('Error cleaning up Firebase user:', err);
      }
      throw dbError;
    }

    // Set custom claims
    await firebaseAuthUtils.setCustomClaims(firebaseUser.uid, {
      admin: true,
      purchaseManagerId: newAdmin.purchaseManagerId,
      email: newAdmin.email,
      status: newAdmin.status,
    });

    // Send password reset email so admin can set their own password
    try {
      await firebaseAuthUtils.sendPasswordResetEmail(email);
    } catch (emailErr) {
      console.error('Error sending password reset email:', emailErr.message);
      // Don't fail if email sending fails, admin is still created
    }

    res.status(201).json({
      message: 'Admin created successfully. Password setup email sent.',
      admin: newAdmin,
      note: 'Admin should check their email to set password',
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: error.message || 'Failed to create admin' });
  }
};

/**
 * Update Admin (Self or Super Admin)
 */
exports.updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { name, email, phone, company_id, permissions, status } = req.body;

    // Get current admin
    const { data: admin, error: fetchError } = await supabase
        .from('purchaseManager')
      .select('*')
      .eq('admin_id', adminId)
      .single();

    if (fetchError || !admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const updateData = {
      upated_at: new Date().toISOString(),
    };

    if (name) {
      updateData.name = name;
      // Update display name in Firebase
      if (admin.firebase_uid) {
        try {
          const { auth: firebaseAuth } = require('../config/firebase');
          await firebaseAuth.updateUser(admin.firebase_uid, {
            displayName: name,
          });
        } catch (err) {
          console.error('Error updating Firebase user display name:', err);
        }
      }
    }
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (company_id) updateData.company_id = company_id;
    if (permissions) updateData.permissions = permissions;
    if (status) updateData.status = status;

    const { data: updatedAdmin, error: updateError } = await supabase
        .from('purchaseManager')
      .update(updateData)
      .eq('admin_id', adminId)
      .select('admin_id, email, name, phone, company_id, role, status')
      .single();

    if (updateError) throw updateError;

    res.json({
      message: 'Admin updated successfully',
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: error.message || 'Failed to update admin' });
  }
};

/**
 * Change Admin Password
 * PUT /api/auth/admins/:adminId/password
 * Body: { idToken, newPassword }
 */
exports.changeAdminPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { idToken, newPassword } = req.body;

    if (!idToken || !newPassword) {
      return res.status(400).json({ 
        error: 'ID token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters' 
      });
    }

    // Get admin
    const { data: admin, error: fetchError } = await supabase
        .from('purchaseManager')
      .select('firebase_uid')
      .eq('admin_id', adminId)
      .single();

    if (fetchError || !admin) {
      return res.status(404).json({ 
        error: 'Admin not found' 
      });
    }

    // Change password in Firebase using REST API
    try {
      await firebaseAuthUtils.changeFirebasePassword(idToken, newPassword);
    } catch (firebaseError) {
      console.error('Firebase password change error:', firebaseError.message);
      return res.status(400).json({ 
        error: 'Failed to change password. Please ensure your token is valid.' 
      });
    }

    // Update updated_at timestamp in database
    await supabase
        .from('purchaseManager')
      .update({ upated_at: new Date().toISOString() })
      .eq('admin_id', adminId);

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message || 'Failed to change password' });
  }
};

/**
 * Delete Admin (Super Admin only)
 */
exports.deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Get admin Firebase UID
    const { data: admin, error: fetchError } = await supabase
        .from('purchaseManager')
      .select('firebase_uid')
      .eq('admin_id', adminId)
      .single();

    if (fetchError || !admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Delete from database first
    const { error: deleteError } = await supabase
        .from('purchaseManager')
      .delete()
      .eq('admin_id', adminId);

    if (deleteError) throw deleteError;

    // Delete Firebase user if exists
    if (admin.firebase_uid) {
      try {
        await firebaseAuthUtils.deleteFirebaseUser(admin.firebase_uid);
      } catch (err) {
        console.error('Error deleting Firebase user:', err);
        // Continue even if Firebase deletion fails, database was already deleted
      }
    }

    res.json({
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: error.message || 'Failed to delete admin' });
  }
};

/**
 * Log admin action (for audit trail)
 */
exports.logAdminAction = async (adminId, action, entityType, entityId, details = {}) => {
  try {
    await supabase
      .from('admin_audit_log')
      .insert([
        {
          admin_id: adminId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          created_at: new Date().toISOString(),
        },
      ]);
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};
