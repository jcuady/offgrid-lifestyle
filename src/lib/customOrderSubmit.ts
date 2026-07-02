import type { CustomOrderDraft, ShippingInfo } from "@/src/types/commerce";

/** Custom orders must exist in the database before storage uploads (RLS). */
export const CUSTOM_ORDER_SUBMIT_PHASES = ["insert_order", "upload_files", "patch_urls"] as const;

export function mergeCustomOrderDraftWithFiles(
  draft: CustomOrderDraft,
  orderId: string,
  shippingInfo: ShippingInfo,
  fileKeys: {
    designFileKey: string | null;
    orderSheetFileKey: string | null;
    designFileUrl: string | null;
    orderSheetFileUrl: string | null;
  },
): CustomOrderDraft {
  return {
    ...draft,
    id: orderId,
    shippingInfo,
    status: draft.status === "draft" ? "pending_deposit" : draft.status,
    designFileKey: fileKeys.designFileKey ?? draft.designFileKey,
    orderSheetFileKey: fileKeys.orderSheetFileKey ?? draft.orderSheetFileKey,
    designFileUrl: fileKeys.designFileUrl ?? draft.designFileUrl ?? null,
    orderSheetFileUrl: fileKeys.orderSheetFileUrl ?? draft.orderSheetFileUrl ?? null,
    createdAt: draft.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
