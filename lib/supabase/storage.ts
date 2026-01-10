import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for Storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use the service role key for server-side storage operations
export const supabaseStorage = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const storageBucket = (bucketName: string) => supabaseStorage.storage.from(bucketName);
