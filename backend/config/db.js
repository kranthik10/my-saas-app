const { createClient } = require('@supabase/supabase-js');

const connectDB = () => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    console.log('Supabase Client Created...');
    return supabase;
  } catch (err) {
    console.error('Supabase connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;