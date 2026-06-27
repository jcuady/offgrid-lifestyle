import type { PrintMethod } from "@/src/types/commerce";
import { PRINT_OPTIONS } from "@/src/data/customOptions";

export type HeadwearOptionGroup = "headwear" | "towel";

export interface CustomHeadwearOption {
  id: string;
  label: string;
  description: string;
  group: HeadwearOptionGroup;
  /** Multiplier applied to base headwear unit price. */
  priceModifier: number;
  /** Default `product_type` column value in the team order kit sheet. */
  orderSheetProductType: string;
  sortOrder: number;
  isPublished: boolean;
  updatedAt: string;
}

const BASE_HEADWEAR_UNIT_PRICE = 380;

export function slugifyHeadwearId(label: string): string {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `option-${Date.now()}`;
}

export function createDefaultHeadwearOptions(updatedAt: string): CustomHeadwearOption[] {
  const row = (
    partial: Omit<CustomHeadwearOption, "updatedAt" | "sortOrder" | "isPublished"> & {
      sortOrder?: number;
      isPublished?: boolean;
    },
  ): CustomHeadwearOption => ({
    sortOrder: partial.sortOrder ?? 0,
    isPublished: partial.isPublished ?? true,
    updatedAt,
    ...partial,
  });

  return [
    row({
      id: "cap-trucker",
      label: "Trucker Cap",
      description: "Mesh-back cap with curved bill.",
      group: "headwear",
      priceModifier: 1.0,
      orderSheetProductType: "cap_trucker",
      sortOrder: 10,
    }),
    row({
      id: "cap-snapback",
      label: "Snapback Cap",
      description: "Structured fit with flat bill.",
      group: "headwear",
      priceModifier: 1.08,
      orderSheetProductType: "cap_snapback",
      sortOrder: 20,
    }),
    row({
      id: "cap-dad",
      label: "Dad Cap",
      description: "Unstructured low-profile classic.",
      group: "headwear",
      priceModifier: 0.98,
      orderSheetProductType: "cap_dad",
      sortOrder: 30,
    }),
    row({
      id: "bucket-hat",
      label: "Bucket Hat",
      description: "All-around brim for sun coverage.",
      group: "headwear",
      priceModifier: 1.12,
      orderSheetProductType: "bucket_hat",
      sortOrder: 40,
    }),
    row({
      id: "visor",
      label: "Sports Visor",
      description: "Lightweight open-top headwear.",
      group: "headwear",
      priceModifier: 0.92,
      orderSheetProductType: "visor",
      sortOrder: 50,
    }),
    row({
      id: "headband",
      label: "Performance Headband",
      description: "Quick-dry stretch headband.",
      group: "headwear",
      priceModifier: 0.85,
      orderSheetProductType: "headband",
      sortOrder: 60,
    }),
    row({
      id: "towel-face",
      label: "Face Towel",
      description: "Compact team towel for training kits.",
      group: "towel",
      priceModifier: 0.75,
      orderSheetProductType: "face_towel",
      sortOrder: 70,
    }),
    row({
      id: "towel-hand",
      label: "Hand Towel",
      description: "Larger towel for sidelines and gyms.",
      group: "towel",
      priceModifier: 0.82,
      orderSheetProductType: "hand_towel",
      sortOrder: 80,
    }),
  ];
}

/** Merge persisted options with defaults (by id) and sort for display. */
export function resolveHeadwearOptions(options: CustomHeadwearOption[]): CustomHeadwearOption[] {
  const seeds = createDefaultHeadwearOptions(new Date().toISOString());
  const byId = new Map(options.map((o) => [o.id, o]));

  const merged = [
    ...options.filter((o) => !seeds.some((s) => s.id === o.id)),
    ...seeds.map((seed) => {
      const found = byId.get(seed.id);
      if (!found) return seed;
      return {
        ...seed,
        label: found.label,
        description: found.description,
        group: found.group,
        priceModifier: found.priceModifier,
        orderSheetProductType: found.orderSheetProductType || seed.orderSheetProductType,
        sortOrder: found.sortOrder,
        isPublished: found.isPublished,
        updatedAt: found.updatedAt,
      };
    }),
  ];

  return merged.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function findHeadwearOption(
  id: string | null | undefined,
  options: CustomHeadwearOption[],
): CustomHeadwearOption | undefined {
  if (!id) return undefined;
  return resolveHeadwearOptions(options).find((o) => o.id === id);
}

export function isTowelHeadwearType(
  id: string | null | undefined,
  options: CustomHeadwearOption[],
): boolean {
  return findHeadwearOption(id, options)?.group === "towel";
}

export function headwearOptionLabel(
  id: string | null | undefined,
  options: CustomHeadwearOption[],
): string {
  const opt = findHeadwearOption(id, options);
  if (opt) return opt.label;
  if (!id) return "—";
  return id.replace(/-/g, " ");
}

export function orderSheetProductTypeForHeadwear(
  id: string | null | undefined,
  options: CustomHeadwearOption[],
): string {
  const opt = findHeadwearOption(id, options);
  if (opt?.orderSheetProductType) return opt.orderSheetProductType;
  if (isTowelHeadwearType(id, options)) return "face_towel";
  return "headwear";
}

export function estimateHeadwearUnitPrice(
  typeId: string | null,
  printMethod: PrintMethod | null,
  options: CustomHeadwearOption[],
): number {
  const typeMod = findHeadwearOption(typeId, options)?.priceModifier ?? 1;
  const printMod = PRINT_OPTIONS.find((o) => o.id === printMethod)?.priceModifier ?? 1;
  return Math.round(BASE_HEADWEAR_UNIT_PRICE * typeMod * printMod);
}

/** @deprecated Import from data layer — kept for transitional imports. */
export const HEADWEAR_TYPE_OPTIONS = createDefaultHeadwearOptions(new Date().toISOString());
