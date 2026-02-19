# System Architecture & Flow Diagrams

## 1. User Registration & Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPPLIER REGISTRATION FLOW                    │
└─────────────────────────────────────────────────────────────────┘

     SUPPLIER                          SYSTEM                    ADMIN
         │                               │                        │
         │                               │                        │
    1.   │─── Navigate to /register ──→ │                        │
         │                               │                        │
    2.   │─── Fill Registration Form ──→ │                        │
         │ (company, email, password)    │                        │
         │                               │                        │
    3.   │─── Submit Form ──────────────→│                        │
         │                               │                        │
         │                      Validate Data                      │
         │                      Hash Password (Bcrypt)             │
         │                      Create SupplierRegistration Record │
         │                      Set status = 'pending'             │
         │                               │                        │
    4.   │← Success Message ─────────────│                        │
         │   (Wait for approval)         │                        │
         │                               │                        │
         │                 ┌─────────────┴─────────┐              │
         │                 │ PENDING STATUS        │              │
         │                 │ (Awaiting Approval)   │              │
         │                 └─────────────┬─────────┘              │
         │                               │                        │
         │                               │                        │
         │                               │        ← View Pending ──│
         │                               │                        │
         │                               │     Admin Reviews ←────│
         │                               │                        │
         │                    ┌──────────┴──────────┐              │
         │                    │                     │              │
    5a.  │← APPROVED ← ────── ├─ Approve ───────────│→ APPROVE    │
         │   (Can login now)   │                     │              │
         │                     │                     │              │
    5b.  │← REJECTED ← ────── ├─ Reject ────────────│→ REJECT     │
         │   (Cannot login)    │  (+ reason)         │  (+ reason)  │
         │                     │                     │              │
         └─────────────────────┴─────────────────────┴──────────────┘
```

---

## 2. Authentication & Login Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                     SUPPLIER LOGIN FLOW                              │
└──────────────────────────────────────────────────────────────────────┘

   SUPPLIER                    SYSTEM                      DATABASE
       │                         │                            │
       │                         │                            │
   1.  │─ /login page ─────────→ │                            │
       │                         │                            │
   2.  │─ Email & Password ────→ │                            │
       │                         │                            │
       │                 ┌───────┴────────┐                   │
       │                 │  Check Status  │                   │
       │                 │  if pending ──────→ ❌ REJECTED    │
       │                 │  if rejected ──────→ ❌ REJECTED    │
       │                 │  if approved ──────→ ✓ CONTINUE    │
       │                 └───────┬────────┘                   │
       │                         │                            │
       │                 Query Email ────────────────────────→│
       │                         │←────── Get User Record ─────│
       │                         │                            │
       │                 Verify Password                       │
       │                 (bcrypt.compare)                      │
       │                         │                            │
       │            ┌────────────┴────────────┐               │
       │            │                         │               │
   3a. │ VALID   ←──┼─ Generate JWT Token ───│               │
       │ TOKEN      │ (24h expiry)            │               │
       │            │                         │               │
   3b. │ ERROR   ←──┼─ Invalid Credentials ───│               │
       │            │                         │               │
       │            └─────────────────────────┘               │
       │                         │                            │
   4.  │← Token & Supplier Info ─│                            │
       │   (Store in localStorage)                            │
       │                         │                            │
   5.  │─ Redirect to /dashboard │                            │
       │                         │                            │
       └─────────────────────────┴────────────────────────────┘
```

---

## 3. Admin Panel Management Flow

