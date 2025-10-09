import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar .env manualmente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl) {
  throw new Error('❌ Falta SUPABASE_URL en .env');
}
if (!supabaseServiceKey) {
  throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en .env');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
