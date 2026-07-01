/** Allow only same-app relative navigation paths (blocks open redirects and javascript: URLs). */
export function safeNavigationUrl(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || typeof raw !== "string") return fallback;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://") || trimmed.toLowerCase().startsWith("javascript:")) return fallback;

  try {
    const parsed = new URL(trimmed, "https://offgrid.local");
    if (parsed.origin !== "https://offgrid.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

const ORDER_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidOrderId(value: string): boolean {
  return ORDER_ID_RE.test(value);
}

export function isValidPortalUserId(value: string): boolean {
  return UUID_RE.test(value);
}

export function clampNotificationText(
  value: string,
  maxLen: number,
): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen);
}
