import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export const createSupabaseBrowser = () => {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        auth: { 
          persistSession: true, 
          detectSessionInUrl: true,
          // Email verification links always use PKCE format (token starts with pkce_)
          // So we must use PKCE flow to handle the code parameter
          flowType: 'pkce'
        } 
      }
    );
  }
  return supabaseClient;
};
