# Component Approval Workflow - Implementation Guide

## Overview
Implemented a comprehensive approval workflow for vendor components where:
1. **Vendor** adds component → Status: `pending`
2. **PM** reviews → Can `approve` or `reject` with reason
3. If **rejected** → Vendor sees reason → Can update/resubmit
4. Component returns to `pending` → PM reviews again
5. Once **approved** → Component available for purchase

---

## Database Changes

### File: `database/component_approval_workflow.sql`

**Run this SQL in Supabase to enable the workflow.**

###New Columns Added to `vendor_components` table:

| Column | Type | Description |
|--------|------|-------------|
| `status` | VARCHAR(20) | `'pending'`, `'approved'`, `'rejected'` |
| `rejection_reason` | TEXT | PM feedback when rejecting |
| `reviewed_by` | UUID | Admin who reviewed (FK to admin_users) |
| `reviewed_at` | TIMESTAMPTZ | When component was reviewed |
| `submission_count` | INTEGER | Tracks resubmissions |

### Database Views Created:
- `v_pending_vendor_components` - Components awaiting PM review
- `v_rejected_vendor_components` - Components rejected with reasons
- `v_approved_vendor_components` - Approved components ready for purchase

### Trigger Function:
- `increment_submission_count()` - Auto-increments count when vendor resubmits

---

## Backend Changes

### File: `backend/src/controllers/componentController.js`

#### New Endpoints:

**1. Approve Component (PM)**
```
PUT /api/vendor/components/:componentId/approve
```
- Sets status to `'approved'`
- Clears rejection_reason
- Records reviewed_by and reviewed_at

**2. Reject Component (PM)**
```
PUT /api/vendor/components/:componentId/reject
Body: { rejectionReason: "string" }
```
- Sets status to `'rejected'`
- Stores rejection_reason
- Records reviewed_by and reviewed_at

**3. Update Component (Vendor) - Modified**
```
PUT /api/vendor/components/:componentId
```
- If component was `rejected`, resets to `pending`
- Clears rejection_reason
- Auto-increments submission_count (via trigger)

**4. Add Component (Vendor) - Modified**
```
POST /api/vendor/components
```
- Now sets `status: 'pending'` on creation
- Response message: "Component added successfully and pending approval"

### File: `backend/src/routes/componentRoutes.js`

Added routes:
```javascript
router.put('/vendor/components/:componentId/approve', authenticateToken, componentController.approveVendorComponent);
router.put('/vendor/components/:componentId/reject', authenticateToken, componentController.rejectVendorComponent);
```

---

## Frontend Changes Needed

### 1. PM's Vendor Components Tab (`VendorComponentsTab.jsx`)

**Add Review UI:**
- Show `status` badge for each component (pending/approved/rejected)
- For `pending` components: Show "Approve" and "Reject" buttons
- For `rejected` components: Show rejection reason
- Add rejection modal with text area for rejection reason

