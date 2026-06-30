/** Build an absolute URL for service-worker notification clicks (required on Safari). */
export function absoluteNotificationUrl(rawUrl: string, origin: string): string {
  return new URL(rawUrl, origin).href;
}
