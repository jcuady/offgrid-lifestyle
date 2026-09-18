import { describe, expect, it } from "vitest";
import { buildGcashQrStoragePath, withCacheBust } from "./gcashQrUpload";
import { isGcashQrReady } from "@/src/types/payments";

describe("gcashQrUpload", () => {
  it("builds unique path under gcash-qr/", () => {
    expect(buildGcashQrStoragePath("qr.PNG", 123)).toBe("gcash-qr/123.png");
  });

  it("cache-busts public urls and stays GCash-ready", () => {
    const url = withCacheBust("https://example.com/payment-assets/gcash-qr/1.png", 99);
    expect(url).toBe("https://example.com/payment-assets/gcash-qr/1.png?v=99");
    expect(isGcashQrReady(url)).toBe(true);
  });
});
