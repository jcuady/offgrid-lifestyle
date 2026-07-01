import { safeNavigationUrl } from "@/src/lib/safeUrl";

/** Build an absolute URL for service-worker notification clicks (required on Safari). */
export function absoluteNotificationUrl(rawUrl: string, origin: string): string {
  const safePath = safeNavigationUrl(rawUrl, "/");
  return new URL(safePath, origin).href;
}
