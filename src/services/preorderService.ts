import { supabase } from "@/src/lib/supabase";
import { usePortalStore } from "@/src/store/usePortalStore";
import { notifyStaffOrderEvent } from "@/src/lib/notifications";
import { sendOrderReceiptEmail } from "@/src/services/emailService";
import {
  PREORDER_DESIGNS,
  PREORDER_MAX_SLOTS,
  PREORDER_PRICE,
  PREORDER_PRODUCT_SLUG,
  PREORDER_VENUES,
  type PreorderVenueId,
  type PreorderPaymentMethod,
} from "@/src/lib/preorderConfig";
import type { ManagedRetailOrder } from "@/src/store/usePortalStore";
import type { RetailOrderLine, ShippingInfo } from "@/src/types/commerce";
import type { Json } from "@/src/types/database";

export interface PreorderSlotStatus {
  totalCap: number;
  totalReserved: number;
  remainingSlots: number;
  isSoldOut: boolean;
}

export interface SubmitPreorderInput {
  designName: string;
  size: string;
  quantity: number;
  venueId: PreorderVenueId;
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: PreorderPaymentMethod | "gcash" | "bdo" | "paymongo";
}

export interface ExtendedPreorderShippingInfo extends ShippingInfo {
  fulfillmentType: "pickup";
  pickupVenue: PreorderVenueId;
  pickupVenueLabel: string;
  pickupAvailableDate: string;
  pickupMapsUrl: string | null;
  claimed: boolean;
  claimedAt: string | null;
  claimedBy: string | null;
}

export function isOrderPreorder(order: { id: string; lines?: RetailOrderLine[]; line_items?: unknown }): boolean {
  if (order.id.startsWith("PRE-")) return true;
  const lines = (order.lines ?? (Array.isArray(order.line_items) ? order.line_items : [])) as RetailOrderLine[];
  return lines.some((l) => l.productId === PREORDER_PRODUCT_SLUG);
}

export function getPreorderPickupVenue(shippingInfo: unknown): {
  isPickup: boolean;
  venueId?: PreorderVenueId;
  venueLabel?: string;
  claimed?: boolean;
  claimedAt?: string | null;
} {
  if (!shippingInfo || typeof shippingInfo !== "object") {
    return { isPickup: false };
  }
  const s = shippingInfo as Record<string, unknown>;
  const isPickup = s.fulfillmentType === "pickup" || Boolean(s.pickupVenue);
  return {
    isPickup,
    venueId: (s.pickupVenue as PreorderVenueId) || undefined,
    venueLabel: (s.pickupVenueLabel as string) || undefined,
    claimed: Boolean(s.claimed),
    claimedAt: (s.claimedAt as string) || null,
  };
}

export async function fetchPreorderSlotStatus(): Promise<PreorderSlotStatus> {
  let dbCount = 0;
  const countedOrderIds = new Set<string>();

  try {
    const { data, error } = await supabase
      .from("og_orders")
      .select("id, status, line_items")
      .neq("status", "cancelled");

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        countedOrderIds.add(row.id);
        const lines = (row.line_items as unknown as RetailOrderLine[]) ?? [];
        const isPre = row.id.startsWith("PRE-") || lines.some((l) => l.productId === PREORDER_PRODUCT_SLUG);
        if (isPre) {
          const qty = lines
            .filter((l) => !l.productId || l.productId === PREORDER_PRODUCT_SLUG)
            .reduce((sum, l) => sum + (l.quantity || 1), 0);
          dbCount += qty || 1;
        }
      }
    }
  } catch {
    // Fall back to local store on network errors
  }

  // Combine with local Zustand store for optimistic / instant UI reflection
  const localOrders = usePortalStore.getState().retailOrders;
  for (const lo of localOrders) {
    if (lo.status === "cancelled" || countedOrderIds.has(lo.id)) continue;
    if (isOrderPreorder(lo)) {
      const qty = lo.lines.reduce((s, l) => s + (l.quantity || 1), 0);
      dbCount += qty || 1;
    }
  }

  const remainingSlots = Math.max(0, PREORDER_MAX_SLOTS - dbCount);
  return {
    totalCap: PREORDER_MAX_SLOTS,
    totalReserved: dbCount,
    remainingSlots,
    isSoldOut: remainingSlots <= 0,
  };
}

