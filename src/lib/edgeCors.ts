/**
 * CORS helpers for Edge Functions called from the browser (send-push).
 * Auth stays inside the function — CORS must not block legitimate SPA origins.
 */

export const DEFAULT_ALLOWED_ORIGINS =
  "https://www.oglifestyleph.com,https://oglifestyleph.com,https://offgrid-lifestyle.vercel.app,https://offgrid-lifestyle-jcuadys-projects.vercel.app,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000";

/** Browser→Edge: wildcard bypasses Origin allowlist mismatches (previews, custom hosts). */
export function buildEdgeCorsHeaders(_origin?: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

/** One subscription row per endpoint before web-push send. */
export function dedupePushSubscriptionsByEndpoint<T extends { endpoint: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (seen.has(row.endpoint)) continue;
    seen.add(row.endpoint);
    out.push(row);
  }
  return out;
}
