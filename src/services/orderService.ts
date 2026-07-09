import {
  toRetailOrderPayload,
  type CustomOrderDraft,
  type FabricType,
  type GarmentCut,
  type Money,
  type OrderStatus,
  type PaymentStatus,
  type PrintMethod,
  type RetailOrderLine,
  type ShippingInfo,
} from "@/src/types/commerce";
import type { Json } from "@/src/types/database";
import type { PaymentProvider } from "@/src/types/payments";
import { usePortalStore, type CustomOrderQuoteUpdate, type ManagedCustomOrder, type ManagedRetailOrder } from "@/src/store/usePortalStore";
import { logger } from "@/src/lib/logger";
import { supabase } from "@/src/lib/supabase";
import { finalizeCustomOrderFiles } from "@/src/lib/customOrderFiles";
import { mergeCustomOrderDraftWithFiles } from "@/src/lib/customOrderSubmit";
import { validateCustomOrderDraft, validateRetailCart, validateShippingInfo, sanitizeShippingInfo, normalizeShippingInfo, mergeCustomOrderShipping } from "@/src/lib/formValidation";
import { checkoutPaymentConfigFromSettings, validateRetailPaymentMethod } from "@/src/types/payments";
import { notifyStaffOrderEvent } from "@/src/lib/notifications";
import { resolveStorageReference } from "@/src/lib/storageAccess";
import { sendOrderReceiptEmail } from "@/src/services/emailService";

