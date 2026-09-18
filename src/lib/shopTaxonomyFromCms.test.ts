import { describe, expect, it } from "vitest";
import type { CatalogTerm } from "@/src/services/catalogTermsService";
import {
  catalogCollectionsToShopLinks,
  catalogSportsToShopLinks,
  productMatchesCollectionSlug,
  shopCollectionHref,
  shopSportHref,
} from "./shopTaxonomyFromCms";

const collection: CatalogTerm = {
  id: "1",
  kind: "collection",
  label: "Solar",
  slug: "solar",
  sortOrder: 10,
  description: "Sun-ready line",
  imageUrl: null,
  published: true,
};

const sport: CatalogTerm = {
  id: "2",
  kind: "sport",
  label: "Pickleball",
  slug: "pickleball",
  sortOrder: 5,
  description: "Court kits",
  imageUrl: null,
  published: true,
};

describe("shopTaxonomyFromCms", () => {
  it("builds collection and sport shop hrefs", () => {
    expect(shopCollectionHref("solar")).toBe("/shop?collection=solar");
    expect(shopSportHref("Pickleball")).toBe("/shop?category=Pickleball");
  });

  it("maps published CMS terms to shop links and skips drafts", () => {
    const links = catalogCollectionsToShopLinks([
      collection,
      { ...collection, id: "x", slug: "hidden", published: false },
    ]);
    expect(links).toHaveLength(1);
    expect(links[0]?.href).toBe("/shop?collection=solar");
    expect(links[0]?.description).toBe("Sun-ready line");

    const sports = catalogSportsToShopLinks([sport]);
    expect(sports[0]?.href).toBe("/shop?category=Pickleball");
  });

  it("matches products by collection slug on collectionIds", () => {
    expect(
      productMatchesCollectionSlug({ collectionIds: ["discfest", "solar"] } as never, "solar"),
    ).toBe(true);
    expect(productMatchesCollectionSlug({ collectionIds: ["Discfest"] } as never, "discfest")).toBe(true);
    expect(productMatchesCollectionSlug({ collectionIds: [] } as never, "solar")).toBe(false);
  });
});
