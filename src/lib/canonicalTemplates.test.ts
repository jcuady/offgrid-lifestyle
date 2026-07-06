import { describe, expect, it } from "vitest";
import { isCanonicalTemplateId, resolveCanonicalTemplates } from "./canonicalTemplates";
import type { CustomTemplateAsset } from "@/src/store/useSiteContentStore";

describe("resolveCanonicalTemplates", () => {
  it("keeps canonical seeds when persisted list is empty", () => {
    const resolved = resolveCanonicalTemplates([]);
    expect(resolved.length).toBeGreaterThan(6);
    expect(resolved.some((t) => t.id === "tpl-ogl-shirt")).toBe(true);
  });

  it("merges persisted preview and publish flags onto canonical slots", () => {
    const resolved = resolveCanonicalTemplates([
      {
        id: "tpl-ogl-shirt",
        category: "jerseys",
        name: "Custom shirt label",
        description: "Custom copy",
        fileName: "oglifestyle-template-shirt.ai",
        fileUrl: "/templates/og-client/oglifestyle-template-shirt.ai",
        format: "AI",
        isPublished: false,
        updatedAt: "2026-01-01T00:00:00.000Z",
        previewImageUrl: "https://cdn.example/preview.png",
      },
    ]);
    const shirt = resolved.find((t) => t.id === "tpl-ogl-shirt");
    expect(shirt?.name).toBe("Custom shirt label");
    expect(shirt?.previewImageUrl).toBe("https://cdn.example/preview.png");
    expect(shirt?.isPublished).toBe(false);
  });

  it("appends custom templates after canonical slots", () => {
    const custom: CustomTemplateAsset = {
      id: "tpl-custom-demo",
      category: "jerseys",
      name: "Club jersey pack",
      description: "Extra slot",
      fileName: "club.ai",
      fileUrl: "https://cdn.example/club.ai",
      format: "AI",
      isPublished: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
      storageKind: "storage",
    };
    const resolved = resolveCanonicalTemplates([custom]);
    expect(resolved.at(-1)?.id).toBe("tpl-custom-demo");
    expect(isCanonicalTemplateId("tpl-custom-demo")).toBe(false);
  });
});
