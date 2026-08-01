import { describe, expect, it } from "vitest";
import {
  mergeCatalogLabels,
  renameLabelInList,
  removeLabelFromList,
  renameLabelAcrossProducts,
  removeLabelAcrossProducts,
  slugifyCatalogLabel,
} from "./catalogTaxonomy";

describe("catalog taxonomy CRUD helpers", () => {
  it("slugifies labels for stable ids", () => {
    expect(slugifyCatalogLabel("Ultimate Frisbee")).toBe("ultimate-frisbee");
  });

  it("merges presets with catalog and product-derived labels", () => {
    expect(mergeCatalogLabels(["Promo"], ["Team Bundle"], ["Promo", "Sale"])).toEqual([
      "Promo",
      "Team Bundle",
      "Sale",
    ]);
  });

  it("renames and removes labels in a selection list", () => {
    expect(renameLabelInList(["Promo", "Sale"], "Promo", "Flash Sale")).toEqual(["Flash Sale", "Sale"]);
    expect(removeLabelFromList(["Promo", "Sale"], "Sale")).toEqual(["Promo"]);
  });

  it("renames a tag/sport across every product that uses it", () => {
    const products = [
      { id: "a", tags: ["Promo", "Sale"], sports: ["Golf"] },
      { id: "b", tags: ["Promo"], sports: ["Running", "Golf"] },
      { id: "c", tags: ["New"], sports: ["Pickleball"] },
    ];
    const next = renameLabelAcrossProducts(products, "tags", "Promo", "Featured");
    expect(next.find((p) => p.id === "a")?.tags).toEqual(["Featured", "Sale"]);
    expect(next.find((p) => p.id === "b")?.tags).toEqual(["Featured"]);
    expect(next.find((p) => p.id === "c")?.tags).toEqual(["New"]);

    const sports = renameLabelAcrossProducts(products, "sports", "Golf", "Disc Golf");
    expect(sports.find((p) => p.id === "a")?.sports).toEqual(["Disc Golf"]);
    expect(sports.find((p) => p.id === "b")?.sports).toEqual(["Running", "Disc Golf"]);
  });

  it("removes a label across products", () => {
    const products = [
      { id: "a", tags: ["Promo", "Sale"], sports: ["Golf"] },
      { id: "b", tags: ["Promo"], sports: ["Golf", "Running"] },
    ];
    const next = removeLabelAcrossProducts(products, "tags", "Promo");
    expect(next.find((p) => p.id === "a")?.tags).toEqual(["Sale"]);
    expect(next.find((p) => p.id === "b")?.tags).toEqual([]);
  });
});
