import { validateUploadedFile } from "@/src/lib/fileValidation";
import { supabase } from "@/src/lib/supabase";

export const CMS_IMAGE_BUCKET = "site-cms";

export function buildCmsImagePath(section: string, fileName: string): string {
  const ext = fileName.includes(".") ? (fileName.split(".").pop() ?? "jpg").toLowerCase() : "jpg";
  const safeSection =
    section
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "landing";
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `landing/${safeSection}/${stamp}-${rand}.${ext}`;
}

export type CmsImageUploadResult =
  | { ok: true; publicUrl: string }
  | { ok: false; error: string };

export async function uploadCmsImage(file: File, section: string): Promise<CmsImageUploadResult> {
  const check = validateUploadedFile(file, "imageAsset");
  if (check.ok === false) return { ok: false, error: check.error };

  const path = buildCmsImagePath(section, file.name);
  const { data, error } = await supabase.storage.from(CMS_IMAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    return { ok: false, error: error.message || "Upload failed." };
  }

  const { data: pub } = supabase.storage.from(CMS_IMAGE_BUCKET).getPublicUrl(data.path);
  return { ok: true, publicUrl: pub.publicUrl };
}

export async function uploadTemplateFile(file: File, templateId: string): Promise<CmsImageUploadResult> {
  const check = validateUploadedFile(file, "templateAsset");
  if (check.ok === false) return { ok: false, error: check.error };

  const safeId =
    templateId
      .replace(/[^a-z0-9-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "template";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const path = `templates/files/${safeId}/${Date.now()}-${safeName}`;

  const { data, error } = await supabase.storage.from(CMS_IMAGE_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    return { ok: false, error: error.message || "Upload failed." };
  }

  const { data: pub } = supabase.storage.from(CMS_IMAGE_BUCKET).getPublicUrl(data.path);
  return { ok: true, publicUrl: pub.publicUrl };
}
