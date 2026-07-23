import { supabase } from "@/src/lib/supabase";
import {
  normalizeShippingInfo,
  parseSavedShipping,
  sanitizeShippingInfo,
  validateShippingInfoFields,
} from "@/src/lib/formValidation";
import { EMPTY_SHIPPING_INFO, type ShippingInfo } from "@/src/types/commerce";
import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { logger } from "@/src/lib/logger";

export { parseSavedShipping } from "@/src/lib/formValidation";

export async function fetchCustomerShipping(portalUserId: string): Promise<ShippingInfo | null> {
  const { data, error } = await supabase
    .from("og_portal_users")
    .select("shipping_info")
    .eq("id", portalUserId)
    .maybeSingle();

  if (error) {
    logger.warn("Failed to load saved shipping", {
      operation: "fetchCustomerShipping",
      error: error.message,
    });
    return null;
  }

  return parseSavedShipping(data?.shipping_info);
}

export async function saveCustomerShipping(
  portalUserId: string,
  info: ShippingInfo,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const normalized = sanitizeShippingInfo(normalizeShippingInfo(info));
  const errors = validateShippingInfoFields(normalized);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: Object.values(errors)[0] ?? "Complete all shipping fields." };
  }

  const { error } = await supabase
    .from("og_portal_users")
    .update({ shipping_info: normalized as never, updated_at: new Date().toISOString() })
    .eq("id", portalUserId);

  if (error) {
    logger.warn("Failed to save shipping", {
      operation: "saveCustomerShipping",
      error: error.message,
    });
    return { ok: false, message: error.message };
  }

  useStore.getState().setShippingInfo(normalized);
  return { ok: true };
}

/** Load DB shipping into the checkout store for a signed-in customer. */
export async function hydrateCheckoutShipping(portalUserId: string): Promise<void> {
  const saved = await fetchCustomerShipping(portalUserId);
  if (!saved) return;
  // DB is source of truth for signed-in customers (profile + last checkout).
  useStore.getState().setShippingInfo(saved);
}

/** Persist shipping for the signed-in customer (no-op for guests). */
export async function persistCheckoutShipping(info: ShippingInfo): Promise<void> {
  const user = usePortalStore.getState().currentUser;
  if (!user || user.role !== "customer") return;
  const result = await saveCustomerShipping(user.id, info);
  if (result.ok === false) {
    logger.warn("Checkout shipping persist skipped", {
      operation: "persistCheckoutShipping",
      error: result.message,
    });
  }
}

export function clearLocalShipping(): void {
  useStore.getState().setShippingInfo({ ...EMPTY_SHIPPING_INFO });
}
