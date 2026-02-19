# Admin Login Troubleshooting - Password Hash Issue

## Problem
Login is not working with credentials:
- Username: `admin`
- Password: `admin@123`

## Root Cause
The bcrypt hash in the SQL schema may not be correct for the password `admin@123`, or the admin user doesn't exist in the database.

---

## ✅ Solution: Generate Fresh Bcrypt Hash

### Step 1: Generate Correct Hash

```bash
# Navigate to script directory
cd scripts

# Run the hash generator
node generate-bcrypt-hash.js
```

**Output will look like:**
```
🔐 Generating Bcrypt Hash
=========================

Password: admin@123
Salt Rounds: 10

Generating hash... this may take a moment...

✅ Hash Generated Successfully:

Hash: $2b$10$... (new hash)

📋 SQL INSERT Statement:
INSERT INTO purchase_admin (...)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$... (new hash)',
  ...
)
```

### Step 2: Update Database

**Option A: If admin user doesn't exist yet**
```sql
-- Copy the INSERT statement from the script output and execute in Supabase
INSERT INTO purchase_admin (username, email, password_hash, full_name, company_name, role, status, permissions)
VALUES (
  'admin',
  'admin@example.com',
  '<PASTE_HASH_FROM_SCRIPT>',
  'Administrator',
  'Custom Soft',
  'super_admin',
  'active',
  '["create_enquiry", "approve_vendor", "manage_admins", "view_analytics"]'
);
```

**Option B: If admin user already exists**
```sql
-- Update the password hash
UPDATE purchase_admin 
SET password_hash = '<PASTE_HASH_FROM_SCRIPT>' 
WHERE username = 'admin';
```

### Step 3: Verify in Supabase

```sql
-- Check the admin user exists and has correct hash
SELECT admin_id, username, email, status, password_hash 
FROM purchase_admin 
WHERE username = 'admin';
```

### Step 4: Test Login

Try logging in again at: `http://localhost:5173/admin/login`
- Username: `admin`
- Password: `admin@123`

---

## 🔍 Advanced Troubleshooting

### Check 1: Verify Admin User Exists
```sql
SELECT * FROM purchase_admin WHERE username = 'admin';
```

✅ Should return one row
❌ If no results: User doesn't exist, insert it using the hash generator output

### Check 2: Verify Admin Status is Active
```sql
SELECT username, status FROM purchase_admin WHERE username = 'admin';
```

✅ Status should be `active`
❌ If suspended/inactive: Run update
```sql
UPDATE purchase_admin SET status = 'active' WHERE username = 'admin';
```

### Check 3: Check Backend Logs
```bash
# In another terminal, start backend and watch for errors
cd backend
npm start
```

Look for error messages like:
- "Invalid username or password" → Password hash mismatch
- "Access token required" → Token not sent
- "Admin account is inactive" → Status not active

### Check 4: Test API Directly

```bash
# Test login endpoint directly
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'
```

You should see:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "admin": { "admin_id": "...", "username": "admin", ... }
}
```

If you get error:
```json
{"error": "Invalid username or password"}
```

Then the password hash is incorrect.

---

## 🚨 Common Issues and Fixes

### Issue 1: "Invalid username or password"

**Cause:** Password hash doesn't match

**Fix:**
```bash
# 1. Generate new hash
node scripts/generate-bcrypt-hash.js

# 2. Update database with new hash
# Copy OUTPUT and run in Supabase console
UPDATE purchase_admin SET password_hash = '<NEW_HASH>' WHERE username = 'admin';
```

### Issue 2: "Admin account is inactive"

**Cause:** Status is not 'active'

**Fix:**
```sql
UPDATE purchase_admin SET status = 'active' WHERE username = 'admin';
```

### Issue 3: No admin user found

**Cause:** User wasn't inserted into database

**Fix:**
```bash
# 1. Generate hash
node scripts/generate-bcrypt-hash.js

# 2. Run INSERT from script output in Supabase console
```

### Issue 4: JWT_SECRET not set

**Cause:** Backend can't create tokens

**Fix:**
```bash
# Update backend/.env
echo "JWT_SECRET=your-super-secret-key-12345" >> backend/.env

# Restart backend
cd backend
npm start
```

---

## 📊 Verification Checklist

Run these SQL queries to verify setup:

```sql
-- 1. Check table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'purchase_admin';
-- ✅ Should return 1 row

-- 2. Check admin user exists
SELECT COUNT(*) as admin_count FROM purchase_admin;
-- ✅ Should return >= 1

-- 3. Check default admin
SELECT username, email, status, role FROM purchase_admin WHERE username = 'admin';
-- ✅ Should return: admin | admin@example.com | active | super_admin

-- 4. Check password hash is set
SELECT LENGTH(password_hash) as hash_length FROM purchase_admin WHERE username = 'admin';
-- ✅ Should return around 60 (bcrypt hash length)
```

---

## 🔄 Reset Admin Password

If you're stuck, you can generate a completely new password:

```bash
# 1. Generate hash for new password
node scripts/generate-bcrypt-hash.js

# 2. When prompted or see output, copy the hash

# 3. Update in database
UPDATE purchase_admin 
SET password_hash = '<PASTE_NEW_HASH>'
WHERE username = 'admin';

# 4. Try login with: admin@123
```

---

## 📝 Quick Command Reference

### Generate Hash (Run once)
```bash
cd /Users/pranav/Desktop/supplier-dashboard
node scripts/generate-bcrypt-hash.js
```

### Update Wrong Hash (In Supabase console)
```sql
UPDATE purchase_admin 
SET password_hash = '<PASTE_HASH_FROM_SCRIPT>' 
WHERE username = 'admin';
```

### Check Status (In Supabase console)
```sql
SELECT username, status, email FROM purchase_admin WHERE username = 'admin';
```

### Test API (In terminal)
```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'
```

---

## ✨ After Fixing

Once login works:

1. ✅ Log in with `admin` / `admin@123`
2. ✅ Go to admin panel
3. ✅ **IMMEDIATELY change password** (if available in UI)
4. ✅ Create additional admin users via API

---

## 📞 Still Having Issues?

If login still doesn't work after these steps:

1. **Check backend console** for error messages
2. **Verify bcrypt is installed:**
   ```bash
   cd backend && npm ls bcrypt
   ```
3. **Check JWT package:**
   ```bash
   cd backend && npm ls jsonwebtoken
   ```
4. **Review controller code:**
   - `backend/src/controllers/adminAuthController.js` - loginAdmin function
   - Check password verification: `bcrypt.compare(password, admin.password_hash)`

5. **Enable debug logging** in `adminAuthController.js`:
   ```javascript
   console.log('Testing password:', password);
   console.log('Against hash:', admin.password_hash);
   console.log('Admin found:', !!admin);
   console.log('Admin status:', admin?.status);
   ```

---

## 🎯 Success Indicators

✅ Admin login page loads
✅ Can enter username and password
✅ Submit form doesn't throw error
✅ Redirected to `/admin/dashboard`
✅ Admin user info displays in header
✅ Can access protected routes
✅ API calls work with JWT token
