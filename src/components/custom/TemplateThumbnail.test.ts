import { describe, expect, it } from "vitest";
import { createCanonicalOgTemplates } from "@/src/store/useSiteContentStore";
import { templateArtKind } from "./TemplateThumbnail";

describe("templateArtKind", () => {
  it("gives every canonical template a garment-specific drawing", () => {
    const kinds = Object.fromEntries(createCanonicalOgTemplates("t").map((t) => [t.id, templateArtKind(t)]));
    expect(kinds).toMatchObject({
      "tpl-ogl-shirt": "tee",
      "tpl-ogl-banner": "banner",
      "tpl-og-roundneck": "tee",
      "tpl-ogl-singlet": "singlet",
      "tpl-ogl-longsleeves": "longsleeve",
      "tpl-ogl-longsleeves-hoodie": "hoodie",
      "tpl-ogl-shorts": "shorts",
      "tpl-headwear-cap": "cap",
      "tpl-headwear-bucket": "bucket",
      "tpl-facetowel-ai": "towel",
    });
  });

  it("falls back to category for admin-added slots with generic names", () => {
    expect(templateArtKind({ id: "tpl-x", name: "Team kit v2", category: "headwear" })).toBe("cap");
    expect(templateArtKind({ id: "tpl-y", name: "Short sleeve polo", category: "jerseys" })).toBe("tee");
  });
});
