# Quick Start Guide - Supplier Registration System

## Overview
This guide will help you quickly set up and test the complete supplier registration system with admin approval workflow.

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account (free tier works)
- Code editor (VS Code recommended)

---

## Step 1: Backend Setup

### 1.1 Install Dependencies
```bash
cd backend
npm install
```

### 1.2 Create Environment File
Create a `.env` file in the backend directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
```

**To get your Supabase credentials:**
1. Go to https://supabase.com
2. Create a new project or use existing one
3. In Settings → API, copy:
   - `Project URL` → SUPABASE_URL
   - `anon public` key → SUPABASE_ANON_KEY

### 1.3 Create Database Table
1. Go to Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `database/supplier_registration_migration.sql`
5. Click "Run"

This creates the `SupplierRegistration` table with all necessary fields.

### 1.4 Start Backend Server
```bash
npm run dev
```

You should see: `Server is running on port 3000`

---

## Step 2: Frontend Setup

### 2.1 Install Dependencies
```bash
cd frontend
npm install
```

### 2.2 Start Development Server
```bash
npm run dev
```

You should see something like: `VITE v7.2.4  ready in XXX ms`

The frontend will typically run on `http://localhost:5173`

---

## Step 3: Test the System

### Test 1: Supplier Registration

**URL:** http://localhost:5173/register

**Steps:**
1. Fill in the registration form:
   - Company Name: "Test Company"
   - Contact Person: "John Doe"
   - Email: "supplier@test.com"
   - Phone: "123-456-7890"
   - Password: "TestPass123"
   - Confirm Password: "TestPass123"

2. Click "Register"

3. You should see success message: "Registration request submitted successfully..."

4. You'll be redirected to login page

**What happened:**
- Registration request created with status = "pending"
- Password hashed with bcrypt
- Data stored in Supabase
- Awaiting admin approval

---

### Test 2: Supplier Login (Before Approval)

**URL:** http://localhost:5173/login

**Steps:**
1. Enter email: "supplier@test.com"
2. Enter password: "TestPass123"
3. Click "Login"

**Expected Result:**
- Error message: "Your registration is pending. Please wait for admin approval."

This is correct! Suppliers can only login after admin approval.

---

### Test 3: Admin Panel

**URL:** http://localhost:5173/admin-login

**Steps:**
1. Enter username: "admin"
2. Enter password: "admin@123"
3. Click "Login as Admin"

**What you should see:**
- Admin panel with "Registration Requests Management" header
- "Pending" tab active
- Your test registration in the table

---

### Test 4: Approve Registration

**In Admin Panel:**

1. You should see your test company registration
2. Click the blue "View Details" button
3. Modal opens with all registration information
4. Click "Approve" button in the modal
5. Confirm the approval when asked

**What happened:**
- Registration status changed from "pending" to "approved"
- Company record created in the Company table
- Supplier can now login!

---

### Test 5: Supplier Login (After Approval)

**URL:** http://localhost:5173/login

**Steps:**
1. Enter email: "supplier@test.com"
2. Enter password: "TestPass123"
3. Click "Login"

**Expected Result:**
- Redirected to `/dashboard`
- See supplier information displayed
- "Logout" button visible in top right

---

### Test 6: Admin Rejection

**Register Another Supplier:**
1. Go to http://localhost:5173/register
2. Register with email: "test2@company.com"
3. Fill other fields with test data
4. Submit registration

**Reject in Admin Panel:**
1. Go to http://localhost:5173/admin-login
2. Login with admin/admin@123
3. See new registration in Pending tab
4. Click "View Details"
5. Click "Reject" button
6. Add rejection reason: "Company information incomplete"
7. Click "Confirm Rejection"

**Verify Rejection:**
1. Go to admin-login again
2. Click "Rejected" filter button
3. See the rejected registration with your reason

---

## Project Structure

### New Files Created

**Backend:**
```
backend/src/
├── controllers/authController.js      (Login, Register, Admin operations)
├── routes/authRoutes.js               (Auth endpoints)
└── server.js                           (UPDATED - added auth routes)

database/
└── supplier_registration_migration.sql (SQL to create tables)
```

