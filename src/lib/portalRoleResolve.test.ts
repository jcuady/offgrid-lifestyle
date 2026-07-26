import { describe, expect, it } from "vitest";
import { resolvePortalRoleFromSources } from "./portalRoleResolve";

describe("resolvePortalRoleFromSources", () => {
  it("prefers active DB role", () => {
    expect(
      resolvePortalRoleFromSources({
        activeDbRole: "staff",
        hasPortalRow: true,
        jwtPortalRole: "admin",
      }),
    ).toBe("staff");
  });

  it("does not elevate inactive rows via JWT", () => {
    expect(
      resolvePortalRoleFromSources({
        activeDbRole: null,
        hasPortalRow: true,
        jwtPortalRole: "staff",
      }),
    ).toBe("customer");
  });

  it("allows JWT fallback only when no portal row exists", () => {
    expect(
      resolvePortalRoleFromSources({
        activeDbRole: null,
        hasPortalRow: false,
        jwtPortalRole: "admin",
      }),
    ).toBe("admin");
  });
});
