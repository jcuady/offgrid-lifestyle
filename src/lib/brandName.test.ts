import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND_APP_NAME, BRAND_LEGAL_NAME, BRAND_NAME, BRAND_WORDMARK } from "./brandName";

// Built in parts so this file does not contain the forbidden PascalCase literals.
const FORBIDDEN = new RegExp(`\\bOff${"Grid"}\\b|\\bOff${"grid"}\\b`);

const ROOTS = ["src", "supabase/functions", "index.html", "metadata.json"];
const EXT = /\.(tsx?|jsx?|html|json)$/;

function walk(path: string, out: string[] = []): string[] {
  const st = statSync(path);
  if (st.isFile()) {
    if (EXT.test(path) || path.endsWith("index.html") || path.endsWith("metadata.json")) out.push(path);
    return out;
  }
  for (const name of readdirSync(path)) {
    if (name === "node_modules" || name === "dist") continue;
    walk(join(path, name), out);
  }
  return out;
}

describe("brand display casing", () => {
  it("exports professional all-caps brand constants", () => {
    expect(BRAND_NAME).toBe("OFFGRID");
    expect(BRAND_APP_NAME).toBe("OFFGRID");
    expect(BRAND_WORDMARK).toBe("OFF GRID®");
    expect(BRAND_LEGAL_NAME).toBe("OFFGRID® Lifestyle");
  });

  it("forbids mixed-case brand labels in user-facing source", () => {
    const cwd = process.cwd();
    const files = ROOTS.flatMap((root) => walk(join(cwd, root)));
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (FORBIDDEN.test(text)) {
        hits.push(relative(cwd, file).replaceAll("\\", "/"));
      }
    }
    expect(hits).toEqual([]);
  });
});
