import type { AuditInput } from "@/src/lib/portalAudit";
import type { Json } from "@/src/types/database";
import { supabase } from "@/src/lib/supabase";
import { logger } from "@/src/lib/logger";

/** Persist one audit row to Supabase (fire-and-forget). */
export function persistAuditRow(entry: AuditInput): void {
  void supabase
    .from("og_audit_logs")
    .insert({
      action: entry.action,
      actor_id: entry.actorId || null,
      actor_email: entry.actorEmail,
      actor_role: entry.actorRole,
      target_type: entry.targetType,
      target_id: entry.targetId ?? null,
      summary: entry.summary,
      metadata: (entry.metadata ?? {}) as Json,
    })
    .then(({ error }) => {
      if (error) {
        logger.warn("Audit row insert failed", {
          operation: "audit.persist",
          action: entry.action,
          error: error.message,
        });
      }
    });
}
