# ✅ Token Authentication Troubleshooting Guide

## Current Status
- ✅ Token IS stored in localStorage
- ✅ Token IS being sent in Authorization header
- ❌ Backend returning 401 on ALL protected endpoints

This means the issue is in the token transmission or verification on the backend.

## Quick Fix to Try First

### 1. **Restart Backend Server**
The CORS configuration was just updated to explicitly allow Authorization headers:

```bash
cd /Users/pranav/Desktop/supplier-dashboard/backend
npm start
# Kill any existing servers first (Ctrl+C)
```

After restarting, try logging in again and check the console.

### 2. **Debug Using Test Endpoints**

With backend running, open browser console and run:

```javascript
// Test 1: Check if headers reach the server
const response1 = await fetch('http://localhost:3000/api/debug/headers', {
  headers: { 'Authorization': 'Bearer test' }
});
console.log('Headers test:', await response1.json());

// Test 2: Verify JWT_SECRET configuration
const response2 = await fetch('http://localhost:3000/api/debug/env');
console.log('Environment:', await response2.json());

// Test 3: Get your token from localStorage and verify it
const token = localStorage.getItem('adminToken');
const response3 = await fetch('http://localhost:3000/api/debug/verify-jwt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
});
console.log('Token verification:', await response3.json());

// Test 4: Try protected endpoint with your token
const response4 = await fetch('http://localhost:3000/api/debug/test-auth', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log('Protected endpoint test:', await response4.json());
```

## Files Updated for Diagnostics

### Backend Changes:
1. **CORS Configuration** ([backend/src/server.js](backend/src/server.js))
   - ✅ Added explicit Authorization header allowance
   - ✅ Added proper origin whitelist
   - ✅ Set credentials: true

2. **Enhanced Middleware Logging** ([backend/src/controllers/authController.js](backend/src/controllers/authController.js#L377))
   - ✅ Added console logs showing which headers are received
   - ✅ Shows if token extraction succeeds/fails
   - ✅ Logs JWT verification results

3. **Debug Endpoints** ([backend/src/routes/debugRoutes.js](backend/src/routes/debugRoutes.js))
   - `GET /api/debug/headers` - Shows all headers received
   - `GET /api/debug/env` - Shows environment configuration
   - `POST /api/debug/verify-jwt` - Verifies your token
   - `GET /api/debug/test-auth` - Tests middleware with your token

### Frontend Changes:
1. **Enhanced Logging** ([frontend/src/pages/AdminLogin.jsx](frontend/src/pages/AdminLogin.jsx))
   - Shows when token is stored
   - Shows token value (first 30 chars)

2. **Detailed Fetch Logging** ([frontend/src/pages/AdminPanel.jsx](frontend/src/pages/AdminPanel.jsx))
   - Shows which headers are being sent
   - Logs API responses with full error details
   - Traces authentication retrieval

## Diagnostic Procedure

### Step 1: Check Server is Running
```bash
# Terminal 1
cd /Users/pranav/Desktop/supplier-dashboard/backend
npm start
# Should show: "Server running on port 3000"
```

### Step 2: Check Frontend is Running
```bash
# Terminal 2 (new)
cd /Users/pranav/Desktop/supplier-dashboard/frontend
npm run dev
# Should show Vite dev server running
```

### Step 3: Test Login Flow
1. Open http://localhost:5173
2. Click "Admin Login" or go to /admin/login
3. Enter credentials: `admin` / `admin@123`
4. Open browser console (F12)
5. Look for logged messages showing token storage/retrieval

### Step 4: Check Backend Logs
1. Look at Terminal 1 (where backend is running)
2. You should see logs like:
```
🔐 [GET /api/purchase/enquiries] Auth header: Bearer eyJ...
✅ Token found, verifying...
✅ Token verified! User: <admin_id>
```

If you see instead:
```
⛔ No token extracted from header
```
This means the Authorization header is not reaching the backend.

### Step 5: Run Diagnostic Tests
In browser console (F12), after logging in:

```javascript
// Copy and run this:
const token = localStorage.getItem('adminToken');
console.log('Token in storage:', !!token);

// Test 1
const r1 = await fetch('http://localhost:3000/api/debug/headers', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const d1 = await r1.json();
console.log('Server sees header?', d1.authorization ? 'YES' : 'NO');

// Test 2
const r2 = await fetch('http://localhost:3000/api/debug/test-auth', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log('Protected endpoint works?', r2.ok ? 'YES' : 'NO');
if (!r2.ok) console.log('Error:', await r2.json());
```

## What Each Result Means

### ✅ Good Signs
- `Header reaches server` + `Token verifies` = System is working
- Both debug endpoints return status 200 = Middleware is correct
- `/api/debug/test-auth` returns 200 with your user data = Ready to use

### ❌ Bad Signs
- `Header doesn't reach server` = CORS issue (check browser Network tab)
- `Token verification fails` = JWT_SECRET mismatch or corrupted token
- `401 on debug/test-auth` = Middleware not recognizing token format
- All endpoints return 401 = Token not being sent by frontend

## If Diagnostics Fail

### Check 1: CORS Headers
In Network tab (F12 → Network), look for any request, click on it:
- **Request Headers** → should have `Authorization: Bearer ...`
- **Response Headers** → should have `Access-Control-Allow-Headers: ... Authorization`

If not present, CORS config didn't apply - restart backend.

### Check 2: Network Issues
```bash
# Terminal 3
curl -H "Authorization: Bearer eyJ..." http://localhost:3000/api/debug/headers
```

If this fails, backend isn't running or CORS is blocking.

### Check 3: Token Contents
```javascript
const token = localStorage.getItem('adminToken');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token payload:', payload);
```

Should show: `{ admin_id: "...", username: "admin", type: "admin", ... }`

## Next Steps After Diagnostics

Reply with:
1. **Backend console output** (what you see when server starts and requests come in)
2. **Browser console output** (the debug test results)
3. **Network tab screenshot** (showing Authorization header in request)
4. **Error messages** (any red text in console or Network)

This will help pinpoint the exact issue!
