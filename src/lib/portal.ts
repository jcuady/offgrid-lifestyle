import type { OrderStatus, PaymentStatus, ShippingInfo, OrderType } from "@/src/types/commerce";

/** Display snake_case enums / identifiers as Title Case labels */
export function formatEnumLabel(value: string | null | undefined): string {
  if (!value) return "N/A";
  return value.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function formatPaymentMethodLabel(method: string | null | undefined): string {
  if (!method) return "N/A";
  const m = method.toLowerCase();
  if (m === "gcash") return "GCash";
  if (m === "cod") return "Cash on delivery (COD)";
  if (m === "paymongo") return "PayMongo QR Ph";
  if (m === "card") return "Credit / debit card";
  return formatEnumLabel(method);
}

export function formatOrderStatus(status: OrderStatus, orderType?: OrderType): string {
  if (orderType === "retail" && status === "pending_deposit") return "Order placed";
  if (orderType === "custom" && status === "pending_deposit") return "Pending deposit";
  return status.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function formatPaymentStatus(status: PaymentStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/**
 * Admin / staff status chips — brand-token semantic system:
 * lime = done, gold/navy = in progress, ink = awaiting, red = cancelled (danger).
 */
export function orderStatusClass(status: OrderStatus): string {
  if (status === "delivered" || status === "confirmed") {
    return "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/40";
  }
  if (status === "in_production" || status === "shipped") {
    return "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30";
  }
  if (status === "cancelled") {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (status === "pending_deposit") {
    return "bg-offgrid-green/[0.07] text-offgrid-green border-offgrid-green/25";
  }
  return "bg-white text-offgrid-green/60 border-offgrid-green/15";
}

export function paymentStatusClass(status: PaymentStatus): string {
  if (status === "fully_paid" || status === "deposit_paid") {
    return "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/40";
  }
  if (status === "refunded") {
    return "bg-offgrid-cream text-offgrid-green/70 border-offgrid-green/15";
  }
  return "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30";
}

/** Customer storefront — muted chips using brand tokens (offgrid-green / cream / lime). */
export function orderStatusClassCustomer(status: OrderStatus): string {
  const base =
    "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]";
  if (status === "delivered" || status === "confirmed") {
    return `${base} border-offgrid-green/25 bg-offgrid-lime/25 text-offgrid-green`;
  }
  if (status === "in_production" || status === "shipped") {
    return `${base} border-offgrid-green/20 bg-offgrid-green/10 text-offgrid-green`;
  }
  if (status === "cancelled") {
    return `${base} border-red-200/80 bg-red-50 text-red-800`;
  }
  if (status === "pending_deposit") {
    return `${base} border-offgrid-green/20 bg-offgrid-cream text-offgrid-green`;
  }
  return `${base} border-offgrid-green/15 bg-white text-offgrid-green/80`;
}

export function paymentStatusClassCustomer(status: PaymentStatus): string {
  const base =
    "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]";
  if (status === "fully_paid" || status === "deposit_paid") {
    return `${base} border-offgrid-green/25 bg-offgrid-lime/25 text-offgrid-green`;
  }
  if (status === "refunded") {
    return `${base} border-offgrid-green/15 bg-offgrid-cream text-offgrid-green/70`;
  }
  return `${base} border-offgrid-green/20 bg-offgrid-cream text-offgrid-green`;
}

const heroChipBase =
  "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]";

/** Status chips on account green hero band (cream/lime on dark). */
export function orderStatusClassOnHero(status: OrderStatus): string {
  if (status === "delivered" || status === "confirmed") {
    return `${heroChipBase} border-offgrid-lime/50 bg-offgrid-lime/30 text-white`;
  }
  if (status === "cancelled") {
    return `${heroChipBase} border-red-300/40 bg-red-950/40 text-red-100`;
  }
  return `${heroChipBase} border-offgrid-cream/25 bg-offgrid-cream/10 text-offgrid-cream`;
}

export function paymentStatusClassOnHero(status: PaymentStatus): string {
  if (status === "fully_paid" || status === "deposit_paid") {
    return `${heroChipBase} border-offgrid-lime/50 bg-offgrid-lime/30 text-white`;
  }
  return `${heroChipBase} border-offgrid-cream/25 bg-offgrid-cream/10 text-offgrid-cream/90`;
}

export const quoteBadgeClassOnHero =
  `${heroChipBase} border-offgrid-lime/50 bg-offgrid-lime/30 text-white`;

export const quotePendingClassOnHero =
  `${heroChipBase} border-offgrid-cream/20 bg-offgrid-cream/10 text-offgrid-cream/80`;

export function formatOrderTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function looksLikeTechnicalId(value: string): boolean {
  const t = value.trim();
  if (t.length < 12) return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return true;
  if (/^[0-9a-f-]{24,}$/i.test(t)) return true;
  return false;
}

/** Safe one-line destination for order cards; hides UUID-like province/city values. */
export function formatShippingLocality(info: ShippingInfo | null | undefined): string | null {
  if (!info) return null;
  const barangay = info.barangay?.trim() ?? "";
  const city = info.city?.trim() ?? "";
  const province = info.province?.trim() ?? "";
  const zip = info.zip?.trim() ?? "";
  const parts: string[] = [];
  if (barangay && !looksLikeTechnicalId(barangay)) parts.push(barangay);
  if (city && !looksLikeTechnicalId(city)) parts.push(city);
  if (province && !looksLikeTechnicalId(province)) parts.push(province);
  if (parts.length) {
    return parts.join(" · ");
  }
  if (zip && !looksLikeTechnicalId(zip)) {
    return `ZIP ${zip}`;
  }
  return "Shipping address on file";
}

/** City / province / ZIP line for full-page delivery block (dedupes ZIP). */
export function formatCityProvinceZipLine(info: ShippingInfo | null | undefined): string {
  if (!info) return "—";
  const locality = formatShippingLocality(info);
  const zip = info.zip?.trim() ?? "";
  const zipLabel = zip && !looksLikeTechnicalId(zip) ? `ZIP ${zip}` : null;
  if (locality === "Shipping address on file" && zipLabel) return zipLabel;
  if (locality === "Shipping address on file") return locality;
  if (zipLabel && !locality.includes(zip)) {
    return `${locality} · ${zipLabel}`;
  }
  return locality;
}

/** Custom orders: admin has set a binding official total (PHP). */
export function hasOfficialCustomQuote(officialTotal: { amount: number; currency: string } | null | undefined): boolean {
  return officialTotal !== null && officialTotal !== undefined && officialTotal.amount > 0;
}

/** Amount the customer should pay now via GCash (deposit or remaining balance). */
export function customOrderGCashAmountDue(input: {
  paymentStatus: string;
  officialTotal?: { amount: number; currency: string } | null;
  officialDeposit?: { amount: number; currency: string } | null;
}): { amount: number; currency: string; kind: "deposit" | "balance" } | null {
  if (!hasOfficialCustomQuote(input.officialTotal) || !input.officialTotal) return null;
  const currency = input.officialTotal.currency || "PHP";
  if (input.paymentStatus === "deposit_paid") {
    const deposit = input.officialDeposit?.amount ?? 0;
    const remaining = Math.max(0, Math.round(input.officialTotal.amount - deposit));
    if (remaining <= 0) return null;
    return { amount: remaining, currency, kind: "balance" };
  }
  if (input.paymentStatus === "unpaid") {
    const deposit = input.officialDeposit?.amount ?? 0;
    if (deposit <= 0) return null;
    return { amount: deposit, currency, kind: "deposit" };
  }
  return null;
}

