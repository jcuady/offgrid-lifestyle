import { describe, expect, it } from "vitest";
import {
  foldPlaceName,
  getCitiesForProvince,
  getCityZipCode,
  searchPsgcLocations,
} from "./philippinesAddress";

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

describe("Philippines address search", () => {
  it("folds accents and the package's mojibake so Las Pinas matches", () => {
    expect(foldPlaceName("City of Las PiÃ±as")).toBe("las pinas");
    expect(foldPlaceName("Las Piñas")).toBe("las pinas");
  });

  it("resolves Makati to Metro Manila, not Sarangani", async () => {
    const results = await searchPsgcLocations("poblacion makati", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((row) => row.psgc?.regionCode === "1300000000")).toBe(true);
    expect(results.every((row) => row.psgc?.province === "Metro Manila (NCR)")).toBe(true);
    expect(results.some((row) => /poblacion/i.test(row.psgc?.barangay ?? ""))).toBe(true);
  });

  it("finds Las Piñas when the query has no tilde", async () => {
    const results = await searchPsgcLocations("las pinas", 3);
    expect(results.some((row) => row.psgc?.city === "City of Las Piñas")).toBe(true);
  });

  it("does not list Metro Manila cities under Sarangani", async () => {
    const cities = await getCitiesForProvince("1208000000", "1200000000");
    expect(cities.some((city) => city.name === "City of Manila" || city.code.startsWith("138"))).toBe(false);
    expect(cities.length).toBeGreaterThan(0);
  });

  it("fills a ZIP for Quezon City, which the dataset leaves blank", async () => {
    expect(await getCityZipCode("1381300000")).toBe("1100");
    expect(await getCityZipCode("1380500000")).toBe("1550");
  });
});
