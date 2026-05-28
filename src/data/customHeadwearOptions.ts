import type { HeadwearType, PrintMethod } from "@/src/types/commerce";
import { PRINT_OPTIONS, type SelectableOption } from "@/src/data/customOptions";

export const HEADWEAR_TYPE_OPTIONS: SelectableOption<HeadwearType>[] = [
  { id: "cap-trucker", label: "Trucker Cap", description: "Mesh-back cap with curved bill.", priceModifier: 1.0 },
  { id: "cap-snapback", label: "Snapback Cap", description: "Structured fit with flat bill.", priceModifier: 1.08 },
  { id: "cap-dad", label: "Dad Cap", description: "Unstructured low-profile classic.", priceModifier: 0.98 },
  { id: "bucket-hat", label: "Bucket Hat", description: "All-around brim for sun coverage.", priceModifier: 1.12 },
  { id: "visor", label: "Sports Visor", description: "Lightweight open-top headwear.", priceModifier: 0.92 },
  { id: "headband", label: "Performance Headband", description: "Quick-dry stretch headband.", priceModifier: 0.85 },
  { id: "towel-face", label: "Face Towel", description: "Compact team towel for training kits.", priceModifier: 0.75 },
  { id: "towel-hand", label: "Hand Towel", description: "Larger towel for sidelines and gyms.", priceModifier: 0.82 },
];

const BASE_HEADWEAR_UNIT_PRICE = 380;

export function estimateHeadwearUnitPrice(type: HeadwearType | null, printMethod: PrintMethod | null): number {
  const typeMod = HEADWEAR_TYPE_OPTIONS.find((o) => o.id === type)?.priceModifier ?? 1;
  const printMod = PRINT_OPTIONS.find((o) => o.id === printMethod)?.priceModifier ?? 1;
  return Math.round(BASE_HEADWEAR_UNIT_PRICE * typeMod * printMod);
}
