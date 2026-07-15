import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ufloxocohfvcruuozhth.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zYnP6pBW2D7eUhFi2thgjg_zc8B6x36';

export const supabase = createClient(supabaseUrl, supabaseKey);
