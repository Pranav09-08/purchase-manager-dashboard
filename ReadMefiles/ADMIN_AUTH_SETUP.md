# Admin Login Implementation Guide

## Overview
This document explains the new proper admin authentication system using a database table and JWT tokens.

---

## 1. Database Setup

### Create the Admin Table
Execute the SQL script provided in `SQL_SCHEMA_ADMIN.sql`:

```sql
-- Create purchase_admin table
CREATE TABLE IF NOT EXISTS purchase_admin (
  admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'purchase_manager', -- purchase_manager, super_admin
  status VARCHAR(50) DEFAULT 'active',
  department VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  permissions JSONB DEFAULT '[]'::jsonb
);

-- Create admin audit log table (optional)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES purchase_admin(admin_id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Default Admin Credentials
After creating the table, the following default admin is inserted:
- **Username:** `admin`
- **Password:** `admin@123`
- **Role:** `super_admin`
- **Email:** `admin@example.com`

> ⚠️ **Important:** Change these credentials immediately after first login!

---

## 2. Backend Implementation

### Admin Auth Controller
**Location:** `backend/src/controllers/adminAuthController.js`

Provides the following functions:
- `loginAdmin()` - API endpoint for admin login
- `getAllAdmins()` - List all admins (Super Admin only)
- `createAdmin()` - Create new admin user
- `updateAdmin()` - Update admin profile
- `changeAdminPassword()` - Change password
- `deleteAdmin()` - Delete admin
- `logAdminAction()` - Audit logging

### Updated Auth Routes
**Location:** `backend/src/routes/authRoutes.js`

New endpoints:
```javascript
// Public route
POST   /api/auth/admin-login

// Management routes (authenticated)
GET    /api/auth/admins
POST   /api/auth/admins
PUT    /api/auth/admins/:adminId
PUT    /api/auth/admins/:adminId/password
DELETE /api/auth/admins/:adminId

