import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Bypasses Row Level Security — server-side admin routes only. Never import
// this into a client component or expose the service role key to the browser.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
