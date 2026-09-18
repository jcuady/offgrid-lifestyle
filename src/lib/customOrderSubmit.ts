import type { CustomOrderDesignFile, CustomOrderDraft, ShippingInfo } from "@/src/types/commerce";
import { syncLegacyDesignFields } from "@/src/lib/customOrderFiles";

/** Custom orders must exist in the database before storage uploads (RLS). */
export const CUSTOM_ORDER_SUBMIT_PHASES = ["insert_order", "upload_files", "patch_urls"] as const;

export function mergeDesignFilesWithUrls(
  files: CustomOrderDesignFile[],
  urls: Array<string | null | undefined>,
): CustomOrderDesignFile[] {
  return files.map((file, index) => ({
    ...file,
    url: urls[index] ?? file.url ?? null,
  }));
}

export function mergeCustomOrderDraftWithFiles(
  draft: CustomOrderDraft,
  orderId: string,
  shippingInfo: ShippingInfo,
  fileKeys: {
    designFiles?: CustomOrderDesignFile[];
    designFileKey: string | null;
    orderSheetFileKey: string | null;
    designFileUrl: string | null;
    orderSheetFileUrl: string | null;
    designFileName?: string | null;
  },
): CustomOrderDraft {
  const designFiles =
    fileKeys.designFiles ??
    mergeDesignFilesWithUrls(
      draft.designFiles ?? [],
      fileKeys.designFileUrl != null ? [fileKeys.designFileUrl] : [],
    );
  const mergedDesignFiles =
    designFiles.length > 0
      ? designFiles
      : draft.designFiles?.length
        ? draft.designFiles
        : [];
  const legacy = syncLegacyDesignFields(mergedDesignFiles);

  return {
    ...draft,
    id: orderId,
    shippingInfo,
    status: draft.status === "draft" ? "under_review" : draft.status,
    designFiles: mergedDesignFiles,
    designFileName: fileKeys.designFileName ?? legacy.designFileName ?? draft.designFileName,
    designFileKey: fileKeys.designFileKey ?? legacy.designFileKey ?? draft.designFileKey,
    designFileUrl: fileKeys.designFileUrl ?? legacy.designFileUrl ?? draft.designFileUrl ?? null,
    orderSheetFileKey: fileKeys.orderSheetFileKey ?? draft.orderSheetFileKey,
    orderSheetFileUrl: fileKeys.orderSheetFileUrl ?? draft.orderSheetFileUrl ?? null,
    createdAt: draft.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
