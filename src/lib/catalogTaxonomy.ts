/** Pure helpers for storefront tag / sport label catalogs and cascading renames. */

export type CatalogLabelKind = "tag" | "sport";

export function slugifyCatalogLabel(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "label"
  );
}

export function normalizeCatalogLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

export function mergeCatalogLabels(...groups: Array<readonly string[] | undefined>): string[] {
  const out: string[] = [];
  for (const group of groups) {
    for (const raw of group ?? []) {
      const label = normalizeCatalogLabel(raw);
      if (!label) continue;
      if (!out.some((existing) => existing.toLowerCase() === label.toLowerCase())) {
        out.push(label);
      }
    }
  }
  return out;
}

export function renameLabelInList(list: readonly string[], from: string, to: string): string[] {
  const fromNorm = normalizeCatalogLabel(from);
  const toNorm = normalizeCatalogLabel(to);
  if (!fromNorm || !toNorm) return mergeCatalogLabels(list);
  return mergeCatalogLabels(list.map((label) => (label.toLowerCase() === fromNorm.toLowerCase() ? toNorm : label)));
}

export function removeLabelFromList(list: readonly string[], label: string): string[] {
  const target = normalizeCatalogLabel(label).toLowerCase();
  return mergeCatalogLabels(list).filter((value) => value.toLowerCase() !== target);
}

type LabelCarrier = {
  id: string;
  tags?: string[];
  sports?: string[];
};

export function renameLabelAcrossProducts<T extends LabelCarrier>(
  products: readonly T[],
  field: "tags" | "sports",
  from: string,
  to: string,
): T[] {
  return products.map((product) => {
    const current = product[field] ?? [];
    const next = renameLabelInList(current, from, to);
    if (next.length === current.length && next.every((v, i) => v === current[i])) return product;
    return { ...product, [field]: next };
  });
}

export function removeLabelAcrossProducts<T extends LabelCarrier>(
  products: readonly T[],
  field: "tags" | "sports",
  label: string,
): T[] {
  return products.map((product) => {
    const current = product[field] ?? [];
    const next = removeLabelFromList(current, label);
    if (next.length === current.length) return product;
    return { ...product, [field]: next };
  });
}