**Frontend:**
```
frontend/src/
├── pages/
│   ├── Login.jsx                      (Supplier login)
│   ├── Register.jsx                   (Supplier registration)
│   ├── AdminLogin.jsx                 (Admin authentication)
│   ├── AdminPanel.jsx                 (Registration management)
│   └── Dashboard.jsx                  (Supplier dashboard)
├── styles/
│   ├── Auth.css                       (Login/Register styling)
│   ├── AdminPanel.css                 (Admin panel styling)
│   └── Dashboard.css                  (Dashboard styling)
└── App.jsx                             (UPDATED - added routing)
```

---

## Available Routes

### Public Routes
```
GET  /                              → /login (redirects)
GET  /login                         → Supplier login page
GET  /register                      → Supplier registration page
GET  /admin-login                   → Admin login page
```

### Protected Routes
```
GET  /dashboard                     → Supplier dashboard (needs login)
GET  /admin                         → Admin panel (needs admin login)
```

### API Endpoints
```
POST   /api/auth/register           → Register supplier
POST   /api/auth/login              → Login supplier
GET    /api/auth/registrations      → Get registrations (admin)
GET    /api/auth/registrations/:id  → Get single registration (admin)
PUT    /api/auth/registrations/:id/approve   → Approve registration (admin)
PUT    /api/auth/registrations/:id/reject    → Reject registration (admin)
```

---

## Common Issues & Solutions

### Issue: "Cannot GET /register"
**Solution:** Make sure frontend is running on port 5173 and you're using React Router

### Issue: "Missing Supabase environment variables"
**Solution:** 
1. Check `.env` file exists in backend folder
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY are set
3. Restart backend server

### Issue: "Table 'SupplierRegistration' does not exist"
**Solution:**
1. Go to Supabase SQL editor
2. Run the migration SQL from `database/supplier_registration_migration.sql`
3. Verify table is created

### Issue: CORS error in browser console
**Solution:**
1. Ensure backend is running on http://localhost:3000
2. Check frontend is making requests to correct URL
3. Verify CORS is enabled in backend (it is by default)

### Issue: "Invalid email or password" even with correct credentials
**Solution:**
1. Make sure registration was successful (check Supabase table)
2. Ensure admin approved the registration first
3. Check that password matches exactly (case-sensitive)

### Issue: Admin login not working
**Solution:**
1. Username: `admin` (lowercase)
2. Password: `admin@123`
3. These are demo credentials for testing
4. Change in production!

---

## What This System Does

### Supplier Registration Workflow
1. Supplier fills registration form
2. Password encrypted with bcrypt
3. Registration stored in Supabase with status='pending'
4. Supplier sees confirmation message
5. Supplier cannot login yet

### Admin Approval Workflow
1. Admin logs in with admin/admin@123
2. Sees all pending registrations
3. Can view full details of each registration
4. Can approve or reject registrations
5. Can provide rejection reasons
6. Approved suppliers get Company record created

### Supplier Login Workflow (After Approval)
1. Supplier tries to login
2. System checks if status='approved'
3. Password verified with bcrypt
4. JWT token generated (valid 24 hours)
5. Token stored in localStorage
6. Redirected to dashboard

---

## Security Notes

⚠️ **For Development Only:**
- Admin credentials are hardcoded (admin/admin@123)
- Change these in production!
- JWT secret should be strong and unique
- Store secrets in environment variables

✅ **What's Already Secure:**
- Passwords hashed with bcrypt
- Password never logged or returned in responses
- JWT token expiry (24 hours)
- Email validation
- Password strength requirements

---

## Next Steps

After confirming everything works:

1. **Customize Admin Credentials:** Update AdminLogin.jsx with proper authentication
2. **Add Email Notifications:** Send emails on registration, approval, rejection
3. **Implement Document Upload:** For supplier verification
4. **Add Role-Based Access:** Different permission levels
5. **Production Deployment:** Set proper environment variables, use HTTPS

---

## Helpful Links

- **Supabase Docs:** https://supabase.com/docs
- **React Router:** https://reactrouter.com/docs
- **Express.js:** https://expressjs.com
- **Bcrypt:** https://github.com/kelektiv/node.bcrypt.js
- **JWT:** https://jwt.io

---

## Support

For issues or questions:
1. Check REGISTRATION_SYSTEM_DOCS.md for detailed documentation
2. Verify all environment variables are set
3. Check browser console for error messages
4. Check server console for backend errors
5. Ensure Supabase table exists with correct schema

Happy testing! 🚀
