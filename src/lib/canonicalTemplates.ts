import {
  createCanonicalOgTemplates,
  type CustomTemplateAsset,
} from "@/src/store/useSiteContentStore";

export const CANONICAL_TEMPLATE_IDS = createCanonicalOgTemplates("").map((t) => t.id);

/** Admin may edit display copy, preview image, publish flag; may replace file via IndexedDB upload per slot. */
export type EditableTemplatePatch = Partial<
  Pick<CustomTemplateAsset, "name" | "description" | "previewImageUrl" | "isPublished">
>;

export function resolveCanonicalTemplates(persisted: CustomTemplateAsset[]): CustomTemplateAsset[] {
  const seeds = createCanonicalOgTemplates(new Date().toISOString());
  const byId = new Map(persisted.map((t) => [t.id, t]));

  return seeds.map((seed) => {
    const found = byId.get(seed.id);
    if (!found) return seed;

    const isIdb = (found.storageKind ?? "static") === "idb";
    return {
      ...seed,
      name: found.name.trim() || seed.name,
      description: found.description.trim() || seed.description,
      previewImageUrl: found.previewImageUrl?.trim() || seed.previewImageUrl || "",
      isPublished: found.isPublished,
      updatedAt: found.updatedAt,
      ...(isIdb
        ? {
            storageKind: "idb" as const,
            fileName: found.fileName || seed.fileName,
            fileUrl: found.fileUrl ?? "",
            format: found.format || seed.format,
          }
        : {}),
    };
  });
}

export function isCanonicalTemplateId(id: string): boolean {
  return CANONICAL_TEMPLATE_IDS.includes(id);
}
