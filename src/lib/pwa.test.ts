import { describe, expect, it, afterEach, vi } from "vitest";
import {
  canReceiveWebPush,
  getPushUnsupportedReason,
  iosSupportsWebPush,
  isAndroidDevice,
  isIosDevice,
  isPushCapableBrowser,
  isStandalonePwa,
} from "@/src/lib/pwa";

function stubWindow(opts: {
  ua: string;
  standalone?: boolean;
  displayModeStandalone?: boolean;
  pushManager?: boolean;
  notification?: boolean;
  ontouchend?: boolean;
}) {
  const matchMedia = vi.fn((query: string) => ({
    matches: Boolean(opts.displayModeStandalone && query.includes("standalone")),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  vi.stubGlobal("window", {
    matchMedia,
    navigator: {
      userAgent: opts.ua,
      standalone: opts.standalone,
      serviceWorker: {},
    },
  });
  vi.stubGlobal("navigator", {
    userAgent: opts.ua,
    standalone: opts.standalone,
    serviceWorker: {},
  });
  vi.stubGlobal("document", {
    ontouchend: opts.ontouchend ? null : undefined,
  });
  if (opts.pushManager === false) {
    // PushManager missing
    Reflect.deleteProperty(window as object, "PushManager");
  } else {
    (window as unknown as { PushManager: unknown }).PushManager = function PushManager() {};
  }
  if (opts.notification === false) {
    Reflect.deleteProperty(globalThis as object, "Notification");
  } else {
    (globalThis as unknown as { Notification: unknown }).Notification = function Notification() {};
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pwa platform detection", () => {
  it("detects iPhone and Android from UA", () => {
    stubWindow({ ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" });
    expect(isIosDevice()).toBe(true);
    expect(isAndroidDevice()).toBe(false);

    stubWindow({ ua: "Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile" });
    expect(isIosDevice()).toBe(false);
    expect(isAndroidDevice()).toBe(true);
  });

  it("treats iPadOS desktop UA + touch as iOS", () => {
    stubWindow({
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      ontouchend: true,
    });
    expect(isIosDevice()).toBe(true);
  });

  it("requires Home Screen standalone for iOS push", () => {
    stubWindow({
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
      displayModeStandalone: false,
      standalone: false,
    });
    expect(isStandalonePwa()).toBe(false);
    expect(canReceiveWebPush()).toBe(false);
    expect(getPushUnsupportedReason()).toMatch(/Home Screen/i);

    stubWindow({
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
      displayModeStandalone: true,
      standalone: true,
    });
    expect(isStandalonePwa()).toBe(true);
    expect(canReceiveWebPush()).toBe(true);
    expect(getPushUnsupportedReason()).toBeNull();
  });

  it("allows Android Chrome push without install", () => {
    stubWindow({
      ua: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile",
      displayModeStandalone: false,
    });
    expect(canReceiveWebPush()).toBe(true);
    expect(getPushUnsupportedReason()).toBeNull();
  });

  it("blocks iOS older than 16.4 even when installed", () => {
    stubWindow({
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15",
      displayModeStandalone: true,
      standalone: true,
    });
    expect(iosSupportsWebPush()).toBe(false);
    expect(canReceiveWebPush()).toBe(false);
    expect(getPushUnsupportedReason()).toMatch(/16\.4/i);
  });

  it("reports missing PushManager", () => {
    stubWindow({
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      pushManager: false,
    });
    expect(isPushCapableBrowser()).toBe(false);
    expect(getPushUnsupportedReason()).toMatch(/does not support/i);
  });
});