// Vendor registration routes (protected)
GET    /api/auth/registrations
GET    /api/auth/registrations/:id
PUT    /api/auth/registrations/:id/approve
PUT    /api/auth/registrations/:id/reject
PUT    /api/auth/registrations/:id/certificate
```

### Updated Auth Middleware
**Location:** `backend/src/controllers/authController.js`

The `authenticateToken` middleware now:
- Validates JWT tokens for both admins and vendors
- Removed hardcoded token prefix checking
- Properly decodes user information from JWT payload
- Sets `req.user` with either `admin_id` or `vendor_id`

---

## 3. Frontend Implementation

### Updated AdminLogin Component
**Location:** `frontend/src/pages/AdminLogin.jsx`

**Changes:**
- ✅ Removed hardcoded credentials
- ✅ Added API call to `/api/auth/admin-login`
- ✅ Stores JWT token in localStorage
- ✅ Stores admin profile information
- ✅ Proper error handling

**Flow:**
```jsx
1. User enters username and password
2. POST request to /api/auth/admin-login
3. Backend verifies credentials
4. Returns JWT token if valid
5. Store token and admin info in localStorage
6. Redirect to /admin/dashboard
```

**API Call:**
```javascript
const response = await fetch(apiUrl('/api/auth/admin-login'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: formData.username,
    password: formData.password,
  }),
});
```

### AdminPanel Authentication
**Location:** `frontend/src/pages/AdminPanel.jsx`

The existing `getAuthHeaders()` function already handles the new JWT token:
```javascript
const getAuthHeaders = () => {
  const adminToken = localStorage.getItem('adminToken');
  const vendorToken = localStorage.getItem('token');
  const token = adminToken || vendorToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
```

**Note:** No changes needed here - it works seamlessly with JWT tokens!

---

## 4. Authentication Flow

### Login Flow
```
┌──────────────────┐
│ AdminLogin Page  │ User enters credentials
└────────┬─────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │ POST /api/auth/admin-login          │
    │ { username, password }              │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Backend: adminAuthController        │
    │ 1. Find admin by username           │
    │ 2. Check if status is 'active'      │
    │ 3. Verify password (bcrypt)         │
    │ 4. Update last_login timestamp      │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Generate JWT Token                  │
    │ Payload: {                          │
    │   admin_id: UUID,                   │
    │   username: string,                 │
    │   role: string,                     │
    │   type: 'admin'                     │
    │ }                                   │
    │ Expires: 24 hours                   │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Return Response:                    │
    │ {                                   │
    │   token: JWT,                       │
    │   admin: {...}                      │
    │ }                                   │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Store in localStorage:              │
    │ - adminToken: JWT                   │
    │ - adminUser: {admin details}        │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Redirect to          │
    │ /admin/dashboard     │
    └──────────────────────┘
```

### Request Authorization Flow
```
┌─────────────────────┐
│ AdminPanel API Call │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ getAuthHeaders()                │
│ Returns:                        │
│ {                               │
│   Authorization:                │
│   'Bearer <JWT_TOKEN>'          │
│ }                               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ API Request with Header         │
│ GET /api/auth/registrations     │
│ Header: Authorization: Bearer...│
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend authenticateToken()     │
│ 1. Extract token from header    │
│ 2. Verify JWT signature         │
│ 3. Decode payload               │
│ 4. Set req.user with decoded    │
│    information                  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Route Handler       │
│ (Request Allowed)   │
└─────────────────────┘
```

---

## 5. JWT Token Structure

### Admin Token
```javascript
{
  admin_id: "550e8400-e29b-41d4-a716-446655440000",
  username: "admin",
  email: "admin@example.com",
  role: "super_admin",
  type: "admin",
  iat: 1708194000,        // issued at
  exp: 1708280400         // expires in 24 hours
}
```

### Vendor Token
```javascript
{
  vendor_id: "e4decf52-90a2-41c5-b7aa-553bba5d6807",
  contact_email: "vendor@example.com",
  company_name: "Company Name",
  iat: 1708194000,
  exp: 1708280400
}
```

---

## 6. API Endpoint Examples

### Admin Login
```bash
POST /api/auth/admin-login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin@123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "admin_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Administrator",
    "company_name": "Custom Soft",
    "role": "super_admin",
    "permissions": ["create_enquiry", "approve_vendor", ...]
  }
}
```

### Protected Route (e.g., Get Registrations)
```bash
GET /api/auth/registrations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "data": [...]
}
```

### Create New Admin (Super Admin Only)
```bash
POST /api/auth/admins
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "username": "manager1",
  "email": "manager1@example.com",
  "password": "SecurePassword123",
  "full_name": "John Manager",
  "role": "purchase_manager",
  "department": "Procurement",
  "permissions": ["create_enquiry", "view_analytics"]
}
```

### Change Password
```bash
PUT /api/auth/admins/:adminId/password
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "currentPassword": "admin@123",
  "newPassword": "NewSecurePassword456"
}
```

---

## 7. Security Features

✅ **Password Hashing:** Bcrypt with salt rounds 10  
✅ **JWT Expiration:** 24 hours  
✅ **Account Status:** Active/Inactive/Suspended  
✅ **Audit Logging:** Track all admin actions  
✅ **Last Login Tracking:** Recorded on successful login  
✅ **Permissions:** Support for granular permissions  
✅ **Unique Credentials:** Username and email unique constraints  

---

## 8. Migration Checklist

- [ ] Execute SQL schema to create `purchase_admin` table
- [ ] Verify default admin user created
- [ ] Update `.env` - Ensure JWT_SECRET is set
- [ ] Install backend dependencies (bcrypt, jwt already included)
- [ ] Restart backend server
- [ ] Test admin login via AdminLogin page
- [ ] Verify API calls work with new JWT token
- [ ] Change default admin password
- [ ] Create additional admin users as needed

---

## 9. Troubleshooting

### Login Fails with "Invalid username or password"
- Check username and password are correct
- Verify admin user exists in `purchase_admin` table
- Check admin status is 'active'

### "Access token required" error
- Ensure token is stored in localStorage as `adminToken`
- Check Authorization header format: `Bearer <TOKEN>`
- Verify JWT_SECRET is set in backend environment

### Token Expired
- Default expiration is 24 hours
- User needs to log in again
- Consider implementing refresh token endpoint if needed

### Admin Can't Access Routes
- Verify admin has `type: 'admin'` in JWT payload
- Check route uses `authenticateToken` middleware
- Review admin role and permissions

---

## 10. Future Enhancements

- [ ] Implement refresh tokens for extended sessions
- [ ] Add role-based access control (RBAC)
- [ ] Implement two-factor authentication (2FA)
- [ ] Add session management UI
- [ ] Create admin management dashboard
- [ ] Implement more granular permissions system
- [ ] Add brute-force protection
- [ ] Send password reset emails
