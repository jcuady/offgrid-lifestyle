import { beforeEach, describe, expect, it } from "vitest";
import {
  PRINT_OPTIONS,
  fabricOptionsForPrint,
  printMethodLabel,
  slugifyPrintMethodId,
} from "./customOptions";
import { printOptionsForCustomOrder } from "./customHeadwearOptions";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";

const fabricLabels = (printId: string) =>
  fabricOptionsForPrint(printId, PRINT_OPTIONS).map((o) => o.label);

describe("print method → fabric rules", () => {
  it("offers only the four current print methods (no Heat Transfer)", () => {
    expect(PRINT_OPTIONS.map((o) => o.label)).toEqual(["Sublimation", "Embroidery", "DTF Print", "Silkscreen"]);
  });

  it("maps each print method to its allowed fabrics", () => {
    expect(fabricLabels("sublimation")).toEqual(["Drifit", "Running Mesh", "Drifit Polyester"]);
    expect(fabricLabels("embroidery")).toEqual(["Drifit", "Premium Cotton"]);
    expect(fabricLabels("dtf_print")).toEqual(["Drifit", "Running Mesh", "Drifit Polyester", "Premium Cotton"]);
    expect(fabricLabels("silk_screen")).toEqual(["Drifit", "Drifit Polyester", "Premium Cotton"]);
  });

  it("shows no fabrics until a print method is picked", () => {
    expect(fabricOptionsForPrint(null, PRINT_OPTIONS)).toEqual([]);
  });

  it("hides unpublished methods from the wizard but keeps towels on sublimation", () => {
    const methods = [...PRINT_OPTIONS, { ...PRINT_OPTIONS[1], id: "puff", label: "Puff", isPublished: false }];
    expect(printOptionsForCustomOrder("apparel", null, [], methods).map((o) => o.id)).not.toContain("puff");
    expect(printOptionsForCustomOrder("headwear_towels", "towel-face", [], methods).map((o) => o.id)).toEqual([
      "sublimation",
    ]);
  });

  it("labels retired and admin-added ids for old orders", () => {
    expect(printMethodLabel("dtf_print")).toBe("DTF Print");
    expect(printMethodLabel("heat_transfer")).toBe("Heat Transfer");
    expect(printMethodLabel("digital_print")).toBe("Digital Print");
    expect(printMethodLabel("puff_print")).toBe("Puff Print");
    expect(printMethodLabel(null)).toBe("—");
  });

  it("slugifies admin labels into safe ids", () => {
    expect(slugifyPrintMethodId("  Puff Print (3D) ")).toBe("puff_print_3d");
  });
});

describe("setPrintMethod", () => {
  beforeEach(() => useCustomOrderStore.getState().resetDraft());

  it("drops fabrics the new print method does not allow", () => {
    const store = useCustomOrderStore.getState();
    store.setPrintMethod("dtf_print", PRINT_OPTIONS[2].fabricIds);
    store.toggleMaterial("running_mesh");
    store.toggleMaterial("cotton");
    useCustomOrderStore.getState().setPrintMethod("embroidery", PRINT_OPTIONS[1].fabricIds);
    const { draft } = useCustomOrderStore.getState();
    expect(draft.printMethod).toBe("embroidery");
    expect(draft.materials).toEqual(["cotton"]);
  });
});
