import { describe, expect, it } from "vitest";
import { RETAIL_SIZING_ROWS, retailSizingRowsForProduct } from "./retailSizingGuide";

describe("retail sizing guide", () => {
  it("covers the standard retail size run used in quick view", () => {
    const labels = RETAIL_SIZING_ROWS.map((r) => r.size);
    expect(labels).toEqual(
      expect.arrayContaining(["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"]),
    );
  });

  it("every row has chest, length, and waist measurements", () => {
    for (const row of RETAIL_SIZING_ROWS) {
      expect(row.chest.trim().length).toBeGreaterThan(0);
      expect(row.length.trim().length).toBeGreaterThan(0);
      expect(row.waist.trim().length).toBeGreaterThan(0);
    }
  });

  it("filters rows to the product size list", () => {
    const rows = retailSizingRowsForProduct(["S", "M", "L"]);
    expect(rows.map((r) => r.size)).toEqual(["S", "M", "L"]);
  });
});
