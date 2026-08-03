/**
 * Custom payload write seam — only durable custom-order keys (no ManagedCustomOrder dump).
 * Keeps quote/file/spec locality; blocks portal-only fields from leaking into JSON.
 */
import type { CustomOrderDraft, Money, PrintMethod } from "@/src/types/commerce";
import type { CustomOrderQuoteUpdate, ManagedCustomOrder } from "@/src/store/usePortalStore";

export type CustomPayloadWrite = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  teamOrOrg: string;
  category: CustomOrderDraft["category"];
  headwearType: string | null;
  cuts: CustomOrderDraft["cuts"];
  materials: CustomOrderDraft["materials"];
  printMethod: PrintMethod | null;
  quantity: number;
  designFileName: string | null;
  designFileKey: string | null;
  designFileUrl: string | null;
  orderSheetFileName: string | null;
  orderSheetFileKey: string | null;
  orderSheetFileUrl: string | null;
  designNotes: string;
  shippingInfo: ManagedCustomOrder["shippingInfo"];
  status: ManagedCustomOrder["status"];
  estimatedTotal: Money | null;
  depositRequired: Money | null;
  officialTotal: Money | null;
  officialDeposit: Money | null;
  quoteCustomerNotes: string;
  /** Preserve on quote merge so invoice save does not wipe RPC-written revision notes. */
  customerRevisionNote: string;
  quotedAt: string | null;
  quotedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export function customPayloadFromManaged(order: ManagedCustomOrder): CustomPayloadWrite {
  return {
    id: order.id,
    contactName: order.customerName,
    contactEmail: order.customerEmail,
    contactPhone: order.customerPhone,
    teamOrOrg: order.teamOrOrg,
    category: order.category,
    headwearType: order.headwearType,
    cuts: order.cuts ?? [],
    materials: order.materials ?? [],
    printMethod: order.printMethod,
    quantity: order.quantity,
    designFileName: order.designFileName,
    designFileKey: order.designFileKey,
    designFileUrl: order.designFileUrl,
    orderSheetFileName: order.orderSheetFileName,
    orderSheetFileKey: order.orderSheetFileKey,
    orderSheetFileUrl: order.orderSheetFileUrl,
    designNotes: order.designNotes,
    shippingInfo: order.shippingInfo,
    status: order.status,
    estimatedTotal: order.estimatedTotal,
    depositRequired: order.depositRequired,
    officialTotal: order.officialTotal,
    officialDeposit: order.officialDeposit,
    quoteCustomerNotes: order.quoteCustomerNotes ?? "",
    customerRevisionNote: order.customerRevisionNote ?? "",
    quotedAt: order.quotedAt,
    quotedBy: order.quotedBy,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function applyQuoteToCustomPayload(
  base: CustomPayloadWrite,
  update: CustomOrderQuoteUpdate,
  meta: { quotedAt: string | null; quotedBy: string | null; updatedAt: string },
): CustomPayloadWrite {
  const hasOfficial =
    update.officialTotal !== null &&
    update.officialTotal !== undefined &&
    update.officialTotal.amount > 0;

  let officialDeposit = update.officialDeposit ?? null;
  if (hasOfficial && update.officialTotal && (!officialDeposit || officialDeposit.amount <= 0)) {
    officialDeposit = {
      amount: Math.round(update.officialTotal.amount * 0.6),
      currency: update.officialTotal.currency,
    };
  }

  return {
    ...base,
    officialTotal: hasOfficial ? update.officialTotal ?? null : null,
    officialDeposit: hasOfficial ? officialDeposit : null,
    quoteCustomerNotes: hasOfficial ? update.quoteCustomerNotes ?? "" : "",
    quotedAt: hasOfficial ? meta.quotedAt : null,
    quotedBy: hasOfficial ? meta.quotedBy : null,
    updatedAt: meta.updatedAt,
  };
}
