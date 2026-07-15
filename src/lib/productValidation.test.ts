import { describe, expect, it } from "vitest";
import { products } from "@/src/data/products";
import { normalizeProductDraft, parseLabelsInput, validateProductDraft } from "./productValidation";

describe("catalog protocol v2", () => {
  it("normalizes unique sports and promo tags", () => {
    expect(parseLabelsInput("Running, Pickleball, Running")).toEqual(["Running", "Pickleball"]);

    const draft = {
      ...products[0],
      sports: ["Ultimate Frisbee", "Running", "Ultimate Frisbee"],
      tags: ["Promo", "Sale", "Promo"],
    };
    const normalized = normalizeProductDraft(draft, draft.id);
    expect(normalized.sports).toEqual(["Ultimate Frisbee", "Running"]);
    expect(normalized.tags).toEqual(["Promo", "Sale"]);
    expect(normalized.tag).toBe("Promo");
  });

  it("accepts a lower sale price and rejects invalid pricing", () => {
    const product = { ...products[0], basePrice: 1_200, price: 900, sports: ["Ultimate Frisbee"] };
    expect(validateProductDraft({ draft: product, products: [product], editingId: product.id }).price).toBeUndefined();

    const invalid = { ...product, price: 1_300 };
    expect(validateProductDraft({ draft: invalid, products: [invalid], editingId: invalid.id }).price).toBe(
      "Discount price cannot exceed the regular price.",
    );
  });
});
