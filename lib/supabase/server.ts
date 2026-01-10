import { createClient } from '@supabase/supabase-js'

// Admin client for server-side operations with service_role key
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Default server client using the anon key
// The prompt specifies bypassing RLS and handling permissions in-app,
// so most server-side queries will likely use the admin client.
// This client is here for completeness or for scenarios where
// calls should be made with the anonymous role.
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
