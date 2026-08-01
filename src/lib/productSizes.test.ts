import { describe, expect, it } from "vitest";
import {
  SIZE_PRESETS,
  addCustomSize,
  normalizeSizes,
  toggleSize,
} from "./productSizes";

describe("product sizes multi-select", () => {
  it("normalizes presets and custom sizes without dropping customs", () => {
    expect(normalizeSizes(["xs", "M", "Youth-10", "m", ""])).toEqual(["XS", "M", "YOUTH-10"]);
  });

  it("toggles preset membership", () => {
    expect(toggleSize(["S", "M"], "L")).toEqual(["S", "M", "L"]);
    expect(toggleSize(["S", "M", "L"], "M")).toEqual(["S", "L"]);
  });

  it("adds a custom size and rejects blank/duplicate", () => {
    expect(addCustomSize(["S"], "  XL  ")).toEqual(["S", "XL"]);
    expect(addCustomSize(["S", "XL"], "xl")).toEqual(["S", "XL"]);
    expect(addCustomSize(["S"], "   ")).toEqual(["S"]);
  });

  it("keeps known apparel presets available for the picker", () => {
    expect(SIZE_PRESETS).toContain("XS");
    expect(SIZE_PRESETS).toContain("2XL");
  });
});
