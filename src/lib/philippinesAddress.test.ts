import { describe, expect, it } from "vitest";

// Mirror of fixMojibakeName in philippinesAddress.ts (kept private there).
// ponytail: re-implemented here only because the helper is module-private.
function fixMojibakeName(name: string): string {
  if (!name || (name.indexOf("Ã") === -1 && name.indexOf("Â") === -1)) return name;
  const bytes = new Uint8Array(name.length);
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    if (code > 0xff) return name;
    bytes[i] = code;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

describe("fixMojibakeName (ph-addresses-locations double-encoded UTF-8)", () => {
  it("restores Las Piñas", () => {
    expect(fixMojibakeName("City of Las PiÃ±as")).toBe("City of Las Piñas");
  });

  it("restores Parañaque", () => {
    expect(fixMojibakeName("City of ParaÃ±aque")).toBe("City of Parañaque");
  });

  it("leaves clean names untouched", () => {
    expect(fixMojibakeName("City of Marikina")).toBe("City of Marikina");
    expect(fixMojibakeName("Metro Manila (NCR)")).toBe("Metro Manila (NCR)");
  });

  it("leaves non-mojibake unicode untouched", () => {
    expect(fixMojibakeName("Peñafrancia")).toBe("Peñafrancia");
  });
});
