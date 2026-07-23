import { describe, expect, it } from "vitest";
import { parseSavedShipping } from "@/src/lib/formValidation";
import { EMPTY_SHIPPING_INFO } from "@/src/types/commerce";

const valid: typeof EMPTY_SHIPPING_INFO = {
  ...EMPTY_SHIPPING_INFO,
  fullName: "Joax Cruz",
  email: "joax14@gmail.com",
  phone: "+63 917 123 4567",
  address: "123 Rizal St",
  barangay: "San Antonio",
  city: "Makati City",
  province: "Metro Manila (NCR)",
  region: "National Capital Region (NCR)",
  zip: "1200",
  regionCode: "1300000000",
  provinceCode: "1300000000",
  cityCode: "1380100000",
  barangayCode: "1380100001",
};

describe("parseSavedShipping", () => {
  it("returns null for empty or invalid payloads", () => {
    expect(parseSavedShipping(null)).toBeNull();
    expect(parseSavedShipping({})).toBeNull();
    expect(parseSavedShipping({ fullName: "Only name" })).toBeNull();
  });

  it("accepts a complete Philippines shipping payload", () => {
    const parsed = parseSavedShipping(valid);
    expect(parsed?.fullName).toBe("Joax Cruz");
    expect(parsed?.zip).toBe("1200");
    expect(parsed?.regionCode).toBe("1300000000");
    expect(parsed?.provinceCode).toBe("1300000000");
  });
});
