const COOKIE_CONSENT_KEY = "og-cookie-consent";
const PUSH_DISMISSED_KEY = "og-push-prompt-dismissed";

export type CookieConsent = "accepted" | "essential-only";

export function getCookieConsent(): CookieConsent | null {
  const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (raw === "accepted" || raw === "essential-only") return raw;
  return null;
}

export function setCookieConsent(value: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
}

export function isPushPromptDismissed(): boolean {
  return localStorage.getItem(PUSH_DISMISSED_KEY) === "1";
}

export function dismissPushPrompt(): void {
  localStorage.setItem(PUSH_DISMISSED_KEY, "1");
}
