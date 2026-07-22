/** Detect service-role callers for Edge Functions (send-push webhooks, etc.). */

export function readJwtRoleClaim(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

/**
 * True when the Authorization bearer is the platform service role key,
 * or a JWT whose `role` claim is `service_role` (legacy JWT vs sb_secret mismatch).
 */
export function isServiceRoleBearer(token: string, serviceRoleKey: string): boolean {
  if (!token || !serviceRoleKey) return false;
  if (token === serviceRoleKey) return true;
  return readJwtRoleClaim(token) === "service_role";
}
