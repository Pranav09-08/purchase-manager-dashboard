// Supabase client initialization
require('dotenv').config();
const supabase = require('@supabase/supabase-js');

// Environment configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create and export client instance
const client = supabase.createClient(supabaseUrl, supabaseKey);

module.exports = client;
