import { registerSW } from "virtual:pwa-register";

let initialized = false;
let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

const NEED_REFRESH_EVENT = "og:sw-need-refresh";

/** Register the PWA service worker as early as possible (required for push on all browsers). */
export function initServiceWorker(): void {
  if (initialized || typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  initialized = true;

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent(NEED_REFRESH_EVENT));
    },
    onOfflineReady() {
      // App shell cached for offline navigation.
    },
  });
}

export function getServiceWorkerUpdate(): ((reloadPage?: boolean) => Promise<void>) | undefined {
  return updateSW;
}

export function onServiceWorkerNeedRefresh(handler: () => void): () => void {
  window.addEventListener(NEED_REFRESH_EVENT, handler);
  return () => window.removeEventListener(NEED_REFRESH_EVENT, handler);
}

/** Resolve when the service worker is active — call before PushManager.subscribe. */
export async function ensureServiceWorkerReady(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  if (!initialized) initServiceWorker();
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}
