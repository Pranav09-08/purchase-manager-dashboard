# LOI → Order → Invoice Workflow Guide

## Complete Procurement Flow

This document explains the complete workflow from quotation acceptance to invoice payment.

---

## Workflow Overview

```
1. Purchase Enquiry → 2. Quotation → 3. LOI → 4. Purchase Order → 5. Invoice → 6. Payment
```

### Detailed Flow

#### **Phase 1: Enquiry & Quotation**
1. **PM creates Purchase Enquiry** → Vendor receives enquiry
2. **Vendor submits Quotation** → PM reviews quotation
3. **Negotiation (Optional)** → PM requests changes, Vendor submits counter-quotation
4. **PM Accepts Quotation** → Ready for LOI

#### **Phase 2: Letter of Intent (LOI)**
5. **PM Creates LOI**
   - Navigate to LOIs tab
   - Click "Create LOI"
   - Select the accepted quotation
   - Fill in:
     - Total Amount
     - Advance Payment %
     - Expected Delivery Date
     - Terms & Conditions
   - Submit → **Status: `sent`**

6. **Vendor Reviews LOI**
   - Navigate to LOIs tab
   - View LOI details
   - Options:
     - **Accept** → Status changes to `accepted`
     - **Reject** → Status changes to `rejected`

#### **Phase 3: Purchase Order Generation**
7. **PM Generates Order** (After LOI is accepted)
   - Navigate to LOIs tab
   - Find the accepted LOI
   - Click "Generate Order" button
   - Backend automatically:
     - Fetches items from the quotation
     - Creates purchase order
     - Updates LOI status to `confirmed`
   - **Order Status: `pending`**

8. **Vendor Confirms Order**
   - Navigate to Orders tab
   - View order details
   - Click "Confirm Order"
   - **Order Status: `confirmed`**

#### **Phase 4: Invoice Submission**
9. **Vendor Creates Invoice**
   - Navigate to Invoices tab
   - Click "Create Invoice"
   - Select the confirmed order
   - Add line items
   - Submit invoice
   - **Invoice Status: `pending`**

10. **PM Reviews Invoice**
    - Navigate to Invoices tab
    - Review invoice details
    - Options:
      - **Mark as Received** → Status: `received`
      - **Accept** → Status: `accepted`
      - **Reject** → Status: `rejected` (vendor can resubmit)

#### **Phase 5: Payment**
11. **PM Processes Payment**
    - Navigate to Payments tab
    - Create payment for accepted invoice
    - **Payment Status: `pending` → `processed`**

12. **Vendor Confirms Receipt**
    - Navigate to Payments tab
    - Mark payment as received
    - **Invoice Status: `paid`**

---

## Status Definitions

### LOI Statuses
| Status | Description | Next Action |
|--------|-------------|-------------|
| `sent` | LOI sent to vendor | Vendor: Accept or Reject |
| `accepted` | Vendor accepted LOI | PM: Generate Purchase Order |
| `rejected` | Vendor rejected LOI | PM: Review or resubmit |
| `confirmed` | Order generated from LOI | Workflow moves to Orders |

### Order Statuses
| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending` | Order awaiting vendor confirmation | Vendor: Confirm Order |
| `confirmed` | Vendor confirmed order | Vendor: Submit Invoice |
| `completed` | Order fulfilled | Workflow complete |
| `cancelled` | Order cancelled | No action |

### Invoice Statuses
| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending` | Invoice submitted by vendor | PM: Review Invoice |
| `received` | PM marked as received | PM: Accept or Reject |
| `accepted` | PM accepted invoice | PM: Process Payment |
| `rejected` | PM rejected invoice | Vendor: Revise and resubmit |
| `paid` | Payment completed | Workflow complete |

---

## Key Features

### Automatic Item Fetching
When generating an order from an LOI, the system automatically:
- Fetches all items from the linked quotation
- Preserves quantities, prices, discounts, and tax rates
- Calculates totals automatically

### Workflow Validation
- LOI can only be created from accepted quotations
- Orders can only be generated from accepted LOIs
- Invoices can only be created for confirmed orders

### Status Tracking
- Real-time status updates across all modules
- Clear "Next Step" guidance on each record
- Visual status indicators (color-coded badges)

---

## User Roles & Permissions

### Purchase Manager (PM)
- Create Purchase Enquiries
- Review and accept Quotations
- Create LOIs
- Generate Purchase Orders
- Review and accept Invoices
- Process Payments

### Vendor
- View Purchase Enquiries
- Submit Quotations
- Accept/Reject LOIs
- Confirm Orders
- Submit Invoices
- Confirm Payment Receipt

---

## Navigation Tips

### For Purchase Managers
1. **To create an LOI:**
   - Go to Quotations tab
   - Find accepted quotation
   - Click "Create LOI" (automatically prefills data)
   - OR go to LOIs tab → Create LOI

2. **To generate an order:**
   - Go to LOIs tab
   - Find accepted LOI
   - Click "Generate Order" button in the list
   - OR open LOI details → Click "Generate Order"

3. **To view workflow:**
   - Each tab shows related records
   - Use "View Orders" or "View Invoices" buttons to navigate

### For Vendors
1. **To accept an LOI:**
   - Go to LOIs tab
   - Review LOI details
   - Click "Accept" button

2. **To create an invoice:**
   - Go to Orders tab
   - Find confirmed order
   - Click order → "Generate Invoice"
   - OR go to Invoices tab → Create Invoice

---

## Best Practices

### 1. Data Consistency
- Always verify amounts and items before submitting
- Double-check delivery dates
- Review terms and conditions

### 2. Timely Actions
- Vendors: Respond to LOIs within 48 hours
- PMs: Review invoices within 72 hours
- Process payments according to advance/final split

### 3. Communication
- Use rejection reasons to clarify issues
- Add notes to provide context
- Track all communications

### 4. Documentation
- Keep records of all accepted quotations
- Save copies of LOIs and orders
- Maintain payment receipts

---

## Troubleshooting

### "Cannot generate order from LOI"
- **Reason:** LOI status is not `accepted`
- **Solution:** Ensure vendor has accepted the LOI first

### "No items found in quotation"
- **Reason:** Quotation has no line items
- **Solution:** Verify quotation has items before creating LOI

### "Order already exists for this LOI"
- **Reason:** An order has already been generated
- **Solution:** Navigate to Orders tab to view the existing order

### "Cannot create invoice for this order"
- **Reason:** Order status is not `confirmed`
- **Solution:** Ensure order is confirmed by vendor first

---

## Quick Reference

### PM Workflow
```
Create Enquiry → Review Quotations → Create LOI → Generate Order → Review Invoice → Process Payment
```

### Vendor Workflow
```
View Enquiry → Submit Quotation → Accept LOI → Confirm Order → Submit Invoice → Confirm Payment
```

---

## Related Documentation
- [Quotation System Guide](VENDOR_PRODUCTS_FEATURES.md)
- [Invoice System Guide](VENDOR_ANALYTICS_GUIDE.md)
- [Payment Processing](COMPLETE_SUMMARY.md)

---

**Last Updated:** March 4, 2026
**Version:** 1.0
