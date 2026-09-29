import { describe, expect, it } from "vitest";
import {
  createDefaultHeadwearOptions,
  isTowelCustomOrder,
  printOptionsForCustomOrder,
  requiresTeamOrderSheet,
  resolveHeadwearOptions,
} from "./customHeadwearOptions";
import { validateCustomOrderDraft } from "@/src/lib/formValidation";
import { PRINT_OPTIONS } from "@/src/data/customOptions";
import type { CustomOrderDraft } from "@/src/types/commerce";
import { EMPTY_SHIPPING_INFO } from "@/src/types/commerce";

const options = resolveHeadwearOptions(createDefaultHeadwearOptions("t"));

function baseDraft(partial: Partial<CustomOrderDraft> = {}): CustomOrderDraft {
  return {
    id: null,
    category: "headwear_towels",
    headwearType: "towel-hand",
    designFileName: "art.ai",
    designFileKey: "pending-design",
    designFileUrl: null,
    orderSheetFileName: null,
    orderSheetFileKey: null,
    orderSheetFileUrl: null,
    designNotes: "",
    cuts: [],
    materials: [],
    printMethod: "sublimation",
    quantity: 40,
    contactName: "Joax",
    contactEmail: "joax@example.com",
    contactPhone: "+63 917 123 4567",
    teamOrOrg: "OG",
    shippingInfo: {
      ...EMPTY_SHIPPING_INFO,
      fullName: "Joax",
      email: "joax@example.com",
      phone: "+63 917 123 4567",
      region: "NCR",
      regionCode: "130000000",
      province: "Metro Manila",
      provinceCode: "133900000",
      city: "Quezon City",
      cityCode: "137404000",
      barangay: "Alicia",
      barangayCode: "137404001",
      address: "1 Test St",
      zip: "1100",
    },
    estimatedTotal: null,
    depositRequired: null,
    status: "draft",
    createdAt: null,
    updatedAt: null,
    ...partial,
  };
}

describe("bath towel + towel order kit rules", () => {
  it("includes Bath Towel in default options", () => {
    expect(options.some((o) => o.id === "towel-bath" && o.label === "Bath Towel")).toBe(true);
  });

  it("treats bath towel as towel order", () => {
    expect(isTowelCustomOrder("headwear_towels", "towel-bath", options)).toBe(true);
    expect(requiresTeamOrderSheet("headwear_towels", "towel-bath", options)).toBe(false);
  });

  it("limits towel print methods to sublimation", () => {
    const prints = printOptionsForCustomOrder("headwear_towels", "towel-bath", options);
    expect(prints.map((p) => p.id)).toEqual(["sublimation"]);
  });

  it("allows towel submit without order sheet when quantity and sublimation set", () => {
    const errors = validateCustomOrderDraft(baseDraft({ headwearType: "towel-bath" }), {
      headwearOptions: options,
    });
    expect(errors.filter((e) => /order sheet/i.test(e))).toEqual([]);
    expect(errors).toEqual([]);
  });

  it("rejects non-sublimation towel print", () => {
    const errors = validateCustomOrderDraft(
      baseDraft({ headwearType: "towel-hand", printMethod: "embroidery" }),
      { headwearOptions: options },
    );
    expect(errors.some((e) => /sublimation only/i.test(e))).toBe(true);
  });

  it("still requires order sheet for apparel", () => {
    const errors = validateCustomOrderDraft(
      baseDraft({
        category: "apparel",
        headwearType: null,
        cuts: ["short_sleeve"],
        materials: ["dri_fit"],
        quantity: 10,
      }),
      { headwearOptions: options },
    );
    expect(errors.some((e) => /order sheet/i.test(e))).toBe(true);
  });

  it("rejects apparel fabrics the print method does not allow, and retired methods", () => {
    const apparel = {
      category: "apparel" as const,
      headwearType: null,
      cuts: ["short_sleeve" as const],
      quantity: 10,
    };
    const mismatch = validateCustomOrderDraft(
      baseDraft({ ...apparel, printMethod: "embroidery", materials: ["running_mesh"] }),
      { headwearOptions: options, printMethods: PRINT_OPTIONS },
    );
    expect(mismatch.some((e) => /not available with Embroidery/i.test(e))).toBe(true);

    const retired = validateCustomOrderDraft(
      baseDraft({ ...apparel, printMethod: "heat_transfer", materials: ["dri_fit"] }),
      { headwearOptions: options, printMethods: PRINT_OPTIONS },
    );
    expect(retired.some((e) => /no longer offered/i.test(e))).toBe(true);
  });
});
