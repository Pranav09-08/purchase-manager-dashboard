#!/usr/bin/env node

/**
 * Generate Bcrypt Hash for Admin Password
 * Run from backend directory: node hash-generator.js
 */

const bcrypt = require('bcrypt');

const DEFAULT_PASSWORD = 'admin@123';
const SALT_ROUNDS = 10;

async function generateHash(password) {
  try {
    console.log(`\n🔐 Generating Bcrypt Hash`);
    console.log(`=========================\n`);
    console.log(`Password: ${password}`);
    console.log(`Salt Rounds: ${SALT_ROUNDS}`);
    console.log(`\nGenerating hash...\n`);
    
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    console.log(`✅ Hash Generated Successfully:\n`);
    console.log(`${hash}\n`);
    
    console.log(`📋 Use this in SQL:\n`);
    console.log(`UPDATE purchase_admin SET password_hash = '${hash}' WHERE username = 'admin';\n`);
    
    console.log(`Or for INSERT:\n`);
    console.log(`INSERT INTO purchase_admin (username, email, password_hash, full_name, company_name, role, status, permissions)`);
    console.log(`VALUES ('admin', 'admin@example.com', '${hash}', 'Administrator', 'Custom Soft', 'super_admin', 'active', '[\"create_enquiry\", \"approve_vendor\", \"manage_admins\", \"view_analytics\"]');\n`);
    
    return hash;
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

generateHash(DEFAULT_PASSWORD);
