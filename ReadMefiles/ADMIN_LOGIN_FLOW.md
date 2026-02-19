# Admin Login Flow Documentation

## Overview
The admin login is a **local/hardcoded authentication** system (not database-based like vendor login). It's designed for the Purchase Manager to access the admin dashboard.

---

## Frontend Flow: AdminLogin.jsx

**Location:** `frontend/src/pages/AdminLogin.jsx`

### Process:
1. **Form Submission** - Admin enters username and password
2. **Local Validation** - Credentials checked LOCALLY in the frontend (no API call)
3. **Token Generation** - If credentials match, a token is generated locally
4. **Storage** - Stores token and user info in localStorage
5. **Redirect** - Navigate to `/admin/dashboard`

### Hardcoded Credentials:
```javascript
DEFAULT_ADMIN_USERNAME = 'admin'
DEFAULT_ADMIN_PASSWORD = 'admin@123'
DEFAULT_ADMIN_COMPANY = 'Custom Soft'
```

### LocalStorage Keys Set:
- `adminToken`: `'admin-token-' + Date.now()` (timestamp-based unique token)
- `adminUser`: JSON object with username and company_name

### Code:
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const DEFAULT_ADMIN_USERNAME = 'admin';
  const DEFAULT_ADMIN_PASSWORD = 'admin@123';
  const DEFAULT_ADMIN_COMPANY = 'Custom Soft';

  if (
    formData.username === DEFAULT_ADMIN_USERNAME &&
    formData.password === DEFAULT_ADMIN_PASSWORD
  ) {
    localStorage.setItem('adminToken', 'admin-token-' + Date.now());
    localStorage.setItem('adminUser', JSON.stringify({
      username: DEFAULT_ADMIN_USERNAME,
      company_name: DEFAULT_ADMIN_COMPANY,
    }));
    navigate('/admin/dashboard');
  } else {
    setError('Invalid admin credentials');
  }
};
```

---

## Backend: No Dedicated Admin Login API

**Important:** There is **NO backend API endpoint** for admin login!

The authentication routes only handle:
- `POST /api/auth/register` - Vendor registration
- `POST /api/auth/login` - Vendor login (supplier)
- `GET /api/auth/registrations` - Get vendor requests (uses admin token for auth)
- `PUT /api/auth/registrations/:id/approve` - Approve vendor
- `PUT /api/auth/registrations/:id/reject` - Reject vendor

---

## Backend Token Authentication: authenticateToken Middleware

**Location:** `backend/src/controllers/authController.js`

### Purpose:
Middleware that validates tokens for protected routes.

### How It Works:
1. Extracts Bearer token from `Authorization` header
2. **Special Case for Admin:** If token starts with `'admin-token-'`, it's accepted (frontend token)
3. **For Vendor:** Verifies JWT signature with `process.env.JWT_SECRET`

### Code:
```javascript
exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Allow admin token from frontend admin login for purchase manager UI
    if (token.startsWith('admin-token-')) {
      req.user = { vendor_id: 'admin' };
      return next();
    }

    // Verify JWT for vendor tokens
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## API Routes Protected by Admin Token

All these routes use the `authenticateToken` middleware:

### Purchase Enquiries (Admin Creates):
- `POST /api/purchase/enquiry` 
- `PUT /api/purchase/enquiry/:enquiryId`
- `DELETE /api/purchase/enquiry/:enquiryId`

### Quotations (Admin Reviews):
- `POST /api/purchase/quotation`
- Modified with PM token

### Registration Management:
- `GET /api/auth/registrations` - List vendor requests
- `POST /api/auth/registrations/:id/approve` - Approve vendor
- `POST /api/auth/registrations/:id/reject` - Reject vendor

### Expected Request Header:
```
Authorization: Bearer admin-token-1708...
```

Example:
```javascript
const token = localStorage.getItem('adminToken');
fetch('/api/purchase/enquiries', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────┐
│  Admin Login Page (AdminLogin.jsx)  │
│                                     │
│  Input: username, password          │
└──────────────┬──────────────────────┘
               │
               ▼ (CLIENT-SIDE VALIDATION)
        ┌──────────────────┐
        │ Hardcoded Check  │
        │ admin / admin@123│
        └────────┬─────────┘
                 │
        ┌────────▼────────┐
        │ Generate Token  │
        │ admin-token-*   │
        └────────┬────────┘
                 │
        ┌────────▼────────────────┐
        │ Store in localStorage   │
        │ - adminToken            │
        │ - adminUser             │
        └────────┬────────────────┘
                 │
        ┌────────▼────────────┐
        │ Redirect to         │
        │ /admin/dashboard    │
        └─────────────────────┘


┌──────────────────────────────────────────┐
│  All API Requests Include Token:         │
│  Authorization: Bearer admin-token-*     │
└──────────────┬───────────────────────────┘
               │
      ┌────────▼─────────────────────┐
      │ authenticateToken Middleware │
      │                              │
      │ Check if token starts with   │
      │ 'admin-token-'               │
      │                              │
      │ Yes → req.user = {id: 'admin'}
      │ No  → Verify JWT             │
      └────────┬─────────────────────┘
               │
      ┌────────▼──────────┐
      │ Request Allowed   │
      │ (API executes)    │
      └───────────────────┘
```

---

## Key Points

✅ **Admin Token Format:** `admin-token-{timestamp}`  
✅ **Frontend Only:** No server-side verification needed  
✅ **No Database Check:** Credentials are hardcoded  
✅ **Development Only:** This approach is suitable for testing/development  
✅ **Special Handling:** Backend middleware has a specific check for `admin-token-`  
❌ **Security Issue:** Hardcoded credentials not suitable for production  

---

## Security Notes

⚠️ **For Production:**
- Admin credentials should be moved to environment variables
- Consider implementing proper JWT-based admin authentication
- Add rate limiting for login attempts
- Use secure password hashing
- Implement session timeout
- Add audit logging for admin actions
