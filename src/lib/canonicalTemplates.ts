import {
  createCanonicalOgTemplates,
  type CustomTemplateAsset,
  type TemplateStorageKind,
} from "@/src/store/useSiteContentStore";

export const CANONICAL_TEMPLATE_IDS = createCanonicalOgTemplates("").map((t) => t.id);

/** Admin may edit display copy, preview image, publish flag; may replace file via IndexedDB upload per slot. */
export type EditableTemplatePatch = Partial<
  Pick<
    CustomTemplateAsset,
    "name" | "description" | "previewImageUrl" | "isPublished" | "category" | "fileName" | "fileUrl" | "format" | "storageKind"
  >
>;

function mergePersistedSlot(seed: CustomTemplateAsset, found: CustomTemplateAsset): CustomTemplateAsset {
  const storage = found.storageKind ?? "static";
  const usesOverride = storage === "idb" || storage === "storage";

  return {
    ...seed,
    name: found.name.trim() || seed.name,
    description: found.description.trim() || seed.description,
    previewImageUrl: found.previewImageUrl?.trim() || seed.previewImageUrl || "",
    isPublished: found.isPublished,
    updatedAt: found.updatedAt,
    category: found.category ?? seed.category,
    ...(usesOverride
      ? {
          storageKind: storage,
          fileName: found.fileName || seed.fileName,
          fileUrl: found.fileUrl || seed.fileUrl,
          format: found.format || seed.format,
        }
      : {}),
  };
}

export function resolveCanonicalTemplates(persisted: CustomTemplateAsset[]): CustomTemplateAsset[] {
  const seeds = createCanonicalOgTemplates(new Date().toISOString());
  const byId = new Map(persisted.map((t) => [t.id, t]));

  const canonical = seeds.map((seed) => {
    const found = byId.get(seed.id);
    return found ? mergePersistedSlot(seed, found) : seed;
  });

  const custom = persisted
    .filter((t) => !isCanonicalTemplateId(t.id))
    .map((t) => ({
      ...t,
      storageKind: (t.storageKind ?? "static") as TemplateStorageKind,
      previewImageUrl: t.previewImageUrl?.trim() || "",
    }));

  return [...canonical, ...custom];
}

export function isCanonicalTemplateId(id: string): boolean {
  return CANONICAL_TEMPLATE_IDS.includes(id);
}
