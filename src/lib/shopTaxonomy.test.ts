import { describe, expect, it } from "vitest";
import { SHOP_BY_COLLECTION, SHOP_BY_SPORT } from "./shopTaxonomy";

describe("shopTaxonomy", () => {
  it("features Ultimate Frisbee first in shop-by-sport", () => {
    expect(SHOP_BY_SPORT[0]?.label).toBe("Ultimate Frisbee");
    expect(SHOP_BY_SPORT.map((s) => s.category)).toEqual([
      "Ultimate Frisbee",
      "Gym & Training",
      "Running",
      "Pickleball",
      "Golf",
      "Lifestyle",
    ]);
  });

  it("exposes all 9 official collections", () => {
    expect(SHOP_BY_COLLECTION).toHaveLength(9);
    expect(SHOP_BY_COLLECTION.map((c) => c.category)).toEqual([
      "pilipinas",
      "primal",
      "solar",
      "running",
      "motoline",
      "the-og-vibe",
      "pickleball",
      "golf",
      "accessories",
    ]);
  });

  it("exposes six sport-led named entry points", () => {
    expect(SHOP_BY_SPORT.map((s) => s.label)).toEqual([
      "Ultimate Frisbee",
      "Gym & Training",
      "Running",
      "Pickleball",
      "Golf",
      "Lifestyle",
    ]);
  });
});
