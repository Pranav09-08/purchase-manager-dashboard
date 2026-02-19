# Admin Authentication - Quick Reference

## 📌 Quick Setup (5 minutes)

```bash
# 1. Execute SQL schema in Supabase console
#    Copy content from: SQL_SCHEMA_ADMIN.sql

# 2. Set environment variable
echo "JWT_SECRET=your-secret-key-12345" >> backend/.env

# 3. Restart backend
cd backend && npm start

# 4. Test login at: http://localhost:5173/admin/login
#    Username: admin
#    Password: admin@123
```

---

## 📊 Database Schema Quick View

```
purchase_admin
├── admin_id (UUID) - Primary key
├── username (VARCHAR) - Unique login
├── email (VARCHAR) - Unique email
├── password_hash (VARCHAR) - Bcrypt hashed
├── full_name (VARCHAR)
├── company_name (VARCHAR)
├── role (VARCHAR) - purchase_manager | super_admin
├── status (VARCHAR) - active | inactive | suspended
├── department (VARCHAR)
├── phone (VARCHAR)
├── permissions (JSONB) - Array of permission strings
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── last_login (TIMESTAMP)

admin_audit_log
├── log_id (UUID)
├── admin_id (UUID) - Foreign key
├── action (VARCHAR)
├── entity_type (VARCHAR)
├── entity_id (VARCHAR)
├── details (JSONB)
└── created_at (TIMESTAMP)
```

---

## 🔐 API Endpoints

### Public
```
POST /api/auth/admin-login
├─ Body: { username, password }
└─ Returns: { token, admin }
```

### Protected (Require Admin JWT)
```
GET  /api/auth/admins
POST /api/auth/admins
PUT  /api/auth/admins/:adminId
PUT  /api/auth/admins/:adminId/password
DELETE /api/auth/admins/:adminId
```

---

## 🎫 JWT Token

```javascript
{
  admin_id: "UUID",
  username: "string",
  email: "string",
  role: "string",
  type: "admin",
  iat: timestamp,
  exp: timestamp + 24h
}
```

---

## 💻 Example Code: Frontend

### Login
```jsx
const response = await fetch('/api/auth/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const { token, admin } = await response.json();
localStorage.setItem('adminToken', token);
```

### Authenticated Request
```javascript
const token = localStorage.getItem('adminToken');
const response = await fetch('/api/auth/registrations', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 💻 Example Code: Backend

### Protect a Route
```javascript
router.get('/api/auth/registrations', 
  authController.authenticateToken,  // Middleware
  authController.getRegistrationRequests  // Handler
);
```

### Access User Info
```javascript
app.get('/protected', authenticateToken, (req, res) => {
  console.log(req.user.admin_id);  // Admin ID
  console.log(req.user.role);      // Role
  res.json({ user: req.user });
});
```

---

## 🔄 Default Admin

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin@123` |
| Email | `admin@example.com` |
| Role | `super_admin` |
| Status | `active` |

> ⚠️ Change password immediately after first login!

---

## 🛠️ Common Tasks

### Create New Admin
```bash
curl -X POST http://localhost:3000/api/auth/admins \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "email": "newadmin@company.com",
    "password": "SecurePass123",
    "full_name": "New Admin",
    "role": "purchase_manager"
  }'
```

### Change Password
```bash
curl -X PUT http://localhost:3000/api/auth/admins/:adminId/password \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass",
    "newPassword": "newpass"
  }'
```

### List All Admins
```bash
curl -X GET http://localhost:3000/api/auth/admins \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails with "Invalid username or password" | Check credentials, verify admin exists in DB |
| "Access token required" | Token not in localStorage or header format wrong |
| "Invalid or expired token" | JWT signature invalid or token expired |
| Routes return 401 | Missing `authenticateToken` middleware |
| Password hash mismatch | Use bcrypt for hashing, never store plaintext |

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `SQL_SCHEMA_ADMIN.sql` | Database tables |
| `adminAuthController.js` | Login/admin CRUD logic |
| `authRoutes.js` | API endpoints |
| `authController.js` | Auth middleware |
| `AdminLogin.jsx` | Frontend login page |
| `AdminPanel.jsx` | Dashboard (uses getAuthHeaders) |

---

## ✅ Verification Steps

```bash
# 1. Check table exists
SELECT * FROM purchase_admin LIMIT 1;

# 2. Check default admin user
SELECT username, role, status FROM purchase_admin 
WHERE username = 'admin';

# 3. Test admin login endpoint
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'

# 4. Copy token from response
# 5. Test protected endpoint
curl -X GET http://localhost:3000/api/auth/registrations \
  -H "Authorization: Bearer <PASTE_TOKEN_HERE>"
```

---

## 🔑 Environment Variables

```bash
# Required in backend/.env
JWT_SECRET=your-very-secret-key-that-is-unique-and-long

# Optional (for audit logging)
ADMIN_AUDIT_ENABLED=true
```

---

## 💡 Tips

- Use UUID for admin_id (auto-generated in DB)
- Store permissions as JSON array: `["create_enquiry", "approve_vendor"]`
- Always hash passwords with bcrypt (salt: 10)
- JWT tokens expire after 24 hours
- Check `req.user.type === 'admin'` for role verification
- Use `req.user.permissions` for permission checks
- Last login helps track active admins
- Status field allows account suspension without deletion

---

## 🚫 Don't Forget

- [ ] Execute SQL schema
- [ ] Set JWT_SECRET in .env
- [ ] Restart backend server
- [ ] Test admin login
- [ ] Change default password
- [ ] Create process for new admins
- [ ] Document admin procedures
- [ ] Set up backup/recovery process
