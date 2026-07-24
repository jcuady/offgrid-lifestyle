/** Detect service-role callers (mirrors edge `_shared/serviceRoleAuth.ts`). */

/**
 * Decode JWT payload role claim (diagnostic only — never authorize from this alone).
 */
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
 * True only when the Authorization bearer equals the platform service role key.
 * Unsigned JWT `role: service_role` claims are NOT accepted (forgery risk).
 */
export function isServiceRoleBearer(token: string, serviceRoleKey: string): boolean {
  if (!token || !serviceRoleKey) return false;
  return token === serviceRoleKey;
}
