/** Mask PayMongo public keys for admin UI — never render the full key in plain text. */
export function maskPaymongoPublicKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return "";
  const prefix = trimmed.startsWith("pk_live_")
    ? "pk_live_"
    : trimmed.startsWith("pk_test_")
      ? "pk_test_"
      : trimmed.startsWith("pk_")
        ? "pk_"
        : "";
  const body = trimmed.slice(prefix.length);
  if (body.length <= 4) return `${prefix}${"•".repeat(Math.max(body.length, 4))}`;
  return `${prefix}${"•".repeat(Math.max(8, body.length - 4))}${body.slice(-4)}`;
}

export function paymongoKeyConfigured(key: string): boolean {
  const t = key.trim();
  return t.startsWith("pk_test_") || t.startsWith("pk_live_");
}
