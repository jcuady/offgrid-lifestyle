import type { CustomOrderDraft, ShippingInfo } from "@/src/types/commerce";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && PHONE_RE.test(phone.trim());
}

export function validateShippingInfo(info: ShippingInfo): string | null {
  if (!info.fullName.trim()) return "Full name is required.";
  if (!isValidEmail(info.email)) return "Enter a valid email address.";
  if (!isValidPhone(info.phone)) return "Enter a valid phone number (at least 10 digits).";
  if (!info.address.trim()) return "Address is required.";
  if (!info.city.trim()) return "City is required.";
  if (!info.province.trim()) return "Province is required.";
  if (!info.zip.trim()) return "ZIP code is required.";
  return null;
}

export function validateCustomOrderDraft(draft: CustomOrderDraft): string[] {
  const errors: string[] = [];

  if (!draft.contactName.trim()) errors.push("Full name is required.");
  if (!isValidEmail(draft.contactEmail)) errors.push("Enter a valid email address.");
  if (!isValidPhone(draft.contactPhone)) errors.push("Enter a valid phone number.");

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
