import { describe, expect, it } from "vitest";
import { buildCmsImagePath } from "./cmsImageUpload";
import { cmsTypographyStyle, sanitizeCmsColor } from "./cmsTypography";
import { normalizeLandingContent } from "./normalizeLandingContent";
import type { LandingContent } from "@/src/data/landingContent";
import { initialLandingContent } from "@/src/data/landingContent";

describe("cmsTypography", () => {
  it("accepts valid hex colors and rejects invalid values", () => {
    expect(sanitizeCmsColor("#1a3d2e")).toBe("#1a3d2e");
    expect(sanitizeCmsColor("1a3d2e")).toBe("#1a3d2e");
    expect(sanitizeCmsColor("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeCmsColor("#fff")).toBeUndefined();
  });

  it("applies typography overrides only when set", () => {
    expect(cmsTypographyStyle({}, "heading")).toEqual({});
    expect(
      cmsTypographyStyle({ headingColor: "#112233", headingSize: "lg" }, "heading"),
    ).toEqual({ color: "#112233", fontSize: "3rem" });
  });
});

describe("normalizeLandingContent", () => {
  it("fills new CMS fields from defaults when missing in persisted JSON", () => {
    const partial: Partial<LandingContent> = {
      hero: { ...initialLandingContent.hero, badge: "Custom badge" },
    };
    const merged = normalizeLandingContent(partial);
    expect(merged.hero.badge).toBe("Custom badge");
    expect(merged.hero.description).toBe(initialLandingContent.hero.description);
    expect(merged.teamCommunity.badge).toBe(initialLandingContent.teamCommunity.badge);
    expect(merged.collectionsViewAllLabel).toBe(initialLandingContent.collectionsViewAllLabel);
    expect(merged.typography.hero).toEqual({});
  });
});

describe("cmsImageUpload", () => {
  it("builds safe storage paths under landing/", () => {
    const path = buildCmsImagePath("Hero Section!", "my photo.JPG");
    expect(path).toMatch(/^landing\/hero-section\/\d+-[a-z0-9]+\.jpg$/);
  });
});
