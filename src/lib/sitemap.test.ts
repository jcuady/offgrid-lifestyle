import { describe, expect, it } from "vitest";
import {
  STATIC_SITEMAP_ENTRIES,
  buildSitemapXml,
  mergeSitemapEntries,
  productSitemapEntry,
} from "./sitemap";

describe("sitemap", () => {
  it("includes product PDP paths when slugs are provided", () => {
    const entries = mergeSitemapEntries(STATIC_SITEMAP_ENTRIES, ["salmon-smasher-tee", "motoline-jersey"]);
    const paths = entries.map((e) => e.path);
    expect(paths).toContain("/shop/salmon-smasher-tee");
    expect(paths).toContain("/shop/motoline-jersey");
  });

  it("dedupes static and product paths", () => {
    const entries = mergeSitemapEntries(STATIC_SITEMAP_ENTRIES, ["salmon-smasher-tee", "salmon-smasher-tee"]);
    expect(entries.filter((e) => e.path === "/shop/salmon-smasher-tee")).toHaveLength(1);
  });

  it("emits valid xml with canonical host", () => {
    const xml = buildSitemapXml("https://www.oglifestyleph.com", [
      productSitemapEntry("test-product"),
    ]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<loc>https://www.oglifestyleph.com/shop/test-product</loc>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
  });

  it("preserves fractional priorities like 0.85", () => {
    const xml = buildSitemapXml("https://www.oglifestyleph.com", [
      { path: "/collections", changefreq: "weekly", priority: 0.85 },
    ]);
    expect(xml).toContain("<priority>0.85</priority>");
  });
});
