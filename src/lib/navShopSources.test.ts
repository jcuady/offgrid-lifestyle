import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const navbarPath = join(dirname(fileURLToPath(import.meta.url)), "../components/Navbar.tsx");

describe("Navbar shop IA", () => {
  it("does not use static SHOP_BY_COLLECTION dropdown data", () => {
    const source = readFileSync(navbarPath, "utf8");
    expect(source).not.toContain("SHOP_BY_COLLECTION");
    expect(source).not.toContain("isSportMenuOpen");
    expect(source).not.toContain("isCollectionMenuOpen");
  });
});