export interface RetailCartLineInput {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface SubmitRetailOrderInput {
  orderId: string;
  cart: RetailCartLineInput[];
  shippingInfo: ShippingInfo;
  paymentMethod: string;
}

type OrderRow = {
  id: string;
  order_type: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_provider: string | null;
  payment_provider_ref: string | null;
  customer_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  subtotal_centavos: number | null;
  shipping_centavos: number;
  tax_centavos: number;
  total_centavos: number | null;
  shipping_info: Json | null;
  line_items: Json | null;
  custom_payload: Json | null;
  created_at: string;
  updated_at: string;
};

function mapRetailOrderRow(row: OrderRow): ManagedRetailOrder {
  return {
    id: row.id,
    type: "retail",
    channel: "shop",
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: row.payment_method ?? null,
    paymentProvider: (row.payment_provider as PaymentProvider) ?? null,
    paymentProviderRef: row.payment_provider_ref ?? null,
    customerId: row.customer_id ?? null,
    lines: (row.line_items as unknown as RetailOrderLine[]) ?? [],
    subtotal: { amount: (row.subtotal_centavos ?? 0) / 100, currency: "PHP" },
    shipping: { amount: row.shipping_centavos / 100, currency: "PHP" },
    tax: { amount: row.tax_centavos / 100, currency: "PHP" },
    total: { amount: (row.total_centavos ?? 0) / 100, currency: "PHP" },
    shippingInfo: row.shipping_info
      ? normalizeShippingInfo(row.shipping_info as Partial<ShippingInfo>)
      : null,
    customerName: row.customer_name ?? "Guest",
    customerEmail: row.customer_email ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCustomOrderRow(row: OrderRow): ManagedCustomOrder {
  const p = (row.custom_payload ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    type: "custom",
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    customerId: row.customer_id ?? null,
    customerName: row.customer_name ?? (p.contactName as string) ?? "Guest",
    customerEmail: row.customer_email ?? (p.contactEmail as string) ?? "",
    customerPhone: row.customer_phone ?? (p.contactPhone as string) ?? "",
    teamOrOrg: (p.teamOrOrg as string) ?? "",
    quantity: (p.quantity as number) ?? 0,
    category: (p.category as "apparel" | "headwear_towels") ?? "apparel",
    headwearType: (p.headwearType as string) ?? null,
    cut: (p.cut as GarmentCut | null) ?? null,
    material: (p.material as FabricType | null) ?? null,
    printMethod: (p.printMethod as PrintMethod | null) ?? null,
    designFileName: (p.designFileName as string) ?? null,
    designFileKey: (p.designFileKey as string) ?? null,
    designFileUrl: (p.designFileUrl as string) ?? null,
    orderSheetFileName: (p.orderSheetFileName as string) ?? null,
    orderSheetFileKey: (p.orderSheetFileKey as string) ?? null,
    orderSheetFileUrl: (p.orderSheetFileUrl as string) ?? null,
    designNotes: (p.designNotes as string) ?? "",
    estimatedTotal: (p.estimatedTotal as Money | null) ?? null,
    depositRequired: (p.depositRequired as Money | null) ?? null,
    officialTotal: (p.officialTotal as Money | null) ?? null,
    officialDeposit: (p.officialDeposit as Money | null) ?? null,
    quoteCustomerNotes: (p.quoteCustomerNotes as string) ?? "",
    quoteInternalNotes: (p.quoteInternalNotes as string) ?? "",
    quotedAt: (p.quotedAt as string) ?? null,
    quotedBy: (p.quotedBy as string) ?? null,
    shippingInfo: row.shipping_info
      ? normalizeShippingInfo(row.shipping_info as Partial<ShippingInfo>)
      : p.shippingInfo
        ? normalizeShippingInfo(p.shippingInfo as Partial<ShippingInfo>)
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mergeOrderIntoStore(retail?: ManagedRetailOrder, custom?: ManagedCustomOrder): void {
  const state = usePortalStore.getState();
  if (retail && !state.retailOrders.some((o) => o.id === retail.id)) {
    usePortalStore.setState({ retailOrders: [retail, ...state.retailOrders] });
  }
  if (custom && !state.customOrders.some((o) => o.id === custom.id)) {
    usePortalStore.setState({ customOrders: [custom, ...state.customOrders] });
  }
}

export interface SubmitCustomOrderResult {
  orderId: string;
  fileUploadWarnings: string[];
}

export interface OrderService {
  submitRetailOrder: (input: SubmitRetailOrderInput) => Promise<string>;
  submitCustomOrder: (draft: CustomOrderDraft) => Promise<SubmitCustomOrderResult>;
  listOrders: () => Promise<{ retailOrders: ManagedRetailOrder[]; customOrders: ManagedCustomOrder[] }>;
  fetchOrderById: (orderId: string) => Promise<{ retail?: ManagedRetailOrder; custom?: ManagedCustomOrder } | null>;
  updateOrderField: (id: string, patch: { status?: string; payment_status?: string; payment_proof_url?: string }) => Promise<void>;
  fetchOrderProofUrl: (orderId: string) => Promise<string | null>;
  persistCustomOrderQuote: (orderId: string, update: CustomOrderQuoteUpdate, order: ManagedCustomOrder) => Promise<void>;
}

export const supabaseOrderService: OrderService = {
  submitRetailOrder: async ({ orderId, cart, shippingInfo, paymentMethod }) => {
    const cartError = validateRetailCart(cart);
    if (cartError) {
      throw new Error(cartError);
    }

    const normalizedShipping = sanitizeShippingInfo(normalizeShippingInfo(shippingInfo));
    const shippingError = validateShippingInfo(normalizedShipping);
    if (shippingError) {
      throw new Error(shippingError);
    }

    const paymentConfig = checkoutPaymentConfigFromSettings(usePortalStore.getState().paymentSettings);
    const paymentError = validateRetailPaymentMethod(paymentMethod, paymentConfig);
    if (paymentError) {
      throw new Error(paymentError);
    }

    const retailOrderPayload = toRetailOrderPayload(cart, normalizedShipping, paymentMethod, orderId);
    const currentUser = usePortalStore.getState().currentUser;
    const fallbackName = normalizedShipping.fullName || currentUser?.name || "Guest Customer";
    const fallbackEmail =
      currentUser?.role === "customer"
        ? currentUser.email
        : normalizedShipping.email || currentUser?.email || "guest@offgrid.local";
    const portalCustomerId = currentUser?.role === "customer" ? currentUser.id : null;

    if (portalCustomerId) {
      retailOrderPayload.customerId = portalCustomerId;
    }

    const { error } = await supabase.from("og_orders").insert({
      id: orderId,
      order_type: "retail",
      status: retailOrderPayload.status,
      payment_status: retailOrderPayload.paymentStatus,
      payment_method: retailOrderPayload.paymentMethod as string,
      payment_provider: (retailOrderPayload.paymentProvider as string) ?? "manual",
      customer_id: portalCustomerId,
      customer_email: fallbackEmail,
      customer_name: fallbackName,
      customer_phone: normalizedShipping.phone,
      subtotal_centavos: Math.round(retailOrderPayload.subtotal.amount * 100),
      shipping_centavos: Math.round(retailOrderPayload.shipping.amount * 100),
      tax_centavos: Math.round(retailOrderPayload.tax.amount * 100),
      total_centavos: Math.round(retailOrderPayload.total.amount * 100),
      shipping_info: normalizedShipping as unknown as Json,
      line_items: retailOrderPayload.lines as unknown as Json,
    });

    if (error) {
      throw new Error(`Could not save order: ${error.message}`);
    }

    usePortalStore.getState().recordRetailOrder(retailOrderPayload, fallbackName, fallbackEmail);
    void notifyStaffOrderEvent(orderId, "new_retail_order");
    void sendOrderReceiptEmail({
      orderId,
      email: fallbackEmail,
      orderType: "retail",
    });
    return orderId;
  },

  submitCustomOrder: async (draft) => {
    const sanitizedDraft: CustomOrderDraft = {
      ...draft,
      contactName: draft.contactName.trim(),
      contactEmail: draft.contactEmail.trim().toLowerCase(),
      contactPhone: draft.contactPhone.trim(),
      teamOrOrg: draft.teamOrOrg.trim(),
      designNotes: draft.designNotes.trim(),
    };

    const validationErrors = validateCustomOrderDraft(sanitizedDraft);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]);
    }

    const shippingInfo = mergeCustomOrderShipping(sanitizedDraft);
    const shippingError = validateShippingInfo(shippingInfo);
    if (shippingError) {
      throw new Error(shippingError);
    }

    const orderId =
      sanitizedDraft.id ?? `CO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderStatus = draft.status === "draft" ? "pending_deposit" : draft.status;
    const currentUser = usePortalStore.getState().currentUser;
    const customerId = currentUser?.role === "customer" ? currentUser.id : null;
    const customerEmail =
      currentUser?.role === "customer" ? currentUser.email : (draft.contactEmail ?? null);
    const customerName =
      currentUser?.role === "customer" ? currentUser.name : (draft.contactName ?? null);
    const customerPhone = draft.contactPhone ?? null;

    const initialPayload: CustomOrderDraft = {
      ...sanitizedDraft,
      id: orderId,
      shippingInfo,
      status: orderStatus,
      createdAt: draft.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from("og_orders").insert({
      id: orderId,
      order_type: "custom",
      status: orderStatus,
      payment_status: "unpaid",
      customer_id: customerId,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      total_centavos: draft.estimatedTotal ? Math.round(draft.estimatedTotal.amount * 100) : null,
      shipping_info: shippingInfo as unknown as Json,
      custom_payload: initialPayload as unknown as Json,
    });

    if (insertError) {
      throw new Error(`Could not save custom order: ${insertError.message}`);
    }

    const fileKeys = await finalizeCustomOrderFiles(
      orderId,
      sanitizedDraft.designFileKey,
      sanitizedDraft.orderSheetFileKey,
    );
    const finalDraft = mergeCustomOrderDraftWithFiles(
      sanitizedDraft,
      orderId,
      shippingInfo,
      fileKeys,
    );

    const { error: patchError } = await supabase
      .from("og_orders")
      .update({
        custom_payload: finalDraft as unknown as Json,
        updated_at: finalDraft.updatedAt,
      })
      .eq("id", orderId);

    if (patchError) {
      throw new Error(`Order saved but file metadata could not be updated: ${patchError.message}`);
    }

    const customOrderId = usePortalStore.getState().recordCustomOrder(finalDraft);
    void notifyStaffOrderEvent(customOrderId, "new_custom_order");
    void sendOrderReceiptEmail({
      orderId: customOrderId,
      email: customerEmail ?? draft.contactEmail,
      orderType: "custom",
    });
    return { orderId: customOrderId, fileUploadWarnings: fileKeys.warnings };
  },

  listOrders: async () => {
    const { data, error } = await supabase
      .from("og_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      logger.warn("Supabase orders fetch failed, falling back", {
        service: "orderService",
        operation: "orders.list",
        error: error?.message,
      });
      const s = usePortalStore.getState();
      return { retailOrders: s.retailOrders, customOrders: s.customOrders };
    }

    const retailOrders: ManagedRetailOrder[] = [];
    const customOrders: ManagedCustomOrder[] = [];

    for (const row of data) {
      if (row.order_type === "retail") {
        retailOrders.push(mapRetailOrderRow(row as OrderRow));
      } else if (row.order_type === "custom") {
        customOrders.push(mapCustomOrderRow(row as OrderRow));
      }
    }

    return { retailOrders, customOrders };
  },

  fetchOrderById: async (orderId) => {
    const { data, error } = await supabase.from("og_orders").select("*").eq("id", orderId).maybeSingle();
    if (error || !data) return null;

    const row = data as OrderRow;
    if (row.order_type === "retail") {
      const retail = mapRetailOrderRow(row);
      mergeOrderIntoStore(retail);
      return { retail };
    }
    if (row.order_type === "custom") {
      const custom = mapCustomOrderRow(row);
      mergeOrderIntoStore(undefined, custom);
      return { custom };
    }
    return null;
  },

  updateOrderField: async (id, patch) => {
    if (patch.payment_proof_url !== undefined) {
      const { error } = await supabase.rpc("og_submit_payment_proof", {
        p_order_id: id,
        p_proof_url: patch.payment_proof_url,
      });
      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await supabase.from("og_orders").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
  },

  fetchOrderProofUrl: async (orderId: string): Promise<string | null> => {
    const { data } = await supabase
      .from("og_orders")
      .select("payment_proof_url")
      .eq("id", orderId)
      .single();
    const reference = data?.payment_proof_url ?? null;
    return resolveStorageReference(reference);
  },

  persistCustomOrderQuote: async (orderId, update, order) => {
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

    const now = new Date().toISOString();
    const actor = usePortalStore.getState().currentUser;

    const payload: Record<string, unknown> = {
      ...order,
      officialTotal: hasOfficial ? update.officialTotal : null,
      officialDeposit: hasOfficial ? officialDeposit : null,
      quoteCustomerNotes: hasOfficial ? update.quoteCustomerNotes : "",
      quoteInternalNotes: hasOfficial ? update.quoteInternalNotes : "",
      quotedAt: hasOfficial ? now : null,
      quotedBy: hasOfficial ? actor?.id ?? null : null,
      updatedAt: now,
    };

    const patch: {
      custom_payload: Json;
      total_centavos?: number;
      updated_at: string;
    } = {
      custom_payload: payload as unknown as Json,
      updated_at: now,
    };

    if (hasOfficial && update.officialTotal) {
      patch.total_centavos = Math.round(update.officialTotal.amount * 100);
    }

    const { error } = await supabase.from("og_orders").update(patch).eq("id", orderId);
    if (error) {
      logger.warn("Supabase custom quote update failed", {
        service: "orderService",
        operation: "orders.persistCustomOrderQuote",
        orderId,
        error: error.message,
      });
    }
  },
};
