import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[Supabase Warning] SUPABASE_URL or SUPABASE_KEY environment variables are missing.\n' +
    'The backend will fall back to local JSON database ("database.json") for operation.\n' +
    'Please set these environment variables in your .env file to enable actual Supabase DB connection.'
  );
}

// Initialize Supabase Client (only if credentials are available)
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
  : null;
export const isSupabaseConfigured = () => supabase !== null;
