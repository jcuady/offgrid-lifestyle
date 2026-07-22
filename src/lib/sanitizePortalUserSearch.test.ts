import { describe, expect, it } from "vitest";
import { sanitizePortalUserSearch } from "@/src/lib/sanitizePortalUserSearch";

describe("sanitizePortalUserSearch", () => {
  it("trims whitespace", () => {
    expect(sanitizePortalUserSearch("  Jane  ")).toBe("Jane");
  });

  it("strips PostgREST filter metacharacters", () => {
    expect(sanitizePortalUserSearch("a%b_c,d")).toBe("a b c d");
  });

  it("caps length at 80", () => {
    expect(sanitizePortalUserSearch("x".repeat(100))).toHaveLength(80);
  });
});
