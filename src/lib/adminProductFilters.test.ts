import { describe, expect, it } from "vitest";
import { filterAdminProducts, type AdminProductFilters } from "./adminProductFilters";
import type { Product } from "@/src/data/products";

function stub(partial: Partial<Product> & Pick<Product, "id" | "name">): Product {
  return {
    slug: partial.id,
    category: "Pickleball",
    sports: ["Pickleball"],
    basePrice: 1000,
    price: 1000,
    image: "/images/x.png",
    colors: [],
    sizes: ["M"],
    description: "desc",
    material: "dri-fit",
    fabricType: "dri_fit",
    cut: "short_sleeve",
    sold: 0,
    stock: 5,
    tags: [],
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

const catalog = [
  stub({ id: "1", name: "OG Golf Polo", category: "Golf", sports: ["Golf"], tags: ["Promo"], stock: 0, status: "active" }),
  stub({ id: "2", name: "Pickle Club Tee", category: "Pickleball", sports: ["Pickleball"], tags: ["Sale"], stock: 12, status: "draft" }),
  stub({ id: "3", name: "Trail Runner", category: "Running", sports: ["Running"], tags: ["New"], stock: 3, status: "archived", slug: "trail-runner", description: "breathable mesh for hot days" }),
];

describe("admin product filters + smart search", () => {
  it("smart-searches name, slug, description, sports, and tags", () => {
    const q = (query: string) =>
      filterAdminProducts(catalog, { query, status: "all", sport: "all", tag: "all", stock: "all" }).map((p) => p.id);

    expect(q("polo")).toEqual(["1"]);
    expect(q("trail-runner")).toEqual(["3"]);
    expect(q("breathable")).toEqual(["3"]);
    expect(q("sale")).toEqual(["2"]);
  });

  it("filters by status, sport, tag, and stock state", () => {
    const base: AdminProductFilters = { query: "", status: "all", sport: "all", tag: "all", stock: "all" };
    expect(filterAdminProducts(catalog, { ...base, status: "draft" }).map((p) => p.id)).toEqual(["2"]);
    expect(filterAdminProducts(catalog, { ...base, sport: "Golf" }).map((p) => p.id)).toEqual(["1"]);
    expect(filterAdminProducts(catalog, { ...base, tag: "New" }).map((p) => p.id)).toEqual(["3"]);
    expect(filterAdminProducts(catalog, { ...base, stock: "out" }).map((p) => p.id)).toEqual(["1"]);
    expect(filterAdminProducts(catalog, { ...base, stock: "in" }).map((p) => p.id)).toEqual(["2", "3"]);
  });

  it("treats unlimited stock (undefined) as in-stock, not out", () => {
    const withUnlimited = [
      stub({ id: "1", name: "Limited", stock: 0 }),
      stub({ id: "u", name: "Unlimited", stock: undefined }),
    ];
    const base: AdminProductFilters = { query: "", status: "all", sport: "all", tag: "all", stock: "all" };
    expect(filterAdminProducts(withUnlimited, { ...base, stock: "in" }).map((p) => p.id)).toEqual(["u"]);
    expect(filterAdminProducts(withUnlimited, { ...base, stock: "out" }).map((p) => p.id)).toEqual(["1"]);
  });
});
