import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: Missing Supabase URL or Service Role Key in environment variables.');
}

// Using Service Role Key to bypass RLS for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
