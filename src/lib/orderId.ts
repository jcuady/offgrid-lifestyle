/**
 * Normalize order IDs before PostgREST filters.
 * PayMongo refs use `orderId:kind`; Chrome console copies often append `:line`.
 * Either form would 400 as `id=eq.OG-…:1`.
 */
export function normalizeOrderId(raw: string | undefined | null): string {
  if (raw == null) return "";
  let id = String(raw).trim();
  try {
    id = decodeURIComponent(id);
  } catch {
    /* keep raw trim */
  }
  id = id.trim();
  const colon = id.indexOf(":");
  if (colon > 0) return id.slice(0, colon).trim();
  return id;
}
