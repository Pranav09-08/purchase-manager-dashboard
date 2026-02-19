# Supplier Dashboard - Registration System Documentation

## Overview
This is a complete supplier registration and approval workflow system with admin panel integration.

## Features

### 1. Supplier Registration
- Suppliers can create an account with company information
- Password encryption using bcrypt
- Form validation for all required fields
- Registration creates a pending request that awaits admin approval

### 2. Admin Approval Workflow
- Admin can view all pending registration requests
- Admin can approve or reject registrations
- Admin can provide rejection reasons
- Approved registrations are converted to active supplier accounts

### 3. Supplier Login
- Suppliers can only login after admin approval
- JWT token-based authentication
- Session management using localStorage
- Automatic redirect to login if not authenticated

### 4. Supplier Dashboard
- Protected dashboard accessible only to approved suppliers
- Displays supplier information
- Quick action buttons for common tasks

---

## System Architecture

### Backend Structure

#### Database Tables
The system uses Supabase with the following table:

**SupplierRegistration Table**
- `supplier_id` (UUID, Primary Key)
- `company_name` (String, Required)
- `company_tin` (String, Optional)
- `address` (String, Optional)
- `contact_person` (String, Optional)
- `contact_email` (String, Required, Unique)
- `contact_phone` (String, Optional)
- `company_website` (String, Optional)
- `password` (String, Required, Hashed)
- `status` (Enum: 'pending', 'approved', 'rejected')
- `rejection_reason` (String, Optional)
- `created_at` (Timestamp)
- `approved_at` (Timestamp, Optional)

#### API Endpoints

**Authentication Routes** (`/api/auth/*`)

```
POST   /auth/register              Register new supplier
POST   /auth/login                 Login supplier
GET    /auth/registrations         Get all registrations (Admin)
GET    /auth/registrations/:id     Get single registration
PUT    /auth/registrations/:id/approve   Approve registration
PUT    /auth/registrations/:id/reject    Reject registration
```

#### Controllers
- **authController.js**: Handles all authentication and registration logic
  - `registerSupplier()`: Creates new registration request
  - `loginSupplier()`: Authenticates supplier
  - `getRegistrationRequests()`: Fetches registrations (with optional status filter)
  - `getRegistrationRequest()`: Fetches single registration
  - `approveRegistration()`: Approves supplier registration
  - `rejectRegistration()`: Rejects supplier registration

#### Dependencies (Backend)
```json
{
  "@supabase/supabase-js": "^2.93.3",
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5",
  "dotenv": "^16.6.1",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.1.2",
  "uuid": "^9.0.1"
}
```

---

### Frontend Structure

#### Pages/Components

1. **Login.jsx** (`/login`)
   - Supplier login form
   - Email and password validation
   - Token storage and redirect to dashboard
   - Links to register and admin login

2. **Register.jsx** (`/register`)
   - Comprehensive registration form
   - Company and contact information fields
   - Password strength validation (min 8 characters)
   - Password confirmation matching
   - Submission feedback with redirect to login

3. **AdminLogin.jsx** (`/admin-login`)
   - Simple admin authentication
   - Demo credentials provided (admin/admin@123)
   - Redirect to admin panel on success

4. **AdminPanel.jsx** (`/admin`)
   - Dashboard for managing registrations
   - Filter registrations by status (Pending, Approved, Rejected)
   - View detailed registration information
   - Approve/reject actions with confirmation
   - Rejection reason modal

5. **Dashboard.jsx** (`/dashboard`)
   - Supplier dashboard (protected route)
   - Displays supplier information
   - Quick action buttons for future features
   - Logout functionality

#### Stylesheets
- **Auth.css**: Login and registration pages styling
- **AdminPanel.css**: Admin panel and modal styling
- **Dashboard.css**: Supplier dashboard styling

#### Dependencies (Frontend)
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^6.20.0"
}
```

---

## User Workflows

### Supplier Registration Flow
```
1. Supplier visits /register
2. Fills registration form with company details
3. System validates form data
4. Password is hashed using bcrypt
5. Registration created with status = 'pending'
6. Supplier redirected to login page
7. Supplier waits for admin approval
8. Admin approves/rejects registration
```

### Supplier Login Flow
```
1. Supplier visits /login
2. Enters email and password
3. System checks if status = 'approved'
4. Password verified using bcrypt comparison
5. JWT token generated (24h expiry)
6. Token and supplier info stored in localStorage
7. Redirected to /dashboard
```

### Admin Management Flow
```
1. Admin visits /admin-login
2. Enters admin credentials (admin/admin@123)
3. Redirected to /admin panel
4. Views pending registrations
5. Can filter by status (Pending, Approved, Rejected)
6. Can view full details of each registration
7. Can approve registration → creates Company record
8. Can reject registration with optional reason
```

---

## Installation & Setup

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Create the `SupplierRegistration` table in Supabase with the schema above.

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the application at `http://localhost:5173`