```
┌───────────────────────────────────────────────────────────────┐
│              ADMIN REGISTRATION MANAGEMENT FLOW                │
└───────────────────────────────────────────────────────────────┘

     ADMIN                       SYSTEM                     DATABASE
      │                            │                          │
  1.  │─ /admin-login ───────────→ │                          │
      │                            │                          │
  2.  │─ Username & Password ────→ │                          │
      │   (admin / admin@123)       │                          │
      │                            │                          │
      │                  Verify Credentials                   │
      │                  Generate Admin Token                 │
      │                            │                          │
  3.  │← Token Generated ──────────│                          │
      │   Redirect to /admin        │                          │
      │                            │                          │
  4.  │─ View Registrations ──────→ │  Query ──────────────→  │
      │                            │←─ Return all regs ────   │
      │                            │                          │
      │   ┌─ Click "Pending" Tab ──│  Filter status='pending' │
      │   ├─ Click "Approved" Tab ─│  Filter status='approved'│
      │   └─ Click "Rejected" Tab ─│  Filter status='rejected'│
      │                            │                          │
  5.  │─ Click "View Details" ────→ │                          │
      │   (Opens Modal)             │                          │
      │                            │                          │
      │   ┌────────────────────────┐                          │
      │   │ Registration Details   │                          │
      │   │ ─────────────────────  │                          │
      │   │ Company: ACME Inc      │                          │
      │   │ Contact: John Doe      │                          │
      │   │ Email: john@acme.com   │                          │
      │   │ Phone: +1-234-567-8900 │                          │
      │   │ Status: pending        │                          │
      │   │                        │                          │
      │   │ [Approve] [Reject]     │                          │
      │   └────────────────────────┘                          │
      │                            │                          │
  6a. │─ Click "Approve" ─────────→ │  Update Status ────────→│
      │   Confirm                   │  Create Company Record  │
      │                            │                          │
      │                  ✓ APPROVED                           │
      │                  Supplier can now login               │
      │                            │                          │
  6b. │─ Click "Reject" ──────────→ │  Modal: Rejection Reason│
      │   Enter reason              │                          │
      │   Confirm                   │  Update Status ────────→│
      │                            │  Save rejection_reason   │
      │                            │                          │
      │                  ✗ REJECTED                           │
      │                  Supplier cannot login                │
      │                            │                          │
  7.  │← Updated List ─────────────│←─ Updated Registrations  │
      │   (Modal closes)            │                          │
      │                            │                          │
      └────────────────────────────┴──────────────────────────┘
```

---

## 4. Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│          SUPABASE - SupplierRegistration Table              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Column Name          │ Type      │ Constraints             │
│  ──────────────────────────────────────────────────────────│
│  supplier_id          │ UUID      │ PRIMARY KEY             │
│  company_name         │ VARCHAR   │ NOT NULL                │
│  company_tin          │ VARCHAR   │ NULLABLE                │
│  address              │ TEXT      │ NULLABLE                │
│  contact_person       │ VARCHAR   │ NULLABLE                │
│  contact_email        │ VARCHAR   │ NOT NULL, UNIQUE        │
│  contact_phone        │ VARCHAR   │ NULLABLE                │
│  company_website      │ VARCHAR   │ NULLABLE                │
│  password             │ VARCHAR   │ NOT NULL (HASHED)       │
│  status               │ ENUM      │ pending/approved/       │
│                       │           │ rejected                │
│  rejection_reason     │ TEXT      │ NULLABLE                │
│  created_at           │ TIMESTAMP │ DEFAULT NOW()           │
│  approved_at          │ TIMESTAMP │ NULLABLE                │
│                                                             │
│  INDEXES:                                                  │
│  ├─ idx_email (contact_email)                              │
│  ├─ idx_status (status)                                    │
│  └─ idx_created_at (created_at DESC)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. API Request/Response Flow

```
┌──────────────────────────────────────────────────────────────┐
│              API ENDPOINTS & DATA FLOW                       │
└──────────────────────────────────────────────────────────────┘

CLIENT                          BACKEND                    DATABASE
  │                               │                          │
  │                               │                          │
  │ 1. REGISTER                   │                          │
  │─── POST /api/auth/register ──→│                          │
  │    {                           │                          │
  │     company_name,             │                          │
  │     contact_email,            │                          │
  │     password,                 │                          │
  │     ...other fields           │                          │
  │    }                           │                          │
  │                         Hash Password                     │
  │                         Validate Input                    │
  │                         INSERT ────────────────────────→ │
  │                         status='pending'                 │
  │                               │←─ Record Created ────────│
  │← 201 Created                  │                          │
  │   {message, supplier_id}       │                          │
  │                               │                          │
  │                               │                          │
  │ 2. LOGIN                      │                          │
  │─── POST /api/auth/login ─────→│                          │
  │    {                           │                          │
  │     contact_email,            │                          │
  │     password                  │                          │
  │    }                           │                          │
  │                         Query Email ───────────────────→ │
  │                               │←─ Get User Record ──────│
  │                         Check Status                    │
  │                         Verify Password                 │
  │                         Generate JWT Token              │
  │← 200 OK                       │                          │
  │   {                            │                          │
  │    token,                      │                          │
  │    supplier: {...}            │                          │
  │   }                            │                          │
  │                               │                          │
  │                               │                          │
  │ 3. GET REGISTRATIONS (Admin)  │                          │
  │─── GET /api/auth/registrations ─→│                       │
  │    ?status=pending            │                          │
  │                         Query Records ──────────────────→│
  │                         Filter by Status                │
  │                               │←─ Return Filtered ──────│
  │← 200 OK                       │                          │
  │   [                            │                          │
  │    {supplier_id, company...}, │                          │
  │    {...}                      │                          │
  │   ]                            │                          │
  │                               │                          │
  │                               │                          │
  │ 4. APPROVE REGISTRATION       │                          │
  │─── PUT /api/auth/registrations│                          │
  │     /{id}/approve            │                          │
  │                         UPDATE status ──────────────────→│
  │                         status='approved'               │
  │                         CREATE Company Record           │
  │                               │←─ Updated Record ───────│
  │← 200 OK                       │                          │
  │   {message, data}             │                          │
  │                               │                          │
  │                               │                          │
  │ 5. REJECT REGISTRATION        │                          │
  │─── PUT /api/auth/registrations│                          │
  │     /{id}/reject             │                          │
  │    {reason}                   │                          │
  │                         UPDATE status ──────────────────→│
  │                         status='rejected'               │
  │                         Save reason                     │
  │                               │←─ Updated Record ───────│
  │← 200 OK                       │                          │
  │   {message, data}             │                          │
  │                               │                          │
  └───────────────────────────────┴──────────────────────────┘
```

