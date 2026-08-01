import type { SelectableOption } from "@/src/data/customOptions";
import type { FabricType, GarmentCut } from "@/src/types/commerce";

/** Normalize JSON payload / localStorage: prefer arrays, fall back to legacy scalar. */
export function normalizeSpecIds<T extends string>(
  multi: unknown,
  legacyScalar: unknown = null,
): T[] {
  const fromMulti = Array.isArray(multi)
    ? multi.filter((v): v is T => typeof v === "string" && v.trim().length > 0)
    : typeof multi === "string" && multi.trim()
      ? [multi.trim() as T]
      : [];

  if (fromMulti.length > 0) {
    return [...new Set(fromMulti)];
  }

  if (typeof legacyScalar === "string" && legacyScalar.trim()) {
    return [legacyScalar.trim() as T];
  }

  return [];
}

export function toggleSpecId<T extends string>(list: readonly T[], id: T): T[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function labelsForSpecIds<T extends string>(
  options: readonly SelectableOption<T>[],
  ids: readonly T[],
): string {
  if (!ids.length) return "—";
  return ids
    .map((id) => options.find((o) => o.id === id)?.label ?? id.replaceAll("_", " "))
    .join(", ");
}

export function parseCutsFromPayload(p: Record<string, unknown>): GarmentCut[] {
  return normalizeSpecIds<GarmentCut>(p.cuts ?? p.cut, p.cut);
}

export function parseMaterialsFromPayload(p: Record<string, unknown>): FabricType[] {
  return normalizeSpecIds<FabricType>(p.materials ?? p.material, p.material);
}