---

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secret-key-for-jwt
PORT=3000
```

### Frontend (if needed)
The frontend uses relative URLs (http://localhost:3000) for API calls.
Update this in component files if your backend URL is different.

---

## Security Considerations

1. **Password Security**
   - Passwords hashed with bcrypt (salt rounds: 10)
   - Never stored in plain text
   - Never returned in API responses

2. **Authentication**
   - JWT tokens with 24-hour expiration
   - Tokens stored in localStorage
   - Protected routes check for token presence

3. **Admin Access**
   - Demo admin credentials (change in production)
   - Should implement proper admin authentication
   - Consider role-based access control (RBAC)

4. **API Security**
   - CORS enabled for local development
   - Validate all input data
   - No sensitive data in URLs
   - SQL injection protection via Supabase ORM

---

## Future Enhancements

1. **Email Notifications**
   - Send registration confirmation
   - Notify on approval/rejection
   - Supplier approval email

2. **Advanced Admin Features**
   - Proper admin user management
   - Audit logs
   - Email templates
   - Bulk operations

3. **Supplier Features**
   - Edit profile information
   - Change password
   - Delete account
   - Two-factor authentication

4. **Data Validation**
   - Email verification
   - Phone number validation
   - Company registration verification
   - Document upload for verification

5. **Analytics**
   - Registration metrics
   - Supplier performance tracking
   - Dashboard statistics

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Ensure `.env` file exists in backend directory
- Check SUPABASE_URL and SUPABASE_ANON_KEY are set correctly

### Issue: CORS error when calling API
- Ensure backend is running on http://localhost:3000
- Check CORS is enabled in server.js

### Issue: Password hashing errors
- Ensure bcrypt package is installed
- Check Node.js version compatibility

### Issue: JWT token errors
- Verify JWT_SECRET is set in .env
- Check token expiry time
- Clear localStorage and login again

---

## Testing the System

### Test Supplier Registration
1. Go to http://localhost:5173/register
2. Fill in all required fields
3. Click Register
4. Should see success message

### Test Admin Approval
1. Go to http://localhost:5173/admin-login
2. Use credentials: admin / admin@123
3. View pending registrations
4. Approve a registration

### Test Supplier Login
1. Go to http://localhost:5173/login
2. Use registered email and password
3. Should redirect to /dashboard
4. Should see supplier information

---

## File Structure Summary

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js (NEW)
│   ├── routes/
│   │   └── authRoutes.js (NEW)
│   └── server.js (UPDATED)
└── package.json (UPDATED)

frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx (NEW)
│   │   ├── Register.jsx (NEW)
│   │   ├── AdminLogin.jsx (NEW)
│   │   ├── Dashboard.jsx (NEW)
│   │   └── AdminPanel.jsx (NEW)
│   ├── styles/
│   │   ├── Auth.css (NEW)
│   │   ├── AdminPanel.css (NEW)
│   │   └── Dashboard.css (NEW)
│   └── App.jsx (UPDATED)
└── package.json (UPDATED)
```

---

## API Response Examples

### Register Success
```json
{
  "message": "Registration request submitted successfully. Please wait for admin approval.",
  "supplier_id": "uuid-here"
}
```

### Register Error
```json
{
  "error": "Email already registered"
}
```

### Login Success
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "supplier": {
    "supplier_id": "uuid",
    "company_name": "Company Name",
    "contact_email": "email@example.com"
  }
}
```

### Login Error (Not Approved)
```json
{
  "error": "Your registration is pending. Please wait for admin approval."
}
```

### Get Registrations (Admin)
```json
[
  {
    "supplier_id": "uuid",
    "company_name": "Company Name",
    "contact_email": "email@example.com",
    "status": "pending",
    "created_at": "2025-02-03T10:00:00Z"
  }
]
```

---

## Support & Documentation
For more information about Supabase, refer to: https://supabase.com/docs
For React Router documentation: https://reactrouter.com/docs
For Express.js: https://expressjs.com/docs
