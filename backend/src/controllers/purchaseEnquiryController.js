// Purchase enquiry controller
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Create Purchase Enquiry
 * PM can create emergency RFQ for components
 */
exports.createPurchaseEnquiry = async (req, res) => {
  try {
    const { companyId, vendorId, title, description, items, requiredDeliveryDate, source, planningRequestId } = req.body;
    const purchaseManagerId = req.user?.vendor_id; // This will be from purchase manager auth

    // Validation
    if (!vendorId || !title || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: vendorId, title, and items array'
      });
    }

    const enquiryId = `pe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create enquiry
    const { data: enquiry, error: enquiryError } = await supabase
      .from('purchase_enquiry')
      .insert([
        {
          enquiry_id: enquiryId,
          vendor_id: vendorId,
          purchase_manager_id: purchaseManagerId,
          title,
          description: description || null,
          requested_date: new Date().toISOString(),
          required_delivery_date: requiredDeliveryDate || null,
          source: source || 'emergency',
          planning_request_id: planningRequestId || null,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (enquiryError) throw enquiryError;

    // Add enquiry items
    const itemInserts = items.map((item) => ({
      item_id: `pei_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      enquiry_id: enquiryId,
      component_id: item.componentId,
      quantity: item.quantity,
      unit: item.unit || null,
      specifications: item.specifications || null,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from('purchase_enquiry_items')
      .insert(itemInserts);

    if (itemsError) throw itemsError;

    // Fetch complete enquiry with items
    const { data: completeEnquiry } = await supabase
      .from('purchase_enquiry')
      .select(`
        *,
        items:purchase_enquiry_items(*)
      `)
      .eq('enquiry_id', enquiryId)
      .single();

    res.status(201).json({
      message: 'Purchase enquiry created successfully',
      enquiry: completeEnquiry,
    });
  } catch (error) {
    console.error('Error creating purchase enquiry:', error);
    res.status(500).json({ error: error.message || 'Failed to create purchase enquiry' });
  }
};

/**
 * Get Purchase Enquiry by ID
 */
exports.getPurchaseEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    const { data: enquiry, error } = await supabase
      .from('purchase_enquiry')
      .select(`
        *,
        items:purchase_enquiry_items(*)
      `)
      .eq('enquiry_id', enquiryId)
      .single();

    if (error || !enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ enquiry });
  } catch (error) {
    console.error('Error fetching purchase enquiry:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch enquiry' });
  }
};

/**
 * Get all Purchase Enquiries for a Company
 */
exports.getPurchaseEnquiries = async (req, res) => {
  try {
    const { status, vendorId } = req.query;

    let query = supabase
      .from('purchase_enquiry')
      .select(`
        *,
        items:purchase_enquiry_items(*)
      `);

    if (status) query = query.eq('status', status);
    if (vendorId) {
      console.log('Filtering enquiries by vendorId:', vendorId);
      query = query.eq('vendor_id', vendorId);
    }

    const { data: enquiries, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Found enquiries:', enquiries?.length || 0, 'for vendorId:', vendorId);

    res.json({
      enquiries: enquiries || [],
      total: enquiries?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching purchase enquiries:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch enquiries' });
  }
};

/**
 * Update Purchase Enquiry Status
 */
exports.updatePurchaseEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { status, description, title, requiredDeliveryDate, source, items } = req.body;

    // Fetch the current enquiry to check if it was rejected
    const { data: currentEnquiry } = await supabase
      .from('purchase_enquiry')
      .select('status')
      .eq('enquiry_id', enquiryId)
      .single();

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requiredDeliveryDate !== undefined) updateData.required_delivery_date = requiredDeliveryDate;
    if (source !== undefined) updateData.source = source;

    // If updating a rejected enquiry, reset it to pending (and clear rejection reason)
    if (currentEnquiry?.status === 'rejected') {
      updateData.status = 'pending';
      updateData.rejection_reason = null;
    }

    const { data: enquiry, error } = await supabase
      .from('purchase_enquiry')
      .update(updateData)
      .eq('enquiry_id', enquiryId)
      .select()
      .single();

    if (error) throw error;

    if (Array.isArray(items)) {
      await supabase
        .from('purchase_enquiry_items')
        .delete()
        .eq('enquiry_id', enquiryId);

      if (items.length > 0) {
        const itemInserts = items.map((item) => ({
          item_id: `pei_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          enquiry_id: enquiryId,
          component_id: item.componentId,
          quantity: item.quantity,
          unit: item.unit || null,
          specifications: item.specifications || null,
          created_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from('purchase_enquiry_items')
          .insert(itemInserts);

        if (itemsError) throw itemsError;
      }
    }

    res.json({
      message: 'Enquiry updated successfully',
      enquiry,
    });
  } catch (error) {
    console.error('Error updating purchase enquiry:', error);
    res.status(500).json({ error: error.message || 'Failed to update enquiry' });
  }
};

/**
 * Reject Purchase Enquiry (Vendor rejects or PM rejects)
 */
exports.rejectPurchaseEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        error: 'Rejection reason is required'
      });
    }

    const { data: enquiry, error } = await supabase
      .from('purchase_enquiry')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq('enquiry_id', enquiryId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Enquiry rejected successfully',
      enquiry,
    });
  } catch (error) {
    console.error('Error rejecting purchase enquiry:', error);
    res.status(500).json({ error: error.message || 'Failed to reject enquiry' });
  }
};

/**
 * Delete Purchase Enquiry
 */
exports.deletePurchaseEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    // Delete items first
    await supabase
      .from('purchase_enquiry_items')
      .delete()
      .eq('enquiry_id', enquiryId);

    // Delete enquiry
    const { error } = await supabase
      .from('purchase_enquiry')
      .delete()
      .eq('enquiry_id', enquiryId);

    if (error) throw error;

    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase enquiry:', error);
    res.status(500).json({ error: error.message || 'Failed to delete enquiry' });
  }
};
