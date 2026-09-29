import type { GarmentCut, FabricType, PrintMethod } from "@/src/types/commerce";

export interface SelectableOption<T extends string> {
  id: T;
  label: string;
  description: string;
  priceModifier: number;
}

const BASE_UNIT_PRICE = 500;

export const CUT_OPTIONS: SelectableOption<GarmentCut>[] = [
  { id: "short_sleeve",  label: "Short Sleeve",  description: "Classic athletic fit, full range of motion",            priceModifier: 1.0 },
  { id: "long_sleeve",   label: "Long Sleeve",   description: "Full-arm coverage, UV protection for outdoor sport",    priceModifier: 1.15 },
  { id: "sleeveless",    label: "Sleeveless",     description: "Maximum ventilation for high-intensity play",           priceModifier: 0.95 },
  { id: "polo",          label: "Polo",           description: "Collared performance fit for golf and court",           priceModifier: 1.25 },
  { id: "tank",          label: "Tank Top",       description: "Lightweight racerback, ideal for running and beach",    priceModifier: 0.9 },
  { id: "shorts",        label: "Shorts",         description: "7\" inseam, elastic waist, deep pockets",              priceModifier: 1.1 },
];

/** Keep in sync with the `fabric_ids` check in `og_custom_print_methods`. */
export const MATERIAL_OPTIONS: SelectableOption<FabricType>[] = [
  { id: "dri_fit",          label: "Drifit",           description: "Moisture-wicking polyester blend, quick-dry",          priceModifier: 1.0 },
  { id: "running_mesh",     label: "Running Mesh",     description: "Ultra-light mesh with 4-way stretch",                  priceModifier: 1.1 },
  { id: "drifit_polyester", label: "Drifit Polyester", description: "Performance polyester knit with a quick-dry finish",    priceModifier: 1.05 },
  { id: "cotton",           label: "Premium Cotton",   description: "Heavyweight 220 GSM, pre-shrunk, soft hand-feel",      priceModifier: 0.9 },
  { id: "poly_blend",       label: "Poly Blend",       description: "92% polyester, 8% spandex — durable and flexible",     priceModifier: 1.05 },
];

export interface PrintMethodOption extends SelectableOption<PrintMethod> {
  /** Fabrics customers may pick with this print method. */
  fabricIds: FabricType[];
  sortOrder: number;
  isPublished: boolean;
}

/** Offline fallback + seed; live values come from `og_custom_print_methods`. */
export const PRINT_OPTIONS: PrintMethodOption[] = [
  { id: "sublimation", label: "Sublimation", description: "Full-coverage, vibrant print that won't crack or peel", priceModifier: 1.0,  fabricIds: ["dri_fit", "running_mesh", "drifit_polyester"],           sortOrder: 10, isPublished: true },
  { id: "embroidery",  label: "Embroidery",  description: "Premium stitched finish for logos and monograms",       priceModifier: 1.4,  fabricIds: ["dri_fit", "cotton"],                                     sortOrder: 20, isPublished: true },
  { id: "dtf_print",   label: "DTF Print",   description: "Direct-to-film transfer, full-color detail for complex artwork", priceModifier: 1.15, fabricIds: ["dri_fit", "running_mesh", "drifit_polyester", "cotton"], sortOrder: 30, isPublished: true },
  { id: "silk_screen", label: "Silkscreen",  description: "Bold, long-lasting ink for simple designs and logos",   priceModifier: 0.85, fabricIds: ["dri_fit", "drifit_polyester", "cotton"],                 sortOrder: 40, isPublished: true },
];

/** Labels for ids retired from the CMS so older orders still read correctly. */
const RETIRED_PRINT_LABELS: Record<string, string> = {
  heat_transfer: "Heat Transfer",
  digital_print: "Digital Print",
};

export function printMethodLabel(
  id: string | null | undefined,
  methods: readonly PrintMethodOption[] = PRINT_OPTIONS,
): string {
  if (!id) return "—";
  return (
    methods.find((m) => m.id === id)?.label ??
    PRINT_OPTIONS.find((m) => m.id === id)?.label ??
    RETIRED_PRINT_LABELS[id] ??
    id.replace(/[_-]/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())
  );
}

/** Fabrics allowed for a print method, in MATERIAL_OPTIONS order. Empty until a method is picked. */
export function fabricOptionsForPrint(
  printMethod: PrintMethod | null,
  methods: readonly PrintMethodOption[],
): SelectableOption<FabricType>[] {
  const allowed = methods.find((m) => m.id === printMethod)?.fabricIds ?? [];
  return MATERIAL_OPTIONS.filter((o) => allowed.includes(o.id));
}

export function slugifyPrintMethodId(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

/** Quote ceiling: highest selected cut × fabric × print modifiers. */
export function estimateUnitPriceFromSelections(
  cuts: readonly GarmentCut[],
  materials: readonly FabricType[],
  printMethod: PrintMethod | null,
  printMethods: readonly PrintMethodOption[] = PRINT_OPTIONS,
): number {
  const maxMod = (ids: readonly string[], options: readonly SelectableOption<string>[]) => {
    if (!ids.length) return 1;
    return Math.max(...ids.map((id) => options.find((o) => o.id === id)?.priceModifier ?? 1));
  };
  const printMod = printMethods.find((o) => o.id === printMethod)?.priceModifier ?? 1;
  return Math.round(
    BASE_UNIT_PRICE * maxMod(cuts, CUT_OPTIONS) * maxMod(materials, MATERIAL_OPTIONS) * printMod,
  );
}

export function estimateUnitPrice(
  cut: GarmentCut | null,
  material: FabricType | null,
  printMethod: PrintMethod | null,
): number {
  return estimateUnitPriceFromSelections(cut ? [cut] : [], material ? [material] : [], printMethod);
}
