import { describe, expect, it } from "vitest";
import {
  BRAND_SEARCH_ALIASES,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TITLE,
  SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
} from "./siteSeo";

describe("siteSeo brand discovery", () => {
  it("targets OFFGRID Lifestyle and common alias searches in title and description", () => {
    expect(SITE_TITLE).toMatch(/OFFGRID® Lifestyle/i);
    expect(SITE_DESCRIPTION).toMatch(/OFF GRID/i);
    expect(SITE_DESCRIPTION).toMatch(/OG Lifestyle/i);
  });

  it("includes alias keywords for meta and structured data", () => {
    expect(BRAND_SEARCH_ALIASES).toContain("OG Lifestyle");
    expect(BRAND_SEARCH_ALIASES).toContain("oglifestyleph");
    expect(SITE_KEYWORDS).toMatch(/OG Lifestyle/i);
    expect(SITE_KEYWORDS).toMatch(/OFF GRID/i);
  });

  it("publishes Organization + WebSite JSON-LD on the canonical www host", () => {
    expect(SITE_URL).toBe("https://www.oglifestyleph.com");

    const org = organizationJsonLd();
    expect(org["@id"]).toBe(`${SITE_URL}/#organization`);
    expect(org.alternateName).toEqual(
      expect.arrayContaining(["OG Lifestyle", "OFF GRID", "oglifestyleph"]),
    );

    const site = websiteJsonLd();
    expect(site["@id"]).toBe(`${SITE_URL}/#website`);
    expect(site.publisher).toEqual({ "@id": `${SITE_URL}/#organization` });
    expect(site.alternateName).toEqual(expect.arrayContaining(["OG Lifestyle"]));
  });
});
