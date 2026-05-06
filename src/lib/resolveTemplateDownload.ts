import type { CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import { getTemplateBlob } from "@/src/lib/templateBlobStorage";

function anchorDownload(href: string, fileName: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Primary shirt template id — matches order in canonical seed list (StepDesign default). */
export const PRIMARY_DESIGN_TEMPLATE_ID = "tpl-ogl-shirt";

export function getTemplateStorageKind(template: CustomTemplateAsset): "static" | "idb" {
  return template.storageKind ?? "static";
}

export async function triggerTemplateDownload(template: CustomTemplateAsset): Promise<void> {
  const kind = getTemplateStorageKind(template);

  if (kind === "idb") {
    const blob = await getTemplateBlob(template.id);
    if (!blob) {
      throw new Error("This template file is missing from browser storage. Re-upload from admin.");
    }
    const url = URL.createObjectURL(blob);
    try {
      anchorDownload(url, template.fileName);
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    }
    return;
  }

  if (!template.fileUrl || template.fileUrl === "#") {
    throw new Error("Download URL not available for this template.");
  }

  anchorDownload(template.fileUrl, template.fileName);
}
