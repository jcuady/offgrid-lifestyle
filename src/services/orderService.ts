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
import { usePortalStore, type ManagedCustomOrder, type ManagedRetailOrder } from "@/src/store/usePortalStore";
import { supabase } from "@/src/lib/supabase";
import { finalizeCustomOrderFiles } from "@/src/lib/customOrderFiles";
import { validateCustomOrderDraft, validateShippingInfo } from "@/src/lib/formValidation";
import { checkoutPaymentConfigFromSettings, validateRetailPaymentMethod } from "@/src/types/payments";

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

export interface OrderService {
  submitRetailOrder: (input: SubmitRetailOrderInput) => Promise<string>;
  submitCustomOrder: (draft: CustomOrderDraft) => Promise<string>;
  listOrders: () => Promise<{ retailOrders: ManagedRetailOrder[]; customOrders: ManagedCustomOrder[] }>;
  updateOrderField: (id: string, patch: { status?: string; payment_status?: string; payment_proof_url?: string }) => Promise<void>;
  fetchOrderProofUrl: (orderId: string) => Promise<string | null>;
}

export const supabaseOrderService: OrderService = {
  submitRetailOrder: async ({ orderId, cart, shippingInfo, paymentMethod }) => {
    if (!cart.length) {
      throw new Error("Your cart is empty. Add items before checking out.");
    }
    const shippingError = validateShippingInfo(shippingInfo);
    if (shippingError) {
      throw new Error(shippingError);
    }

    const paymentConfig = checkoutPaymentConfigFromSettings(usePortalStore.getState().paymentSettings);
    const paymentError = validateRetailPaymentMethod(paymentMethod, paymentConfig);
    if (paymentError) {
      throw new Error(paymentError);
    }

    const retailOrderPayload = toRetailOrderPayload(cart, shippingInfo, paymentMethod, orderId);
    const currentUser = usePortalStore.getState().currentUser;
    const fallbackName = shippingInfo.fullName || currentUser?.name || "Guest Customer";
    const fallbackEmail = shippingInfo.email || currentUser?.email || "guest@offgrid.local";

    if (currentUser?.role === "customer") {
      retailOrderPayload.customerId = currentUser.id;
    }

    const { error } = await supabase.from("og_orders").insert({
      id: orderId,
      order_type: "retail",
      status: retailOrderPayload.status,
      payment_status: retailOrderPayload.paymentStatus,
      payment_method: retailOrderPayload.paymentMethod as string,
      payment_provider: (retailOrderPayload.paymentProvider as string) ?? "manual",
      customer_email: fallbackEmail,
      customer_name: fallbackName,
      customer_phone: shippingInfo.phone ?? null,
      subtotal_centavos: Math.round(retailOrderPayload.subtotal.amount * 100),
      shipping_centavos: Math.round(retailOrderPayload.shipping.amount * 100),
      tax_centavos: Math.round(retailOrderPayload.tax.amount * 100),
      total_centavos: Math.round(retailOrderPayload.total.amount * 100),
      shipping_info: shippingInfo as unknown as Json,
      line_items: retailOrderPayload.lines as unknown as Json,
    });

    if (error) {
      console.warn("Supabase order insert failed, saving to store:", error.message);
    }

    usePortalStore.getState().recordRetailOrder(retailOrderPayload, fallbackName, fallbackEmail);
    return orderId;
  },

  submitCustomOrder: async (draft) => {
    const validationErrors = validateCustomOrderDraft(draft);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]);
    }

    const orderId =
      draft.id ?? `CO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fileKeys = await finalizeCustomOrderFiles(orderId, draft.designFileKey, draft.orderSheetFileKey);
    const finalDraft: CustomOrderDraft = {
      ...draft,
      id: orderId,
      designFileKey: fileKeys.designFileKey ?? draft.designFileKey,
      orderSheetFileKey: fileKeys.orderSheetFileKey ?? draft.orderSheetFileKey,
    };

    const { error } = await supabase.from("og_orders").insert({
      id: orderId,
      order_type: "custom",
      status: "draft",
      payment_status: "unpaid",
      customer_email: draft.contactEmail ?? null,
      customer_name: draft.contactName ?? null,
      customer_phone: draft.contactPhone ?? null,
      total_centavos: draft.estimatedTotal ? Math.round(draft.estimatedTotal.amount * 100) : null,
      custom_payload: finalDraft as unknown as Json,
    });

    if (error) {
      console.warn("Supabase custom order insert failed:", error.message);
    }

    return usePortalStore.getState().recordCustomOrder(finalDraft);
  },

  listOrders: async () => {
    const { data, error } = await supabase
      .from("og_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.warn("Supabase orders fetch failed, falling back:", error?.message);
      const s = usePortalStore.getState();
      return { retailOrders: s.retailOrders, customOrders: s.customOrders };
    }

    const retailOrders: ManagedRetailOrder[] = [];
    const customOrders: ManagedCustomOrder[] = [];

    for (const row of data) {
      if (row.order_type === "retail") {
        retailOrders.push({
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
          shippingInfo: (row.shipping_info as unknown as ShippingInfo) ?? null,
          customerName: row.customer_name ?? "Guest",
          customerEmail: row.customer_email ?? "",
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      } else if (row.order_type === "custom") {
        const p = (row.custom_payload ?? {}) as Record<string, unknown>;
        customOrders.push({
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
          orderSheetFileName: (p.orderSheetFileName as string) ?? null,
          orderSheetFileKey: (p.orderSheetFileKey as string) ?? null,
          designNotes: (p.designNotes as string) ?? "",
          estimatedTotal: (p.estimatedTotal as Money | null) ?? null,
          depositRequired: (p.depositRequired as Money | null) ?? null,
          officialTotal: (p.officialTotal as Money | null) ?? null,
          officialDeposit: (p.officialDeposit as Money | null) ?? null,
          quoteCustomerNotes: (p.quoteCustomerNotes as string) ?? "",
          quoteInternalNotes: (p.quoteInternalNotes as string) ?? "",
          quotedAt: (p.quotedAt as string) ?? null,
          quotedBy: (p.quotedBy as string) ?? null,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }
    }

    return { retailOrders, customOrders };
  },

  updateOrderField: async (id, patch) => {
    const { error } = await supabase.from("og_orders").update(patch).eq("id", id);
    if (error) console.warn("Supabase order field update failed:", error.message);
  },

  fetchOrderProofUrl: async (orderId: string): Promise<string | null> => {
    const { data } = await supabase
      .from("og_orders")
      .select("payment_proof_url")
      .eq("id", orderId)
      .single();
    return data?.payment_proof_url ?? null;
  },
};
