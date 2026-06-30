import { describe, expect, it } from "vitest";
import { absoluteNotificationUrl } from "./pushPayload";

describe("pushPayload", () => {
  it("resolves relative push URLs against the app origin (Safari requirement)", () => {
    expect(absoluteNotificationUrl("/portal/orders/OG-1", "https://offgrid-lifestyle.vercel.app")).toBe(
      "https://offgrid-lifestyle.vercel.app/portal/orders/OG-1",
    );
  });

  it("passes through absolute URLs unchanged", () => {
    const url = "https://offgrid-lifestyle.vercel.app/account/orders/OG-2";
    expect(absoluteNotificationUrl(url, "https://offgrid-lifestyle.vercel.app")).toBe(url);
  });
});