---

## 6. Component Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                  APP COMPONENT STRUCTURE                     │
└──────────────────────────────────────────────────────────────┘

           <App>
            │
            ├─ <BrowserRouter>
            │   │
            │   └─ <Routes>
            │       │
            │       ├─ "/" → <Login>
            │       │        └─ Form (email, password)
            │       │        └─ Links (register, admin-login)
            │       │
            │       ├─ "/login" → <Login>
            │       │            └─ Same as /
            │       │
            │       ├─ "/register" → <Register>
            │       │               └─ CompanyInfo Form
            │       │               └─ ContactInfo Form
            │       │               └─ CredentialsForm
            │       │
            │       ├─ "/admin-login" → <AdminLogin>
            │       │                 └─ UsernameField
            │       │                 └─ PasswordField
            │       │                 └─ DemoCredentials
            │       │
            │       ├─ "/admin" → <AdminPanel>
            │       │            └─ FilterButtons
            │       │            │  ├─ Pending
            │       │            │  ├─ Approved
            │       │            │  ├─ Rejected
            │       │            │  └─ All
            │       │            │
            │       │            └─ RegistrationsTable
            │       │            │  ├─ CompanyName
            │       │            │  ├─ ContactEmail
            │       │            │  ├─ Status
            │       │            │  └─ ActionButtons
            │       │            │
            │       │            └─ Modals
            │       │               ├─ DetailsModal
            │       │               │  └─ ApproveRejectButtons
            │       │               │
            │       │               └─ RejectReasonModal
            │       │                  └─ TextArea
            │       │
            │       └─ "/dashboard" → <Dashboard>
            │                        └─ SupplierCard
            │                        │  ├─ CompanyInfo
            │                        │  ├─ Email
            │                        │  └─ SupplierId
            │                        │
            │                        └─ ActionsCard
            │                        │  ├─ ViewProducts
            │                        │  ├─ CreateQuotation
            │                        │  ├─ ViewOrders
            │                        │  └─ ManageInventory
            │                        │
            │                        └─ ActivityCard
            │                           └─ RecentActivity
```

---

## 7. Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW                         │
└────────────────────────────────────────────────────────────────┘

SUPPLIER REGISTERS
        │
        ├─→ Validates Email (Unique)
        ├─→ Validates Password (8+ chars)
        ├─→ Hashes Password (bcrypt)
        │
        └─→ Create SupplierRegistration
            status='pending'
            │
            └─→ Stored in Supabase
                │
                ├─→ ADMIN REVIEWS
                │
                ├─→ APPROVE
                │   ├─→ Update status='approved'
                │   ├─→ Create Company record
                │   │
                │   └─→ SUPPLIER LOGS IN
                │       ├─→ Find by email
                │       ├─→ Check status='approved'
                │       ├─→ Verify password
                │       ├─→ Generate JWT
                │       │
                │       └─→ ACCESS DASHBOARD
                │           ├─→ Retrieve supplier info
                │           ├─→ Display company name
                │           └─→ Show quick actions
                │
                └─→ REJECT
                    ├─→ Update status='rejected'
                    ├─→ Store rejection_reason
                    │
                    └─→ SUPPLIER CANNOT LOGIN
                        └─→ Error: "Registration rejected"
```

---

## 8. Security Flow

