import type { CustomOrderDraft, ShippingInfo } from "@/src/types/commerce";
import { EMPTY_SHIPPING_INFO } from "@/src/types/commerce";
import { ensureNcrShippingFields, isNcrRegion } from "@/src/lib/philippinesAddress";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  return null;
}

export function validateTermsAccepted(accepted: boolean): string | null {
  if (!accepted) return "You must accept the Terms & Conditions and Privacy Policy.";
  return null;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && PHONE_RE.test(phone.trim());
}

export function normalizeShippingInfo(info: Partial<ShippingInfo> | null | undefined): ShippingInfo {
  return {
    ...EMPTY_SHIPPING_INFO,
    ...(info ?? {}),
    latitude: info?.latitude ?? null,
    longitude: info?.longitude ?? null,
  };
}

export function sanitizeShippingInfo(info: ShippingInfo): ShippingInfo {
  return ensureNcrShippingFields({
    ...info,
    fullName: info.fullName.trim(),
    email: info.email.trim().toLowerCase(),
    phone: info.phone.trim(),
    address: info.address.trim(),
    barangay: info.barangay.trim(),
    city: info.city.trim(),
    province: info.province.trim(),
    region: info.region.trim(),
    zip: info.zip.trim(),
    regionCode: info.regionCode.trim(),
    provinceCode: info.provinceCode.trim(),
    cityCode: info.cityCode.trim(),
    barangayCode: info.barangayCode.trim(),
  });
}

export interface RetailCartLineInput {
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export function validateRetailCart(cart: RetailCartLineInput[]): string | null {
  if (!cart.length) return "Your cart is empty. Add items before checking out.";
  for (const item of cart) {
    if (!item.productId?.trim()) return "A cart item is missing a product.";
    if (!item.name?.trim()) return "A cart item is missing a name.";
    if (!item.size?.trim() || !item.color?.trim()) return "Each item needs a size and color.";
    if (!Number.isFinite(item.price) || item.price <= 0) return "A cart item has an invalid price.";
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return "Each item quantity must be between 1 and 99.";
    }
  }
  return null;
}

const PH_ZIP_RE = /^\d{4}$/;

export type ShippingFieldErrors = Partial<
  Record<"fullName" | "email" | "phone" | "address" | "barangay" | "city" | "province" | "region" | "zip", string>
>;

export function validateShippingInfoFields(info: ShippingInfo): ShippingFieldErrors {
  const data = sanitizeShippingInfo(normalizeShippingInfo(info));
  const errors: ShippingFieldErrors = {};
  if (!data.fullName) errors.fullName = "Full name is required.";
  if (!isValidEmail(data.email)) errors.email = "Enter a valid email address.";
  if (!isValidPhone(data.phone)) errors.phone = "Enter a valid Philippine phone number (at least 10 digits).";
  if (!data.region || !data.regionCode) errors.region = "Select your region.";
  if (!isNcrRegion(data.regionCode) && (!data.province || !data.provinceCode)) {
    errors.province = "Select your province.";
  }
  if (!data.city || !data.cityCode) errors.city = "Select your city or municipality.";
  if (!data.barangay || !data.barangayCode) errors.barangay = "Select your barangay.";
  if (!data.address) errors.address = "Street / building address is required.";
  if (!data.zip) errors.zip = "ZIP code is required.";
  else if (!PH_ZIP_RE.test(data.zip)) errors.zip = "Enter a valid 4-digit Philippine ZIP code.";
  return errors;
}

export function validateShippingInfo(info: ShippingInfo): string | null {
  const errors = validateShippingInfoFields(info);
  return Object.values(errors)[0] ?? null;
}

const DELIVERY_ADDRESS_KEYS = ["region", "province", "city", "barangay", "address", "zip"] as const;

export type DeliveryAddressFieldErrors = Pick<ShippingFieldErrors, (typeof DELIVERY_ADDRESS_KEYS)[number]>;

export function validateDeliveryAddressFields(info: ShippingInfo): DeliveryAddressFieldErrors {
  const all = validateShippingInfoFields(info);
  const delivery: DeliveryAddressFieldErrors = {};
  for (const key of DELIVERY_ADDRESS_KEYS) {
    if (all[key]) delivery[key] = all[key];
  }
  return delivery;
}

/** Merge contact fields into shipping snapshot for custom order persistence. */
export function mergeCustomOrderShipping(draft: CustomOrderDraft): ShippingInfo {
  return sanitizeShippingInfo(
    normalizeShippingInfo({
      ...draft.shippingInfo,
      fullName: draft.contactName,
      email: draft.contactEmail,
      phone: draft.contactPhone,
    }),
  );
}

export function validateCustomOrderDraft(draft: CustomOrderDraft): string[] {
  const errors: string[] = [];

  if (!draft.contactName.trim()) errors.push("Full name is required.");
  if (!isValidEmail(draft.contactEmail)) errors.push("Enter a valid email address.");
  if (!isValidPhone(draft.contactPhone)) errors.push("Enter a valid phone number.");

  const deliveryErrors = validateDeliveryAddressFields(mergeCustomOrderShipping(draft));
  for (const msg of Object.values(deliveryErrors)) {
    if (msg) errors.push(msg);
  }

  if (draft.category === "headwear_towels" && !draft.headwearType) {
    errors.push("Select a headwear or towel type.");
  }

  const hasDesign = Boolean(draft.designFileName && draft.designFileKey);
  const hasBrief = draft.designNotes.trim().length > 0;
  if (!hasDesign && !hasBrief) {
    errors.push("Upload a design file or add design notes for OffGrid design support.");
  }

  if (draft.category === "apparel") {
    if (!draft.cut) errors.push("Select a cut and style.");
    if (!draft.material) errors.push("Select a fabric.");
    if (draft.quantity < 10) errors.push("Apparel orders require a minimum of 10 pieces.");
  }

  if (!draft.printMethod) errors.push("Select a print method.");

  if (!draft.orderSheetFileName || !draft.orderSheetFileKey) {
    errors.push("Upload your completed team order sheet.");
  }

  if (draft.quantity < 1) errors.push("Quantity must be at least 1.");

  return errors;
}
