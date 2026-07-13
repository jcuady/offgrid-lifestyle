const COOKIE_CONSENT_KEY = "og-cookie-consent";
const PUSH_DISMISSED_KEY = "og-push-prompt-dismissed";
const COOKIE_CONSENT_EVENT = "og:cookie-consent";

export type CookieConsent = "accepted" | "essential-only";

export function getCookieConsent(): CookieConsent | null {
  const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (raw === "accepted" || raw === "essential-only") return raw;
  return null;
}

export function setCookieConsent(value: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
  }
}

/** Fires once consent is chosen (Accept all / Essential only). */
export function onCookieConsent(handler: (value: CookieConsent) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<CookieConsent>).detail;
    if (detail === "accepted" || detail === "essential-only") handler(detail);
  };
  window.addEventListener(COOKIE_CONSENT_EVENT, listener);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, listener);
}

export function isPushPromptDismissed(): boolean {
  return localStorage.getItem(PUSH_DISMISSED_KEY) === "1";
}

export function dismissPushPrompt(): void {
  localStorage.setItem(PUSH_DISMISSED_KEY, "1");
}
