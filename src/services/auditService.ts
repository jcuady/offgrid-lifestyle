import type { AuditAction, AuditLogEntry } from "@/src/types/portal";
import type { Database } from "@/src/types/database";
import { logger } from "@/src/lib/logger";
import { auditActionCategory, type AuditInput } from "@/src/lib/portalAudit";
import { supabase } from "@/src/lib/supabase";
import { usePortalStore } from "@/src/store/usePortalStore";

export interface AuditService {
  list: (filters?: {
    category?: "all" | "auth" | "staff" | "orders" | "payments" | "content";
    query?: string;
  }) => Promise<AuditLogEntry[]>;
  count: () => Promise<number>;
  record: (entry: AuditInput) => Promise<void>;
}

type AuditRow = Database["public"]["Tables"]["og_audit_logs"]["Row"];

function rowToEntry(row: AuditRow): AuditLogEntry {
  return {
    id: row.id,
    action: row.action as AuditLogEntry["action"],
    actorId: row.actor_id ?? null,
    actorEmail: row.actor_email,
    actorRole: row.actor_role as AuditLogEntry["actorRole"],
    targetType: row.target_type as AuditLogEntry["targetType"],
    targetId: row.target_id ?? null,
    summary: row.summary,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at,
  };
}

export const supabaseAuditService: AuditService = {
  list: async (filters) => {
    const category = filters?.category ?? "all";
    const query = filters?.query?.trim().toLowerCase() ?? "";

    const { data, error } = await supabase
      .from("og_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) {
      logger.warn("Supabase audit fetch failed, falling back to store", {
        operation: "audit.list",
        error: error?.message,
      });
      const logs = usePortalStore.getState().auditLogs;
      return logs.filter((entry) => {
        if (category !== "all" && auditActionCategory(entry.action as AuditAction) !== category) return false;
        if (!query) return true;
        return entry.summary.toLowerCase().includes(query) || entry.actorEmail.toLowerCase().includes(query);
      });
    }

    let entries = data.map(rowToEntry);
    if (category !== "all") {
      entries = entries.filter((e) => auditActionCategory(e.action as AuditAction) === category);
    }
    if (query) {
      entries = entries.filter(
        (e) =>
          e.summary.toLowerCase().includes(query) ||
          e.actorEmail.toLowerCase().includes(query) ||
          e.action.toLowerCase().includes(query),
      );
    }
    return entries;
  },

  count: async () => {
    const { count, error } = await supabase
      .from("og_audit_logs")
      .select("*", { count: "exact", head: true });

    if (error || count === null) {
      return usePortalStore.getState().auditLogs.length;
    }
    return count;
  },

  record: async (entry) => {
    usePortalStore.getState().recordAudit(entry);
  },
};
