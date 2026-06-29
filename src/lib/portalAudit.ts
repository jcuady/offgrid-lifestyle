import type { AuditAction, AuditLogEntry } from "@/src/types/portal";
import { persistAuditRow } from "@/src/lib/auditPersist";

export const MAX_AUDIT_LOGS = 500;

const ACTION_LABELS: Record<AuditAction, string> = {
  "auth.login": "Sign in",
  "auth.logout": "Sign out",
  "auth.register": "Account created",
  "staff.created": "Staff created",
  "staff.deactivated": "Staff deactivated",
  "staff.reactivated": "Staff reactivated",
  "staff.password_reset": "Password reset",
  "staff.updated": "User updated",
  "order.retail_status_changed": "Retail status",
  "order.retail_payment_changed": "Retail payment",
  "order.custom_status_changed": "Custom status",
  "order.custom_payment_changed": "Custom payment",
  "order.custom_quote_updated": "Custom quote",
  "payment.settings_updated": "Payment settings",
  "product.created": "Product created",
  "product.updated": "Product updated",
  "product.deleted": "Product deleted",
  "content.created": "Content created",
  "content.updated": "Content updated",
  "content.deleted": "Content deleted",
  "review.status_changed": "Review status",
  "review.deleted": "Review deleted",
};

const ACTION_TONE: Record<AuditAction, string> = {
  "auth.login": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "auth.logout": "bg-offgrid-green/5 text-offgrid-green/70 border-offgrid-green/15",
  "auth.register": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "staff.created": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "staff.deactivated": "bg-red-50 text-red-700 border-red-200",
  "staff.reactivated": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "staff.password_reset": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "staff.updated": "bg-offgrid-green/5 text-offgrid-green border-offgrid-green/20",
  "order.retail_status_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.retail_payment_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.custom_status_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.custom_payment_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.custom_quote_updated": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "payment.settings_updated": "bg-offgrid-green/5 text-offgrid-green border-offgrid-green/20",
  "product.created": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "product.updated": "bg-offgrid-green/5 text-offgrid-green border-offgrid-green/20",
  "product.deleted": "bg-red-50 text-red-700 border-red-200",
  "content.created": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "content.updated": "bg-offgrid-green/5 text-offgrid-green border-offgrid-green/20",
  "content.deleted": "bg-red-50 text-red-700 border-red-200",
  "review.status_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "review.deleted": "bg-red-50 text-red-700 border-red-200",
};

export function auditActionLabel(action: AuditAction): string {
  return ACTION_LABELS[action];
}

export function auditActionTone(action: AuditAction): string {
  return ACTION_TONE[action];
}

export function auditActionCategory(action: AuditAction): "auth" | "staff" | "orders" | "payments" | "content" {
  if (action.startsWith("auth.")) return "auth";
  if (action.startsWith("staff.")) return "staff";
  if (action.startsWith("order.")) return "orders";
  if (action.startsWith("product.") || action.startsWith("content.") || action.startsWith("review.")) {
    return "content";
  }
  return "payments";
}

export type AuditInput = Omit<AuditLogEntry, "id" | "createdAt" | "metadata"> & {
  metadata?: Record<string, unknown>;
};

export function createAuditEntry(partial: AuditInput): AuditLogEntry {
  return {
    id: `audit-${crypto.randomUUID().slice(0, 12)}`,
    metadata: partial.metadata ?? {},
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function prependAuditLog(logs: AuditLogEntry[], entry: AuditLogEntry): AuditLogEntry[] {
  return [entry, ...logs].slice(0, MAX_AUDIT_LOGS);
}

/** Append to local store and persist to Supabase. */
export function appendAudit(logs: AuditLogEntry[], partial: AuditInput): AuditLogEntry[] {
  persistAuditRow(partial);
  return prependAuditLog(logs, createAuditEntry(partial));
}

export function formatAuditTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
