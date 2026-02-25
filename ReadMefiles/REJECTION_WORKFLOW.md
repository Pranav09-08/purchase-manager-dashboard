# Enquiry Rejection Workflow Documentation

## Overview
This document describes the comprehensive rejection workflow implemented for purchase enquiries, allowing vendors to reject enquiries they cannot fulfill and purchase managers to resubmit with modifications.

## Feature Summary
- ✅ Vendors can reject enquiries with detailed reasons
- ✅ Rejection reasons displayed to Purchase Manager
- ✅ PM can resubmit rejected enquiries with changes
- ✅ Status tracking throughout the rejection/resubmit cycle
- ✅ Filtering by rejection status on both sides
- ✅ Clear visual indicators for rejected enquiries

---

## User Flows

### Vendor Side: Rejecting an Enquiry

**When to Use:**
- Component not available in inventory
- Specifications cannot be met
- Delivery timeline not feasible
- Pricing not competitive
- Any other reason that prevents fulfillment

**Steps:**
1. Navigate to **Enquiries** tab
2. Click on any enquiry to view details
3. Click **"Reject"** button (red button)
4. Modal appears: "Reject Enquiry"
5. Enter detailed rejection reason (required field)
6. Click **"Confirm Rejection"**
7. Enquiry status changes to "Rejected"
8. PM is notified with your reason

**UI Elements:**
- Red "Reject" button in enquiry details modal
- Text area for rejection reason (required, placeholder guide provided)
- Rejected enquiries show with rose-colored status badge
- Filter dropdown includes "Rejected" option
- Once rejected, "Create Quotation" and "Reject" buttons are hidden

---

### Purchase Manager Side: Handling Rejected Enquiries

**Viewing Rejection Details:**
1. Navigate to **Purchase Enquiries** tab
2. Use filter dropdown → Select "Rejected"
3. Click on rejected enquiry
4. Rejection reason displayed in **rose-colored banner** at bottom of details
5. Status shows "Rejected by Vendor"

**Resubmitting with Changes:**
1. In rejected enquiry details, click **"Resubmit with Changes"** (amber button)
2. Edit form opens with all previous data
3. **Important:** Rose banner shows previous rejection reason at top
4. Make necessary modifications:
   - Update specifications
   - Change quantities
   - Modify delivery dates
   - Add clarifications in description
5. Click **"Raise Enquiry"** to resubmit
6. Status automatically resets to "Pending"
7. Rejection reason is cleared
8. Vendor receives updated enquiry

---

## Technical Implementation

### Database Changes

**New Column:**
```sql
ALTER TABLE purchase_enquiry_items
ADD COLUMN rejection_reason TEXT DEFAULT NULL;
```

**Migration File:** 
`/database/migrations/20260213_add_rejection_workflow.sql`

---

### Backend API

#### New Endpoint: Reject Enquiry
```
PUT /api/purchase/enquiry/:enquiryId/reject
```

**Request Body:**
```json
{
  "rejectionReason": "We do not have these components in stock currently."
}
```

**Response:**
```json
{
  "message": "Enquiry rejected successfully",
  "enquiry": {
    "enquiry_id": "pe_123...",
    "status": "rejected",
    "rejection_reason": "We do not have these components in stock currently.",
    ...
  }
}
```

**Authentication:** Required (Vendor token)

**Validation:**
- `rejectionReason` is required and must not be empty

---

#### Modified Endpoint: Update Enquiry
```
PUT /api/purchase/enquiry/:enquiryId
```

**Behavior Change:**
When updating a rejected enquiry:
- Status automatically resets to "pending"
- `rejection_reason` field is cleared (set to NULL)
- This allows clean resubmission without carrying over old rejection data

---

### Frontend Components

#### Vendor: EnquiriesTab.jsx

**New State:**
```javascript
const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectionReason, setRejectionReason] = useState('');
const [rejectLoading, setRejectLoading] = useState(false);
```

**New Handler:**
```javascript
const handleRejectEnquiry = async () => {
  // Validates reason, calls API, refreshes data
}
```

**UI Changes:**
- Added "Rejected" status option in filter dropdown
- Added reject button in enquiry details modal
- Reject modal with text area for reason
- Status badge now shows "Rejected" in rose color
- Conditional rendering: hide "Create Quotation" button for rejected enquiries

---

#### Purchase Manager: PurchaseEnquiriesTab.jsx

**New Handler:**
```javascript
const handleResubmitEnquiry = (enquiry) => {
  // Loads enquiry data for editing, includes rejection reason
}
```

**UI Changes:**
- Added "Rejected" filter option
- Status label shows "Rejected by Vendor"
- Rejection reason display in enquiry details (rose banner)
- "Resubmit with Changes" button for rejected enquiries
- Previous rejection reason banner in edit form
- "View Quotations" button hidden for rejected enquiries

