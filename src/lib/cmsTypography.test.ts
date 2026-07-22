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
    expect(merged.gallery.caption).toBe(initialLandingContent.gallery.caption);
    expect(merged.faq.items).toHaveLength(initialLandingContent.faq.items.length);
    expect(merged.typography.hero).toEqual({});
  });

  it("preserves an arbitrary team roster and assigns stable fallback ids", () => {
    const teams = Array.from({ length: 7 }, (_, index) => ({
      name: `Team ${index + 1}`,
      sport: index % 2 ? "Pickleball" : "Ultimate Frisbee",
    }));
    const partial = {
      teamCommunity: {
        ...initialLandingContent.teamCommunity,
        teams,
      },
    } as unknown as Partial<LandingContent>;

    const merged = normalizeLandingContent(partial);

    expect(merged.teamCommunity.teams).toHaveLength(7);
    expect(merged.teamCommunity.teams[0]).toEqual({
      id: "team-1",
      name: "Team 1",
      sport: "Ultimate Frisbee",
    });
    expect(merged.teamCommunity.teams[6].name).toBe("Team 7");
  });

  it("preserves an intentionally empty team roster", () => {
    const merged = normalizeLandingContent({
      teamCommunity: {
        ...initialLandingContent.teamCommunity,
        teams: [],
      },
    });

    expect(merged.teamCommunity.teams).toEqual([]);
  });
});

describe("cmsImageUpload", () => {
  it("builds safe storage paths under landing/", () => {
    const path = buildCmsImagePath("Hero Section!", "my photo.JPG");
    expect(path).toMatch(/^landing\/hero-section\/\d+-[a-z0-9]+\.jpg$/);
  });
});
