import { describe, expect, it } from "vitest";
import { buildPageNumbers, clampPage, pageRange } from "@/src/lib/portalPagination";

describe("portalPagination", () => {
  it("buildPageNumbers short list", () => {
    expect(buildPageNumbers(1, 3)).toEqual([1, 2, 3]);
  });

  it("buildPageNumbers with ellipsis", () => {
    expect(buildPageNumbers(5, 12)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 12]);
  });

  it("clampPage", () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(3, 0)).toBe(1);
  });

  it("pageRange", () => {
    expect(pageRange(1, 25, 0)).toEqual({ start: 0, end: 0 });
    expect(pageRange(2, 25, 60)).toEqual({ start: 26, end: 50 });
    expect(pageRange(3, 25, 60)).toEqual({ start: 51, end: 60 });
  });
});