```
┌────────────────────────────────────────────────────────────────┐
│                     SECURITY MECHANISMS                        │
└────────────────────────────────────────────────────────────────┘

REGISTRATION SECURITY
    │
    ├─ Input Validation
    │  ├─ Email format check (regex)
    │  ├─ Required field validation
    │  ├─ Password length (min 8 chars)
    │  └─ Password confirmation match
    │
    ├─ Data Protection
    │  ├─ Password hashing (bcrypt - 10 rounds)
    │  ├─ Hash stored in database (not plain text)
    │  ├─ Never logged or returned in responses
    │  └─ Salt generation per password
    │
    └─ Database Constraints
       ├─ Email UNIQUE constraint
       ├─ Status ENUM validation
       └─ Timestamp tracking

LOGIN SECURITY
    │
    ├─ Authentication
    │  ├─ Email lookup from database
    │  ├─ Status verification (approved?)
    │  ├─ Password comparison (bcrypt)
    │  └─ Failed attempt handling
    │
    ├─ Token Generation
    │  ├─ JWT token creation
    │  ├─ 24-hour expiration
    │  ├─ Secret key protection
    │  └─ Payload includes supplier info
    │
    └─ Client-side Security
       ├─ localStorage token storage
       ├─ Token verification on each request
       ├─ Auto-logout on token expiry
       └─ Redirect to login on auth failure

ADMIN SECURITY
    │
    └─ Access Control
       ├─ Admin credentials required
       ├─ Token generation for admin
       ├─ Admin-only endpoint access
       └─ Action logging (recommended)
```

---

## 9. Status Transitions

```
┌────────────────────────────────────────────────────────────────┐
│              REGISTRATION STATUS STATE MACHINE                 │
└────────────────────────────────────────────────────────────────┘

                   ┌─────────────────┐
                   │  NEW SUPPLIER   │
                   └────────┬────────┘
                            │
                    Registration Submitted
                            │
                            ▼
                   ┌─────────────────┐
                   │    PENDING      │◄─────────┐
                   │  (Awaiting      │          │
                   │   Approval)     │          │
                   └────────┬────────┘   Can be re-examined
                            │            or resubmitted
                            │
             ┌──────────────┴──────────────┐
             │                             │
      (Approved by Admin)          (Rejected by Admin)
             │                             │
             ▼                             ▼
      ┌─────────────┐          ┌──────────────────┐
      │  APPROVED   │          │    REJECTED      │
      │ (Can login) │          │  (Cannot login)  │
      │             │          │  (Needs reason)  │
      └─────────────┘          └──────────────────┘
             │                          │
             │                          │
      Login Access              No Access
      Supplier Dashboard        Must Reapply

             │
             └─→ Future: Could have status transitions
                 ├─ SUSPENDED
                 ├─ INACTIVE
                 └─ TERMINATED
```

---

## 10. Technology Stack Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                   TECHNOLOGY STACK                          │
└──────────────────────────────────────────────────────────────┘

FRONTEND LAYER
├─ React 19.2.0
│  └─ React Router DOM 6.20.0
│     └─ Components (5 pages + styling)
│
├─ State Management
│  └─ React Hooks (useState, useEffect)
│
├─ Styling
│  └─ CSS3
│     ├─ Auth.css (forms & auth pages)
│     ├─ AdminPanel.css (admin interface)
│     └─ Dashboard.css (supplier dashboard)
│
└─ Communication
   └─ Fetch API
      └─ HTTP Requests to backend


BACKEND LAYER
├─ Node.js + Express 4.18.2
│  └─ Server running on port 3000
│
├─ Controllers
│  └─ authController.js
│     ├─ registerSupplier()
│     ├─ loginSupplier()
│     ├─ getRegistrationRequests()
│     ├─ approveRegistration()
│     └─ rejectRegistration()
│
├─ Routes
│  └─ authRoutes.js
│     └─ 6 endpoints (register, login, get, approve, reject)
│
├─ Security
│  ├─ bcrypt 5.1.1 (password hashing)
│  └─ jsonwebtoken 9.1.2 (JWT auth)
│
└─ Middleware
   ├─ CORS
   └─ Express JSON


DATABASE LAYER
├─ Supabase (PostgreSQL)
│  └─ SupplierRegistration table
│
├─ Connection
│  └─ @supabase/supabase-js SDK
│
├─ Authentication
│  └─ Supabase API keys
│
└─ Features
   ├─ Real-time DB
   ├─ Row Level Security (RLS)
   ├─ Automatic timestamps
   └─ UUID generation


UTILITIES
├─ UUID (v4) - unique IDs
├─ CORS - cross-origin requests
├─ dotenv - environment variables
└─ Nodemon - development auto-reload
```

---

These diagrams provide a visual understanding of how the entire registration system works together. Each flow shows the interaction between users (suppliers/admin), the system (frontend/backend), and the database.

