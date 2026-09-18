import { describe, expect, it } from "vitest";
import { isActivePortalAdmin } from "./portalAdminAuth";

describe("isActivePortalAdmin", () => {
  it("accepts active admin portal rows", () => {
    expect(isActivePortalAdmin({ id: "a", role: "admin", status: "active" })).toBe(true);
  });

  it("rejects inactive admin, staff, and missing rows", () => {
    expect(isActivePortalAdmin({ id: "a", role: "admin", status: "inactive" })).toBe(false);
    expect(isActivePortalAdmin({ id: "a", role: "staff", status: "active" })).toBe(false);
    expect(isActivePortalAdmin(null)).toBe(false);
  });

  it("rejects forged JWT metadata alone (no DB row)", () => {
    expect(isActivePortalAdmin(undefined)).toBe(false);
  });
});