---

## Status Flow Diagram

```
┌─────────────┐
│   Pending   │ ← PM creates enquiry
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   Quoted    │    │  REJECTED   │ ← Vendor rejects with reason
└──────┬──────┘    └──────┬──────┘
       │                  │
       │                  │ PM resubmits
       │                  ▼
       │           ┌─────────────┐
       │           │   Pending   │ ← Rejection reason cleared
       │           └─────────────┘
       ▼
  (Continue workflow...)
```

---

## UI/UX Guidelines

### Color Coding
- **Pending:** Amber (bg-amber-100 text-amber-700)
- **Quoted:** Green (bg-emerald-100 text-emerald-700)
- **Accepted:** Blue (bg-blue-100 text-blue-700)
- **Rejected:** Rose/Red (bg-rose-100 text-rose-700)

### Button Styling
- **Reject:** `bg-rose-600 hover:bg-rose-700` (red)
- **Resubmit:** `bg-amber-600 hover:bg-amber-700` (amber)
- **Create Quotation:** `bg-slate-900 hover:bg-slate-800` (dark)

### Text Guidelines
- Rejection reasons should be clear, professional, and actionable
- Placeholder text guides vendors on what information to provide
- Previous rejection reasons help PM understand what to fix

---

## Testing Checklist

### Vendor Tests
- [ ] Can open enquiry details
- [ ] "Reject" button visible for pending enquiries
- [ ] Modal appears with text area
- [ ] Cannot submit without entering reason
- [ ] Enquiry status updates to "Rejected"
- [ ] Rejected enquiries appear in "Rejected" filter
- [ ] Cannot create quotation for rejected enquiry
- [ ] Cannot reject already-rejected enquiry

### PM Tests
- [ ] Rejected enquiries visible in "Rejected" filter
- [ ] Rejection reason displays in enquiry details
- [ ] "Resubmit with Changes" button appears
- [ ] Edit form shows previous rejection reason banner
- [ ] Can modify enquiry fields
- [ ] Resubmission resets status to "Pending"
- [ ] Rejection reason cleared after resubmit
- [ ] Vendor sees updated enquiry as "Pending"

### Integration Tests
- [ ] Full cycle: Create → Reject → Resubmit → Quote
- [ ] Multiple rejection/resubmit cycles work correctly
- [ ] Data persistence across page refreshes
- [ ] Authentication works for all endpoints

---

## Error Handling

### Common Scenarios

**Empty Rejection Reason:**
```
Alert: "Please provide a rejection reason"
```

**Network Error:**
```
Alert: "Error rejecting enquiry"
```

**Unauthorized Access:**
```
401: Authentication required
```

**Invalid Enquiry ID:**
```
404: Enquiry not found
```

---

## Future Enhancements

### Potential Improvements
1. **Email Notifications:** Notify PM immediately when vendor rejects
2. **Rejection Templates:** Pre-defined common rejection reasons
3. **Rejection Analytics:** Track most common rejection reasons
4. **Multi-stage Discussions:** Allow back-and-forth clarification before final rejection
5. **Partial Fulfillment:** Allow vendors to reject some items, accept others
6. **Rejection History:** Track all rejection/resubmit cycles for an enquiry
7. **Auto-suggest Alternatives:** Recommend similar components when rejecting

---

## Migration Instructions

### For Existing Installations

1. **Run Database Migration:**
   ```bash
   psql -U your_user -d your_database -f database/migrations/20260213_add_rejection_workflow.sql
   ```

2. **Verify Column Added:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'purchase_enquiry_items' 
   AND column_name = 'rejection_reason';
   ```

3. **Restart Backend Server:**
   ```bash
   cd backend
   npm start
   ```

4. **Clear Frontend Cache:**
   ```bash
   cd frontend
   rm -rf node_modules/.cache
   npm run dev
   ```

5. **Test Workflow:** Create test enquiry, reject it, verify reason displays, resubmit

---

## Support & Troubleshooting

### Issue: Rejection Reason Not Saving
**Solution:** Check database column exists, verify API endpoint authentication

### Issue: Resubmit Button Not Appearing
**Solution:** Ensure enquiry status is exactly "rejected" (lowercase)

### Issue: Previous Rejection Reason Not Showing
**Solution:** Verify `formData._previousRejectionReason` is populated in `handleEditEnquiry`

---

## Related Documentation
- [Complete System Summary](COMPLETE_SUMMARY.md)
- [Procurement Workflow](VENDOR_PRODUCTS_FEATURES.md)
- [API Documentation](../backend/README.md)

---

**Last Updated:** February 13, 2026  
**Version:** 1.0.0  
**Implemented By:** AI Assistant
