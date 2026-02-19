#!/usr/bin/env node

/**
 * Generate Bcrypt Hash for Admin Password
 * Run this script to generate a bcrypt hash for any password
 * 
 * Usage: node generate-bcrypt-hash.js
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
    console.log(`\nGenerating hash... this may take a moment...\n`);
    
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    console.log(`✅ Hash Generated Successfully:\n`);
    console.log(`Hash: ${hash}\n`);
    
    console.log(`📋 SQL INSERT Statement:\n`);
    console.log(`INSERT INTO purchase_admin (username, email, password_hash, full_name, company_name, role, status, permissions)`);
    console.log(`VALUES (`);
    console.log(`  'admin',`);
    console.log(`  'admin@example.com',`);
    console.log(`  '${hash}',`);
    console.log(`  'Administrator',`);
    console.log(`  'Custom Soft',`);
    console.log(`  'super_admin',`);
    console.log(`  'active',`);
    console.log(`  '["create_enquiry", "approve_vendor", "manage_admins", "view_analytics"]'`);
    console.log(`);`);
    
    console.log(`\n✅ Or use this SQL UPDATE if admin already exists:\n`);
    console.log(`UPDATE purchase_admin SET password_hash = '${hash}' WHERE username = 'admin';\n`);
    
    return hash;
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

// Generate hash for default password
generateHash(DEFAULT_PASSWORD).then(hash => {
  console.log(`\n💡 Tips:`);
  console.log(`- Copy the hash above and use it in your SQL INSERT`);
  console.log(`- Each time you run this, a NEW hash is generated (bcrypt salts are random)`);
  console.log(`- To verify login works, the backend bcrypt.compare() will handle it\n`);
});