export async function submitPreorder(input: SubmitPreorderInput): Promise<string> {
  const currentSlots = await fetchPreorderSlotStatus();
  if (currentSlots.remainingSlots < input.quantity) {
    throw new Error(
      currentSlots.isSoldOut
        ? "Pre-orders have reached the 30-slot limit and are now closed."
        : `Only ${currentSlots.remainingSlots} slot(s) remaining. Please adjust your quantity.`,
    );
  }

  const design = PREORDER_DESIGNS.find((d) => d.name === input.designName) || PREORDER_DESIGNS[0];
  const venue = PREORDER_VENUES[input.venueId] || PREORDER_VENUES.kado_kohi;
  const orderId = `PRE-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const cleanName = input.fullName.trim();
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanPhone = input.phone.trim();

  if (!cleanName) throw new Error("Please enter your full name.");
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Please enter a valid email address.");
  if (!cleanPhone) throw new Error("Please enter your mobile phone number.");

  const shippingInfo: ExtendedPreorderShippingInfo = {
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    address: venue.name,
    barangay: venue.tagline,
    city: input.venueId === "kado_kohi" ? "Marikina City" : "Metro Manila",
    province: "Metro Manila",
    region: "NCR",
    zip: "1800",
    latitude: null,
    longitude: null,
    regionCode: "13",
    provinceCode: "1374",
    cityCode: "137402",
    barangayCode: "",
    fulfillmentType: "pickup",
    pickupVenue: input.venueId,
    pickupVenueLabel: venue.name,
    pickupAvailableDate: venue.availableDate,
    pickupMapsUrl: venue.mapsUrl ?? null,
    claimed: false,
    claimedAt: null,
    claimedBy: null,
  };

  const lineItem: RetailOrderLine = {
    lineItemId: `line-1`,
    productId: PREORDER_PRODUCT_SLUG,
    name: `THE SOCIAL CLUB COLLECTION TEE — ${design.name}`,
    image: design.image,
    priceSnapshot: { amount: PREORDER_PRICE, currency: "PHP" },
    size: input.size,
    color: design.name,
    quantity: input.quantity,
    variantSku: `OG-SOCIALCLUB-BOXY-COT-${design.name.toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
  };

  const currentUser = usePortalStore.getState().currentUser;
  const portalCustomerId = currentUser?.role === "customer" ? currentUser.id : null;
  const totalAmount = PREORDER_PRICE * input.quantity;

  const orderPayload: ManagedRetailOrder = {
    id: orderId,
    type: "retail",
    channel: "shop",
    status: "pending_deposit",
    paymentStatus: "unpaid",
    paymentMethod: input.paymentMethod,
    paymentProvider: input.paymentMethod === "paymongo" ? "paymongo" : "manual",
    paymentProviderRef: null,
    customerId: portalCustomerId,
    lines: [lineItem],
    subtotal: { amount: totalAmount, currency: "PHP" },
    shipping: { amount: 0, currency: "PHP" },
    tax: { amount: 0, currency: "PHP" },
    total: { amount: totalAmount, currency: "PHP" },
    shippingInfo,
    customerName: cleanName,
    customerEmail: cleanEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let { error } = await supabase.from("og_orders").insert({
    id: orderId,
    order_type: "retail",
    status: "pending_deposit",
    payment_status: "unpaid",
    payment_method: input.paymentMethod,
    payment_provider: input.paymentMethod === "paymongo" ? "paymongo" : "manual",
    customer_id: portalCustomerId,
    customer_email: cleanEmail,
    customer_name: cleanName,
    customer_phone: cleanPhone,
    subtotal_centavos: Math.round(totalAmount * 100),
    shipping_centavos: 0,
    tax_centavos: 0,
    total_centavos: Math.round(totalAmount * 100),
    shipping_info: shippingInfo as unknown as Json,
    line_items: [lineItem] as unknown as Json,
  });

  // If the remote DB still has the legacy check constraint before migration runs,
  // fallback to 'gcash' in the DB column so order creation succeeds without error.
  if (error && error.message.includes("og_orders_payment_method_check")) {
    const fallbackRes = await supabase.from("og_orders").insert({
      id: orderId,
      order_type: "retail",
      status: "pending_deposit",
      payment_status: "unpaid",
      payment_method: "gcash",
      payment_provider: "manual",
      customer_id: portalCustomerId,
      customer_email: cleanEmail,
      customer_name: cleanName,
      customer_phone: cleanPhone,
      subtotal_centavos: Math.round(totalAmount * 100),
      shipping_centavos: 0,
      tax_centavos: 0,
      total_centavos: Math.round(totalAmount * 100),
      shipping_info: { ...shippingInfo, preferredPaymentMethod: input.paymentMethod } as unknown as Json,
      line_items: [lineItem] as unknown as Json,
    });
    error = fallbackRes.error;
  }

  if (error) {
    throw new Error(`Could not submit pre-order: ${error.message}`);
  }

  usePortalStore.getState().recordRetailOrder(orderPayload, cleanName, cleanEmail);
  void notifyStaffOrderEvent(orderId, "new_retail_order");
  void sendOrderReceiptEmail({
    orderId,
    email: cleanEmail,
    orderType: "retail",
  });

  return orderId;
}

export async function markPreorderClaimed(orderId: string, staffName: string): Promise<void> {
  // Fetch existing shipping_info
  const { data, error } = await supabase
    .from("og_orders")
    .select("shipping_info")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    throw new Error("Could not find order to mark as claimed.");
  }

  const existingShipping = (data.shipping_info as Record<string, unknown>) || {};
  const updatedShipping = {
    ...existingShipping,
    claimed: true,
    claimedAt: new Date().toISOString(),
    claimedBy: staffName || "Staff",
  };

  const { error: updateError } = await supabase
    .from("og_orders")
    .update({
      shipping_info: updatedShipping as unknown as Json,
      status: "delivered", // maps to 'Claimed' for pickup orders in UI
    })
    .eq("id", orderId);

  if (updateError) {
    throw new Error(`Failed to update claim status: ${updateError.message}`);
  }

  // Update in local store
  const state = usePortalStore.getState();
  const order = state.retailOrders.find((o) => o.id === orderId);
  if (order) {
    state.updateRetailOrderStatus(orderId, "delivered");
  }
}

