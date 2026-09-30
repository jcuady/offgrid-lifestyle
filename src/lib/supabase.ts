import { createClient } from "@supabase/supabase-js";
import { AUTH_SESSION_PERSIST } from "@/src/lib/authPersist";
import type { Database } from "@/src/types/database";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://sswzfwfpnyhnvstabteo.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fallback_local_key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "[OFFGRID] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Running in offline/fallback mode with static catalog.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...AUTH_SESSION_PERSIST,
    // Standard SPA: GoTrue consumes hash/?code=. Auth session bootstrap owns
    // stash → classify → hydrate → singleton onAuthStateChange. Never signOut
    // while URL tokens are being consumed.
    detectSessionInUrl: true,
  },
});
