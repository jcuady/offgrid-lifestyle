import { getCookieConsent } from "@/src/lib/consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let initialized = false;

export function isAnalyticsConfigured(): boolean {
  return Boolean(MEASUREMENT_ID?.startsWith("G-"));
}

export function canTrackAnalytics(): boolean {
  return isAnalyticsConfigured() && getCookieConsent() === "accepted";
}

export function initAnalytics(): void {
  if (!canTrackAnalytics() || initialized || typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  initialized = true;
}

export function trackPageView(path: string, title?: string) {
  if (!canTrackAnalytics() || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
    page_location: `${window.location.origin}${path}`,
  });
}
