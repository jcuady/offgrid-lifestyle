import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ProductQuickViewModal sizing + buy now", () => {
  const source = readFileSync(resolve(process.cwd(), "src/components/ProductQuickViewModal.tsx"), "utf8");

  it("opens SizeGuideModal instead of navigating away for sizing guide", () => {
    expect(source).toMatch(/SizeGuideModal/);
    expect(source).toMatch(/setSizeGuideOpen\(true\)/);
    expect(source).not.toMatch(/to="\/custom#sizing-chart"/);
  });

  it("renders Buy now without a leading icon", () => {
    expect(source).toMatch(/>\s*Buy now\s*</);
    expect(source).not.toMatch(/from "lucide-react".*Zap|Zap.*from "lucide-react"/s);
    expect(source).not.toMatch(/<Zap\b/);
  });
});