export async function updatePreorderPaymentMethod(
  orderId: string,
  newMethod: PreorderPaymentMethod,
): Promise<void> {
  // Update in local store
  usePortalStore.setState((state) => ({
    retailOrders: state.retailOrders.map((entry) =>
      entry.id === orderId
        ? {
            ...entry,
            paymentMethod: newMethod,
            updatedAt: new Date().toISOString(),
          }
        : entry,
    ),
  }));

  try {
    const { error } = await supabase
      .from("og_orders")
      .update({ payment_method: newMethod, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error && error.message.includes("og_orders_payment_method_check")) {
      await supabase
        .from("og_orders")
        .update({ payment_method: "gcash", updated_at: new Date().toISOString() })
        .eq("id", orderId);
    }
  } catch {
    // Non-fatal if offline or DB error
  }
}

export interface SubmitPreorderPaymentProofInput {
  orderId: string;
  email: string;
  file?: File | null;
  referenceNumber?: string;
}

export interface PreorderPaymentProofResult {
  success: boolean;
  proofUrl: string | null;
  referenceNumber: string | null;
  message?: string;
}

export async function submitPreorderPaymentProof(
  input: SubmitPreorderPaymentProofInput,
): Promise<PreorderPaymentProofResult> {
  let uploadedUrl: string | null = null;
  const cleanRef = input.referenceNumber?.trim() || null;

  if (input.file) {
    try {
      const ext = input.file.name.split(".").pop() || "jpg";
      const filePath = `${input.orderId}/${Date.now()}-proof.${ext}`;
      const { data, error } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, input.file, { upsert: true });

      if (!error && data?.path) {
        uploadedUrl = data.path;
      }
    } catch {
      // Offline fallback: Use browser blob URL for instant preview
      try {
        uploadedUrl = URL.createObjectURL(input.file);
      } catch {
        uploadedUrl = null;
      }
    }
  }

  // Update in local Zustand store
  usePortalStore.setState((state) => ({
    retailOrders: state.retailOrders.map((o) =>
      o.id === input.orderId
        ? {
            ...o,
            paymentProviderRef: cleanRef || o.paymentProviderRef,
            updatedAt: new Date().toISOString(),
          }
        : o,
    ),
  }));

  // Update in Supabase
  try {
    const patch: {
      updated_at: string;
      payment_proof_url?: string | null;
      payment_provider_ref?: string | null;
    } = {
      updated_at: new Date().toISOString(),
    };
    if (uploadedUrl) patch.payment_proof_url = uploadedUrl;
    if (cleanRef) patch.payment_provider_ref = cleanRef;

    await supabase.from("og_orders").update(patch).eq("id", input.orderId);
  } catch {
    // Non-fatal
  }

  void notifyStaffOrderEvent(input.orderId, "payment_proof");

  return {
    success: true,
    proofUrl: uploadedUrl,
    referenceNumber: cleanRef,
  };
}
