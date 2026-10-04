import { describe, it, expect } from "vitest";
import {
  PREORDER_SRP,
  PREORDER_DISCOUNT_PERCENT,
  PREORDER_PRICE,
  PREORDER_MAX_SLOTS,
  PREORDER_DESIGNS,
  PREORDER_VENUES,
  PREORDER_SIZES,
  isPreorderWindowActive,
  isPreorderWindowClosed,
  isOfficialReleaseLive,
  PREORDER_PRODUCT_SLUG,
  PREORDER_PATH,
} from "./preorderConfig";

describe("preorderConfig", () => {
  it("has correct pricing math for 5% off promo", () => {
    expect(PREORDER_SRP).toBe(800);
    expect(PREORDER_DISCOUNT_PERCENT).toBe(5);
    const calculatedDiscount = PREORDER_SRP * (1 - PREORDER_DISCOUNT_PERCENT / 100);
    expect(PREORDER_PRICE).toBe(calculatedDiscount);
    expect(PREORDER_PRICE).toBe(760);
  });

  it("enforces 30 max slots", () => {
    expect(PREORDER_MAX_SLOTS).toBe(30);
  });

  it("has all 4 designated designs with correct asset paths", () => {
    expect(PREORDER_DESIGNS).toHaveLength(4);
    const designNames = PREORDER_DESIGNS.map((d) => d.name);
    expect(designNames).toContain("Chill Sunday");
    expect(designNames).toContain("Coffee and Cup");
    expect(designNames).toContain("Dink and Drink");
    expect(designNames).toContain("Matcha Therapy");

    for (const d of PREORDER_DESIGNS) {
      expect(d.image).toMatch(/^\/images\/products\/social-club-.*\.webp$/);
    }
  });

  it("has correct venue definitions for Kado Kohi and Manila Bloc Fest", () => {
    expect(PREORDER_VENUES.kado_kohi).toBeDefined();
    expect(PREORDER_VENUES.kado_kohi.name).toContain("Kado Kohi");
    expect(PREORDER_VENUES.kado_kohi.availableDate).toContain("October 15");
    expect(PREORDER_VENUES.kado_kohi.mapsUrl).toContain("maps.app.goo.gl");

    expect(PREORDER_VENUES.manila_bloc).toBeDefined();
    expect(PREORDER_VENUES.manila_bloc.name).toContain("Manila Bloc Fest");
    expect(PREORDER_VENUES.manila_bloc.availableDate).toContain("October 17 & 18");
  });

  it("includes streetwear sizes S through 3XL", () => {
    expect(PREORDER_SIZES).toEqual(["S", "M", "L", "XL", "2XL", "3XL"]);
  });

  it("correctly checks pre-order window active status across dates", () => {
    // Before Oct 5
    const beforeDate = new Date("2026-10-04T12:00:00+08:00");
    expect(isPreorderWindowActive(beforeDate)).toBe(false);
    expect(isPreorderWindowClosed(beforeDate)).toBe(false);

    // During window: Oct 5 to Oct 9
    const duringDate1 = new Date("2026-10-05T09:00:00+08:00");
    expect(isPreorderWindowActive(duringDate1)).toBe(true);

    const duringDate2 = new Date("2026-10-09T20:00:00+08:00");
    expect(isPreorderWindowActive(duringDate2)).toBe(true);

    // After Oct 9
    const afterDate = new Date("2026-10-10T00:00:01+08:00");
    expect(isPreorderWindowActive(afterDate)).toBe(false);
    expect(isPreorderWindowClosed(afterDate)).toBe(true);
    expect(isOfficialReleaseLive(afterDate)).toBe(false);

    // Official release: Oct 15
    const releaseDate = new Date("2026-10-15T00:00:00+08:00");
    expect(isOfficialReleaseLive(releaseDate)).toBe(true);
  });

  it("has consistent slug and path", () => {
    expect(PREORDER_PRODUCT_SLUG).toBe("the-social-club-collection");
    expect(PREORDER_PATH).toBe("/pre-order/social-club");
  });
});
