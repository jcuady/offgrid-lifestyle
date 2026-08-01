import { describe, expect, it } from "vitest";
import { estimateUnitPriceFromSelections } from "@/src/data/customOptions";
import { EMPTY_SHIPPING_INFO, toCustomOrderPayload, type CustomOrderDraft } from "@/src/types/commerce";
import {
  normalizeSpecIds,
  parseCutsFromPayload,
  parseMaterialsFromPayload,
  toggleSpecId,
} from "./customOrderSpecs";

describe("custom order multi-select specs", () => {
  it("normalizes legacy scalar cut/material into arrays", () => {
    expect(normalizeSpecIds("short_sleeve")).toEqual(["short_sleeve"]);
    expect(parseCutsFromPayload({ cut: "polo" })).toEqual(["polo"]);
    expect(parseMaterialsFromPayload({ material: "dri_fit" })).toEqual(["dri_fit"]);
  });

  it("prefers canonical arrays and de-dupes", () => {
    expect(parseCutsFromPayload({ cuts: ["short_sleeve", "shorts", "short_sleeve"], cut: "polo" })).toEqual([
      "short_sleeve",
      "shorts",
    ]);
  });

  it("toggles multi-select membership", () => {
    expect(toggleSpecId(["short_sleeve"], "shorts")).toEqual(["short_sleeve", "shorts"]);
    expect(toggleSpecId(["short_sleeve", "shorts"], "short_sleeve")).toEqual(["shorts"]);
  });

  it("estimates unit price from the highest selected modifiers", () => {
    const unit = estimateUnitPriceFromSelections(
      ["short_sleeve", "polo"],
      ["dri_fit", "running_mesh"],
      "embroidery",
    );
    expect(unit).toBe(Math.round(500 * 1.25 * 1.1 * 1.4));
  });

  it("dual-writes canonical arrays and legacy scalar aliases in payload", () => {
    const draft = {
      id: null,
      category: "apparel",
      headwearType: null,
      designFileName: null,
      designFileKey: null,
      designFileUrl: null,
      orderSheetFileName: "sheet.xlsx",
      orderSheetFileKey: "pending-sheet",
      orderSheetFileUrl: null,
      designNotes: "",
      cuts: ["short_sleeve", "polo"],
      materials: ["dri_fit", "poly_blend"],
      printMethod: "sublimation",
      quantity: 25,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      teamOrOrg: "",
      shippingInfo: { ...EMPTY_SHIPPING_INFO },
      estimatedTotal: null,
      depositRequired: null,
      status: "draft",
      createdAt: null,
      updatedAt: null,
    } satisfies CustomOrderDraft;
    const payload = toCustomOrderPayload(draft);
    expect(payload.cuts).toEqual(["short_sleeve", "polo"]);
    expect(payload.materials).toEqual(["dri_fit", "poly_blend"]);
    expect(payload.cut).toBe("short_sleeve");
    expect(payload.material).toBe("dri_fit");
    expect(payload.printMethod).toBe("sublimation");
  });
});
