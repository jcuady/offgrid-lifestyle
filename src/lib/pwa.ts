const INSTALL_DISMISSED_KEY = "og-pwa-install-dismissed";
const OPEN_GUIDE_EVENT = "og:open-install-guide";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type { BeforeInstallPromptEvent };

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as Mac; detect via touch points.
  const iPadOs = /macintosh/i.test(ua) && typeof document !== "undefined" && "ontouchend" in document;
  return iOS || iPadOs;
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function isPushCapableBrowser(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

/** Whether this device/browser can subscribe to Web Push right now. */
export function canReceiveWebPush(): boolean {
  if (!isPushCapableBrowser() || typeof Notification === "undefined") return false;
  // iOS Safari only exposes push in an installed Home Screen PWA (16.4+).
  if (isIosDevice() && !isStandalonePwa()) return false;
  return true;
}

export function getPushUnsupportedReason(): string | null {
  if (typeof window === "undefined") return "Push is not available in this environment.";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "This browser does not support Web Push notifications.";
  }
  if (typeof Notification === "undefined") {
    return "Notifications are not available in this browser.";
  }
  if (isIosDevice() && !isStandalonePwa()) {
    return "On iPhone or iPad, add OffGrid to your Home Screen first, then enable notifications.";
  }
  return null;
}

export function isPwaInstallDismissed(): boolean {
  return localStorage.getItem(INSTALL_DISMISSED_KEY) === "1";
}

export function dismissPwaInstallPrompt(): void {
  localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
  emit();
}

export function shouldOfferPwaInstall(): boolean {
  if (isStandalonePwa() || isPwaInstallDismissed()) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Centralized install-prompt state so the modal and account-menu CTA stay in
// sync on a single captured `beforeinstallprompt` event.
// ---------------------------------------------------------------------------

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
let initialized = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function initPwaInstall(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    dismissPwaInstallPrompt();
    emit();
  });
}

export function subscribePwaInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function canNativeInstall(): boolean {
  return deferredPrompt !== null;
}

export function wasInstalledThisSession(): boolean {
  return installed;
}

export async function promptNativeInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  emit();
  return outcome;
}

export function openInstallGuide(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_GUIDE_EVENT));
}

export function onOpenInstallGuide(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(OPEN_GUIDE_EVENT, handler);
  return () => window.removeEventListener(OPEN_GUIDE_EVENT, handler);
}
