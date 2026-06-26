import type { AuditAction, AuditLogEntry } from "@/src/types/portal";

export const MAX_AUDIT_LOGS = 500;

const ACTION_LABELS: Record<AuditAction, string> = {
  "auth.login": "Sign in",
  "auth.logout": "Sign out",
  "staff.created": "Staff created",
  "staff.deactivated": "Staff deactivated",
  "staff.reactivated": "Staff reactivated",
  "staff.password_reset": "Password reset",
  "order.retail_status_changed": "Retail status",
  "order.retail_payment_changed": "Retail payment",
  "order.custom_status_changed": "Custom status",
  "order.custom_payment_changed": "Custom payment",
  "order.custom_quote_updated": "Custom quote",
  "payment.settings_updated": "Payment settings",
};

const ACTION_TONE: Record<AuditAction, string> = {
  "auth.login": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "auth.logout": "bg-offgrid-green/5 text-offgrid-green/70 border-offgrid-green/15",
  "staff.created": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "staff.deactivated": "bg-red-50 text-red-700 border-red-200",
  "staff.reactivated": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "staff.password_reset": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.retail_status_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.retail_payment_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.custom_status_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.custom_payment_changed": "bg-offgrid-gold/10 text-offgrid-gold border-offgrid-gold/30",
  "order.custom_quote_updated": "bg-offgrid-lime/15 text-offgrid-green border-offgrid-lime/35",
  "payment.settings_updated": "bg-offgrid-green/5 text-offgrid-green border-offgrid-green/20",
};

export function auditActionLabel(action: AuditAction): string {
  return ACTION_LABELS[action];
}

export function auditActionTone(action: AuditAction): string {
  return ACTION_TONE[action];
}

export function auditActionCategory(action: AuditAction): "auth" | "staff" | "orders" | "payments" {
  if (action.startsWith("auth.")) return "auth";
  if (action.startsWith("staff.")) return "staff";
  if (action.startsWith("order.")) return "orders";
  return "payments";
}

export function createAuditEntry(
  partial: Omit<AuditLogEntry, "id" | "createdAt" | "metadata"> & { metadata?: Record<string, unknown> },
): AuditLogEntry {
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
