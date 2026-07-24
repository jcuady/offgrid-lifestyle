import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env file.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Standard SPA: GoTrue consumes hash/?code=. Auth session bootstrap owns
    // stash → classify → hydrate → singleton onAuthStateChange. Never signOut
    // while URL tokens are being consumed.
    detectSessionInUrl: true,
  },
});
