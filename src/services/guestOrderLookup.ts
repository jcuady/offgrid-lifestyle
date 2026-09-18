import { supabase } from "@/src/lib/supabase";
import type { Json } from "@/src/types/database";
import type { Money, RetailOrderLine } from "@/src/types/commerce";
import { php } from "@/src/types/commerce";

export interface GuestOrderLookupResult {
  id: string;
  orderType: "retail" | "custom";
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customPayload: Record<string, unknown> | null;
  lineItems: RetailOrderLine[];
  subtotal: Money | null;
  shipping: Money | null;
  tax: Money | null;
  total: Money | null;
  shippingInfo: Record<string, unknown> | null;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
}

function centavosToMoney(value: number | null | undefined): Money | null {
  if (value == null) return null;
  return php(value / 100);
}

function mapGuestOrderRow(raw: Json): GuestOrderLookupResult | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const id = row.id;
  if (typeof id !== "string") return null;

  const orderType = row.order_type === "custom" ? "custom" : "retail";

  return {
    id,
    orderType,
    status: String(row.status ?? ""),
    paymentStatus: String(row.payment_status ?? ""),
    customerName: String(row.customer_name ?? "Guest"),
    customerEmail: String(row.customer_email ?? ""),
    customPayload:
      orderType === "custom" && row.custom_payload && typeof row.custom_payload === "object"
        ? (row.custom_payload as Record<string, unknown>)
        : null,
    lineItems: Array.isArray(row.line_items) ? (row.line_items as RetailOrderLine[]) : [],
    subtotal: centavosToMoney(row.subtotal_centavos as number | null),
    shipping: centavosToMoney(row.shipping_centavos as number | null),
    tax: centavosToMoney(row.tax_centavos as number | null),
    total: centavosToMoney(row.total_centavos as number | null),
    shippingInfo:
      row.shipping_info && typeof row.shipping_info === "object"
        ? (row.shipping_info as Record<string, unknown>)
        : null,
    paymentMethod: row.payment_method != null ? String(row.payment_method) : null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function lookupGuestOrder(
  orderId: string,
  email: string,
): Promise<GuestOrderLookupResult | null> {
  const trimmedId = orderId.trim();
  const trimmedEmail = email.trim();
  if (!trimmedId || !trimmedEmail) return null;

  const { data, error } = await supabase.rpc("og_guest_lookup_order", {
    p_order_id: trimmedId,
    p_email: trimmedEmail,
  });

  if (error) {
    throw new Error(error.message);
  }

  return mapGuestOrderRow(data as Json);
}
