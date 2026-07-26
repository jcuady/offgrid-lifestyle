import { describe, expect, it } from "vitest";
import { validateDisplayName } from "./displayName";

describe("validateDisplayName", () => {
  it("rejects short names", () => {
    expect(validateDisplayName("Ada", "A")).toMatch(/at least 2/i);
  });

  it("rejects unchanged names", () => {
    expect(validateDisplayName("Ada Lovelace", "Ada Lovelace")).toMatch(/different/i);
  });

  it("accepts a new name", () => {
    expect(validateDisplayName("Ada", "Ada Lovelace")).toBeNull();
  });
});
