import { describe, expect, it } from "vitest";
import {
  clampNotificationText,
  isValidOrderId,
  isValidPortalUserId,
  safeNavigationUrl,
} from "./safeUrl";

describe("safeUrl", () => {
  it("allows in-app relative paths", () => {
    expect(safeNavigationUrl("/portal/orders/OG-1")).toBe("/portal/orders/OG-1");
    expect(safeNavigationUrl("/account/orders/CO-2026-1?q=1")).toBe("/account/orders/CO-2026-1?q=1");
  });

  it("blocks open redirects and javascript URLs", () => {
    expect(safeNavigationUrl("https://evil.com")).toBe("/");
    expect(safeNavigationUrl("//evil.com")).toBe("/");
    expect(safeNavigationUrl("javascript:alert(1)")).toBe("/");
    expect(safeNavigationUrl(null, "/shop")).toBe("/shop");
  });

  it("validates order ids and portal user ids", () => {
    expect(isValidOrderId("QA-GUEST-002")).toBe(true);
    expect(isValidOrderId("../sql")).toBe(false);
    expect(isValidPortalUserId("00000000-0000-0000-0000-000000000002")).toBe(true);
    expect(isValidPortalUserId("not-a-uuid")).toBe(false);
  });

  it("clamps notification text length", () => {
    expect(clampNotificationText("  hello  ", 10)).toBe("hello");
    expect(clampNotificationText("x".repeat(20), 5)).toBe("xxxxx");
  });
});
