import type { GarmentCut, FabricType, PrintMethod } from "@/src/types/commerce";

export interface SelectableOption<T extends string> {
  id: T;
  label: string;
  description: string;
  priceModifier: number;
}

export const CUT_OPTIONS: SelectableOption<GarmentCut>[] = [
  { id: "short_sleeve",  label: "Short Sleeve",  description: "Classic athletic fit, full range of motion",            priceModifier: 1.0 },
  { id: "long_sleeve",   label: "Long Sleeve",   description: "Full-arm coverage, UV protection for outdoor sport",    priceModifier: 1.15 },
  { id: "sleeveless",    label: "Sleeveless",     description: "Maximum ventilation for high-intensity play",           priceModifier: 0.95 },
  { id: "polo",          label: "Polo",           description: "Collared performance fit for golf and court",           priceModifier: 1.25 },
  { id: "tank",          label: "Tank Top",       description: "Lightweight racerback, ideal for running and beach",    priceModifier: 0.9 },
  { id: "shorts",        label: "Shorts",         description: "7\" inseam, elastic waist, deep pockets",              priceModifier: 1.1 },
];

export const MATERIAL_OPTIONS: SelectableOption<FabricType>[] = [
  { id: "dri_fit",       label: "Drifit",         description: "Moisture-wicking polyester blend, quick-dry",          priceModifier: 1.0 },
  { id: "cotton",        label: "Premium Cotton",  description: "Heavyweight 220 GSM, pre-shrunk, soft hand-feel",     priceModifier: 0.9 },
  { id: "running_mesh",  label: "Running Mesh",   description: "Ultra-light mesh with 4-way stretch",                  priceModifier: 1.1 },
  { id: "poly_blend",    label: "Poly Blend",     description: "92% polyester, 8% spandex — durable and flexible",     priceModifier: 1.05 },
];

export const PRINT_OPTIONS: SelectableOption<PrintMethod>[] = [
  { id: "sublimation",   label: "Sublimation",    description: "Full-coverage, vibrant print that won't crack or peel", priceModifier: 1.0 },
  { id: "silk_screen",   label: "Silk Screen",    description: "Bold, long-lasting ink for simple designs and logos",    priceModifier: 0.85 },
  { id: "embroidery",    label: "Embroidery",     description: "Premium stitched finish for logos and monograms",       priceModifier: 1.4 },
  { id: "heat_transfer", label: "Heat Transfer",  description: "Photo-quality detail on small to medium areas",         priceModifier: 0.95 },
  { id: "digital_print", label: "Digital Print",  description: "On-demand, full-color, ideal for complex artwork",      priceModifier: 1.15 },
];

const BASE_UNIT_PRICE = 500;

export function estimateUnitPrice(
  cut: GarmentCut | null,
  material: FabricType | null,
  printMethod: PrintMethod | null,
): number {
  const cutMod = CUT_OPTIONS.find((o) => o.id === cut)?.priceModifier ?? 1;
  const matMod = MATERIAL_OPTIONS.find((o) => o.id === material)?.priceModifier ?? 1;
  const printMod = PRINT_OPTIONS.find((o) => o.id === printMethod)?.priceModifier ?? 1;
  return Math.round(BASE_UNIT_PRICE * cutMod * matMod * printMod);
}
