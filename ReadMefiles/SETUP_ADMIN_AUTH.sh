#!/bin/bash

# Admin Auth Setup Script
# This script helps set up admin authentication

echo "🔧 Admin Authentication Setup"
echo "=============================="
echo ""

# Check if we have the SQL file
if [ ! -f "SQL_SCHEMA_ADMIN.sql" ]; then
    echo "❌ SQL_SCHEMA_ADMIN.sql not found!"
    echo "   Make sure you're running this from the project root"
    exit 1
fi

echo "✅ Found SQL schema file"
echo ""

# Provide instructions
echo "📝 Instructions:"
echo ""
echo "1. Copy and execute the SQL from SQL_SCHEMA_ADMIN.sql in your Supabase console"
echo "   This will create:"
echo "   - purchase_admin table"
echo "   - admin_audit_log table"
echo "   - Default admin user (username: 'admin', password: 'admin@123')"
echo ""

echo "2. Make sure your .env file has JWT_SECRET set:"
echo "   JWT_SECRET=your-secret-key-here"
echo ""

echo "3. Restart the backend server:"
echo "   npm start"
echo ""

echo "4. Test the new admin login:"
echo "   - Go to http://localhost:5173/admin/login"
echo "   - Enter username: 'admin'"
echo "   - Enter password: 'admin@123'"
echo ""

echo "5. ⚠️  IMPORTANT - Change default password!"
echo "   After first login, go to admin panel and change the default password"
echo ""

echo "6. Create additional admin users as needed via the admin API:"
echo "   POST /api/auth/admins"
echo "   { username, email, password, full_name, role, ... }"
echo ""

echo "✨ Setup complete!"
echo ""
echo "For detailed documentation, see: ADMIN_AUTH_SETUP.md"
