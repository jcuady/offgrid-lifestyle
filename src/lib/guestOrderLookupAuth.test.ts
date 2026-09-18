import { describe, expect, it } from "vitest";
import {
  guestOrderLookupAuthorized,
  normalizeGuestLookupEmail,
} from "@/src/lib/guestOrderLookupAuth";

describe("guestOrderLookupAuth", () => {
  it("normalizes email for comparison", () => {
    expect(normalizeGuestLookupEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("authorizes when emails match case-insensitively", () => {
    expect(guestOrderLookupAuthorized("Order@Brand.ph", "order@brand.ph")).toBe(true);
  });

  it("rejects mismatch or empty", () => {
    expect(guestOrderLookupAuthorized("a@b.com", "c@d.com")).toBe(false);
    expect(guestOrderLookupAuthorized(null, "a@b.com")).toBe(false);
    expect(guestOrderLookupAuthorized("a@b.com", "   ")).toBe(false);
  });
});
