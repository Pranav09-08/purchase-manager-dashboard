-- Firebase Migration SQL Script
-- Add firebase_uid column to purchase_admin and vendorregistration tables

-- Add firebase_uid to purchase_admin table
ALTER TABLE purchase_admin 
ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_purchase_admin_firebase_uid 
ON purchase_admin(firebase_uid);

-- Add firebase_uid to vendorregistration table
ALTER TABLE vendorregistration 
ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_vendorregistration_firebase_uid 
ON vendorregistration(firebase_uid);

-- Comments for documentation
COMMENT ON COLUMN purchase_admin.firebase_uid IS 'Firebase Authentication UID for admin users';
COMMENT ON COLUMN vendorregistration.firebase_uid IS 'Firebase Authentication UID for vendor users';
