import { describe, expect, it } from "vitest";
import { isServiceRoleBearer, readJwtRoleClaim } from "./serviceRoleAuth";

function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.sig`;
}

describe("serviceRoleAuth", () => {
  it("matches exact service role secrets", () => {
    expect(isServiceRoleBearer("sb_secret_abc", "sb_secret_abc")).toBe(true);
    expect(isServiceRoleBearer("sb_secret_abc", "other")).toBe(false);
  });

  it("accepts JWT bearer with role service_role when secrets differ", () => {
    const jwt = fakeJwt({ role: "service_role", ref: "sswz" });
    expect(readJwtRoleClaim(jwt)).toBe("service_role");
    expect(isServiceRoleBearer(jwt, "sb_secret_other")).toBe(true);
  });

  it("rejects JWT bearer with other roles", () => {
    const jwt = fakeJwt({ role: "authenticated", sub: "user-1" });
    expect(isServiceRoleBearer(jwt, "sb_secret_other")).toBe(false);
  });
});
