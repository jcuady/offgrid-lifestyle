/**
 * CORS for browser-invoked Edge Functions (send-push).
 * Keep in sync with src/lib/edgeCors.ts (vitest source of truth).
 */
export function corsHeadersFor(_req?: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

export function dedupeByEndpoint<T extends { endpoint: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (seen.has(row.endpoint)) continue;
    seen.add(row.endpoint);
    out.push(row);
  }
  return out;
}
