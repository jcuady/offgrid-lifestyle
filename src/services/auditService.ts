import type { AuditAction, AuditLogEntry } from "@/src/types/portal";
import { auditActionCategory } from "@/src/lib/portalAudit";
import { usePortalStore } from "@/src/store/usePortalStore";

export interface AuditService {
  list: (filters?: { category?: "all" | "auth" | "staff" | "orders" | "payments"; query?: string }) => AuditLogEntry[];
  count: () => number;
}

export const localAuditService: AuditService = {
  list: (filters) => {
    const logs = usePortalStore.getState().auditLogs;
    const category = filters?.category ?? "all";
    const query = filters?.query?.trim().toLowerCase() ?? "";

    return logs.filter((entry) => {
      if (category !== "all" && auditActionCategory(entry.action as AuditAction) !== category) {
        return false;
      }
      if (!query) return true;
      return (
        entry.summary.toLowerCase().includes(query) ||
        entry.actorEmail.toLowerCase().includes(query) ||
        entry.action.toLowerCase().includes(query) ||
        (entry.targetId?.toLowerCase().includes(query) ?? false)
      );
    });
  },
  count: () => usePortalStore.getState().auditLogs.length,
};
