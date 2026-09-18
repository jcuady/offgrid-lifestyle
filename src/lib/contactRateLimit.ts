/** Contact form rate-limit helpers — edge + tests share this contract. */

export const CONTACT_RATE_LIMITS = {
  perIpPerHour: 5,
  perEmailPerHour: 3,
  windowMs: 60 * 60 * 1000,
} as const;

export function isOverContactRateLimit(count: number, max: number): boolean {
  return count >= max;
}

export function contactRateBucketKey(kind: "ip" | "email", value: string): string {
  return `${kind}:${value.trim().toLowerCase()}`;
}
