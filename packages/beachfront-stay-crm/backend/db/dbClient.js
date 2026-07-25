/**
 * Database client adapter supporting Supabase Client / Postgres queries
 */
import { createClient } from '@supabase/supabase-js';

let customClient = null;

export function initDb({ supabaseUrl, supabaseAnonKey, supabaseServiceKey }) {
  const url = supabaseUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = supabaseServiceKey || supabaseAnonKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    customClient = createClient(url, key);
  }
  return customClient;
}

export function getDbClient() {
  if (!customClient) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      customClient = createClient(url, key);
    }
  }
  return customClient;
}
