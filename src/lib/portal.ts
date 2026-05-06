import type { OrderStatus, PaymentStatus } from "@/src/types/commerce";

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
