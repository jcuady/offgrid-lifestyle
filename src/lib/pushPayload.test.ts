import { describe, expect, it } from "vitest";
import { absoluteNotificationUrl, buildWebPushTag } from "./pushPayload";
import { safeNavigationUrl } from "./safeUrl";

describe("pushPayload", () => {
  it("resolves relative push URLs against the app origin (Safari requirement)", () => {
    expect(absoluteNotificationUrl("/portal/orders/OG-1", "https://offgrid-lifestyle.vercel.app")).toBe(
      "https://offgrid-lifestyle.vercel.app/portal/orders/OG-1",
    );
  });

  it("blocks malicious notification click targets", () => {
    expect(absoluteNotificationUrl("https://evil.com", "https://offgrid-lifestyle.vercel.app")).toBe(
      "https://offgrid-lifestyle.vercel.app/",
    );
    expect(safeNavigationUrl("//evil.com/phish")).toBe("/");
  });

  it("builds unique tags so same-order events do not collapse", () => {
    const a = buildWebPushTag("/account/orders/OG-1", "order_confirmed");
    const b = buildWebPushTag("/account/orders/OG-1", "shipped");
    expect(a).not.toBe(b);
    expect(a).toContain("/account/orders/OG-1");
    expect(a).toContain("order_confirmed");
  });
});
