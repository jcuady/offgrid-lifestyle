import { describe, expect, it } from "vitest";
import { getPasswordStrength } from "./passwordStrength";

describe("getPasswordStrength", () => {
  it("returns empty for blank input", () => {
    const s = getPasswordStrength("");
    expect(s.level).toBe("empty");
    expect(s.isStrongEnough).toBe(false);
    expect(s.checks.every((c) => !c.met)).toBe(true);
  });

  it("marks short passwords weak even with mixed chars", () => {
    const s = getPasswordStrength("Ab1!");
    expect(s.checks.find((c) => c.id === "minLength")?.met).toBe(false);
    expect(s.level).toBe("weak");
    expect(s.isStrongEnough).toBe(false);
  });

  it("guides toward strong when length + cases + number + symbol", () => {
    // Independent worked example: meets all 5 checklist items
    const s = getPasswordStrength("Offgrid1!");
    expect(s.checks.every((c) => c.met)).toBe(true);
    expect(s.level).toBe("strong");
    expect(s.isStrongEnough).toBe(true);
    expect(s.label).toBe("Strong");
  });

  it("stays fair when only length + lower + upper", () => {
    const s = getPasswordStrength("Offgridxx");
    expect(s.level).toBe("fair");
    expect(s.isStrongEnough).toBe(false);
  });
});
