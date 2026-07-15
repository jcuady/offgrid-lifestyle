import { describe, expect, it } from "vitest";
import { SHOP_BY_COLLECTION, SHOP_BY_SPORT } from "./shopTaxonomy";

describe("shopTaxonomy", () => {
  it("features Ultimate Frisbee first in shop-by-sport", () => {
    expect(SHOP_BY_SPORT[0]?.label).toBe("Ultimate Frisbee");
    expect(SHOP_BY_SPORT.map((s) => s.category)).toEqual([
      "Ultimate Frisbee",
      "Pickleball",
      "Golf",
      "Running",
    ]);
  });

  it("keeps Discfest under Ultimate Frisbee category for collection browse", () => {
    const discfest = SHOP_BY_COLLECTION.find((c) => c.label === "Discfest");
    expect(discfest?.category).toBe("Ultimate Frisbee");
  });
});
