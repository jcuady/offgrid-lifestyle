import type { OrderStatus, PaymentStatus, ShippingInfo } from "@/src/types/commerce";

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
  return formatEnumLabel(method);
}

export function formatOrderStatus(status: OrderStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function formatPaymentStatus(status: PaymentStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function orderStatusClass(status: OrderStatus): string {
  if (status === "delivered" || status === "confirmed") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (status === "in_production" || status === "shipped") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (status === "cancelled") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (status === "pending_deposit") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function paymentStatusClass(status: PaymentStatus): string {
  if (status === "fully_paid" || status === "deposit_paid") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (status === "refunded") {
    return "bg-slate-200 text-slate-700 border-slate-300";
  }
  return "bg-amber-100 text-amber-700 border-amber-200";
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
    return `${heroChipBase} border-offgrid-lime/40 bg-offgrid-lime/20 text-offgrid-lime`;
  }
  if (status === "cancelled") {
    return `${heroChipBase} border-red-300/40 bg-red-950/40 text-red-100`;
  }
  return `${heroChipBase} border-offgrid-cream/25 bg-offgrid-cream/10 text-offgrid-cream`;
}

export function paymentStatusClassOnHero(status: PaymentStatus): string {
  if (status === "fully_paid" || status === "deposit_paid") {
    return `${heroChipBase} border-offgrid-lime/40 bg-offgrid-lime/20 text-offgrid-lime`;
  }
  return `${heroChipBase} border-offgrid-cream/25 bg-offgrid-cream/10 text-offgrid-cream/90`;
}

export const quoteBadgeClassOnHero =
  `${heroChipBase} border-offgrid-lime/40 bg-offgrid-lime/20 text-offgrid-lime`;

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
  const city = info.city?.trim() ?? "";
  const province = info.province?.trim() ?? "";
  const zip = info.zip?.trim() ?? "";
  const parts: string[] = [];
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
