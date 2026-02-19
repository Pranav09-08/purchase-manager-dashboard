#!/usr/bin/env node

/**
 * Verify Bcrypt Hash
 * Test if a bcrypt hash matches a password
 * 
 * Usage: node verify-bcrypt.js <hash> <password>
 * Example: node verify-bcrypt.js "$2b$10$..." "admin@123"
 */

const bcrypt = require('bcrypt');

const hash = process.argv[2];
const password = process.argv[3];

if (!hash || !password) {
  console.log(`\n❌ Missing arguments!\n`);
  console.log(`Usage: node verify-bcrypt.js <hash> <password>\n`);
  console.log(`Example:`);
  console.log(`  node verify-bcrypt.js "$2b$10$N9qo8..." "admin@123"\n`);
  process.exit(1);
}

async function verifyHash() {
  try {
    console.log(`\n🔐 Verifying Bcrypt Hash`);
    console.log(`========================\n`);
    console.log(`Hash:     ${hash}`);
    console.log(`Password: ${password}\n`);
    console.log(`Comparing...\n`);
    
    const match = await bcrypt.compare(password, hash);
    
    if (match) {
      console.log(`✅ SUCCESS! Password matches the hash\n`);
      console.log(`This hash is CORRECT for password: ${password}\n`);
    } else {
      console.log(`❌ FAILED! Password does NOT match the hash\n`);
      console.log(`This hash is INCORRECT for password: ${password}\n`);
      console.log(`💡 Tip: Run 'node generate-bcrypt-hash.js' to generate a correct hash\n`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying hash:', error.message);
    console.error('\n💡 Make sure the hash is a valid bcrypt hash format\n');
    process.exit(1);
  }
}

verifyHash();
