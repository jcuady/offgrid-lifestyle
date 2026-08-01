import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("CustomOrderPage hero clutter", () => {
  const page = readFileSync(resolve(process.cwd(), "src/pages/CustomOrderPage.tsx"), "utf8");
  const content = readFileSync(resolve(process.cwd(), "src/data/customPageContent.ts"), "utf8");

  it("does not render a redundant TEAM ORDERS badge above the H1", () => {
    expect(page).not.toMatch(/hero\.badge/);
    expect(page).not.toMatch(/rounded-full border border-offgrid-cream\/25/);
    expect(content).not.toMatch(/badge:\s*"Team orders"/);
  });

  it("does not stack a section eyebrow that restates Team order system", () => {
    expect(page).not.toMatch(/How team orders work/);
  });
});