**API Calls:**
```javascript
// Approve
await axios.put(`${apiUrl}/api/vendor/components/${componentId}/approve`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Reject
await axios.put(`${apiUrl}/api/vendor/components/${componentId}/reject`, {
  rejectionReason: reason
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Filter Options:**
- All Components
- Pending Review
- Approved
- Rejected

### 2. Vendor's Components Tab (`ComponentsTab.jsx` in vendor folder)

**Show Status:**
- Status badge: Pending (amber), Approved (green), Rejected (red)
- For `rejected`: Show rejection reason banner
- Show submission count if > 1

**Rejection Handling:**
- Display rejection reason prominently
- "Update & Resubmit" button for rejected components
- Clear message: "This component was rejected. Update it to resubmit for approval."

**Component Addition:**
- Show success message: "Component added! Awaiting PM approval."

---

## User Workflows

### Vendor Workflow:
1. **Add Component** → Status: `pending`
   - Success message: "Component submitted for approval"
2. **Wait for PM Review**
3. If **Approved** → Component can be used in enquiries
4. If **Rejected** → 
   - See rejection reason
   - Update component details
   - Click "Update & Resubmit"
   - Status resets to `pending`
   - Goes back to PM for review

### PM Workflow:
1. Go to "Vendor Components" tab
2. Filter by "Pending Review"
3. See list of components awaiting approval
4. For each component:
   - Review details (price, specs, etc.)
   - Click "Approve" ✓
   - OR Click "Reject" ✗ and provide reason
5. Approved components are available for purchases
6. Rejected components return if vendor resubmits

---

## Business Rules

### Component Visibility:
- **Vendors** can see all their own components (all statuses)
- **PM** can see all vendor components with status indicators
- **Purchase Enquiries**: Only `approved` components should be selectable
- **Vendor Products**: Vendors can only add `approved` components to their product listings

### Status Transitions:
```
pending → approved (PM approves)
pending → rejected (PM rejects)
rejected → pending (Vendor updates)
approved → [locked] (Cannot be changed without re-approval)
```

### Notifications (Future Enhancement):
- Vendor: "Your component has been approved/rejected"
- PM: "X new components pending review"

---

## Testing Checklist

### Database:
- [ ] Run `component_approval_workflow.sql` in Supabase
- [ ] Verify columns exist in `vendor_components` table
- [ ] Check views are created
- [ ] Test trigger function

### Backend:
- [ ] Restart backend server
- [ ] Test approve endpoint
- [ ] Test reject endpoint  
- [ ] Test update endpoint (resubmission)
- [ ] Test add component (status = pending)

### Frontend:
- [ ] PM can see pending components
- [ ] PM can approve components
- [ ] PM can reject with reason
- [ ] Vendor sees status badges
- [ ] Vendor sees rejection reason
- [ ] Vendor can update rejected components
- [ ] Status resets to pending after update
- [ ] Filters work correctly

### Integration:
- [ ] Approved components appear in enquiry dropdowns
- [ ] Pending/Rejected components don't appear in enquiries
- [ ] Notification badges show pending count
- [ ] End-to-end workflow: Add → Reject → Update → Approve

---

## Migration Notes

**Existing Components:**
- Set to `status = 'approved'` automatically (grandfather in)
- `reviewed_at` set to `created_at`
- No disruption to existing workflows

**New Components:**
- All start as `status = 'pending'`
- Require PM approval before use

---

## API Response Examples

**Approve Response:**
```json
{
  "message": "Component approved successfully",
  "component": {
    "componentid": "comp_123",
    "status": "approved",
    "reviewed_by": "admin_uuid",
    "reviewed_at": "2026-02-13T11:30:00Z"
  }
}
```

**Reject Response:**
```json
{
  "message": "Component rejected successfully",
  "component": {
    "componentid": "comp_123",
    "status": "rejected",
    "rejection_reason": "Price too high for this specification",
    "reviewed_by": "admin_uuid",
    "reviewed_at": "2026-02-13T11:30:00Z"
  }
}
```

**Update/Resubmit Response:**
```json
{
  "message": "Component updated successfully",
  "component": {
    "componentid": "comp_123",
    "status": "pending",
    "rejection_reason": null,
    "submission_count": 2
  },
  "resubmitted": true
}
```

---

## Files Modified

### Database:
- ✅ `database/component_approval_workflow.sql` (new)

### Backend:
- ✅ `backend/src/controllers/componentController.js`
- ✅ `backend/src/routes/componentRoutes.js`

### Frontend (TODO):
- ⏳ `frontend/src/components/admin/VendorComponentsTab.jsx`
- ⏳ `frontend/src/components/vendor/ComponentsTab.jsx`

---

## Summary

The component approval workflow ensures quality control by requiring PM approval before vendors' components can be used in purchases. The workflow is:

**Simple** → Vendor adds, PM reviews, component approved  
**Flexible** → PM can reject with feedback, vendor can improve and resubmit  
**Trackable** → Full audit trail with timestamps and submission counts  
**Non-disruptive** → Existing components auto-approved, no workflow interruption

