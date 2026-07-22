/** Strip PostgREST filter metacharacters before ilike. */
export function sanitizePortalUserSearch(raw: string): string {
  return raw.trim().replace(/[%_,]/g, " ").replace(/\s+/g, " ").slice(0, 80);
}
