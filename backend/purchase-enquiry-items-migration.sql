-- Add enquiry-level metadata columns directly on purchase_enquiry_items
-- so purchase_enquiry table is no longer required by runtime code.

ALTER TABLE purchase_enquiry_items
ADD COLUMN IF NOT EXISTS vendor_id TEXT,
ADD COLUMN IF NOT EXISTS purchase_manager_id TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS requested_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS required_delivery_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS planning_request_id TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_purchase_enquiry_items_enquiry_id
ON purchase_enquiry_items (enquiry_id);

CREATE INDEX IF NOT EXISTS idx_purchase_enquiry_items_vendor_id
ON purchase_enquiry_items (vendor_id);

CREATE INDEX IF NOT EXISTS idx_purchase_enquiry_items_status
ON purchase_enquiry_items (status);
