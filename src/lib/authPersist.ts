/**
 * GoTrue persist policy — session survives reload and token refresh.
 * Do not set a custom storageKey: supabase-js already keys by project ref.
 * Changing it would sign everyone out on deploy.
 */
export const AUTH_SESSION_PERSIST = {
  persistSession: true,
  autoRefreshToken: true,
} as const;
