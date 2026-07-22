import { safeNavigationUrl } from "@/src/lib/safeUrl";

/** Build an absolute URL for service-worker notification clicks (required on Safari). */
export function absoluteNotificationUrl(rawUrl: string, origin: string): string {
  const safePath = safeNavigationUrl(rawUrl, "/");
  return new URL(safePath, origin).href;
}

/**
 * Web Push `tag` — must be unique per distinct alert so rapid order updates
 * do not collapse into a single silent OS notification.
 */
export function buildWebPushTag(url: string, dedupeKey?: string): string {
  const path = safeNavigationUrl(url, "/");
  const key = (dedupeKey ?? "").trim().replace(/\s+/g, "-").slice(0, 80);
  if (key) return `offgrid:${path}:${key}`;
  return `offgrid:${path}:${Date.now()}`;
}
