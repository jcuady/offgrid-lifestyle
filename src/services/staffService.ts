import type { CreateStaffInput, ManagedStaffAccount } from "@/src/types/portal";
import { logger } from "@/src/lib/logger";
import { supabase } from "@/src/lib/supabase";
import { usePortalStore } from "@/src/store/usePortalStore";
import { userService } from "@/src/services/userService";

export interface StaffService {
  list: () => Promise<ManagedStaffAccount[]>;
  create: (input: CreateStaffInput) => Promise<{ ok: boolean; message?: string; accountId?: string }>;
  setStatus: (staffId: string, status: ManagedStaffAccount["status"]) => Promise<{ ok: boolean; message?: string }>;
  resetPassword: (staffId: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  update: (
    staffId: string,
    patch: { name?: string; email?: string; password?: string },
  ) => Promise<{ ok: boolean; message?: string }>;
}

export const supabaseStaffService: StaffService = {
  list: async () => {
    const rows = await userService.list("staff");
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: "••••••••",
      role: "staff" as const,
      status: row.status,
      createdBy: "",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastLoginAt: row.lastLoginAt,
    }));
  },

  create: async (input) => {
    const result = await userService.createStaff(input);
    if (!result.ok) return result;

    const actor = usePortalStore.getState().currentUser;
    if (actor) {
      usePortalStore.getState().recordAudit({
        action: "staff.created",
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        targetType: "user",
        targetId: result.id ?? "unknown",
        summary: `Created staff account for ${input.email}`,
        metadata: { staffEmail: input.email },
      });
    }

    const accounts = await supabaseStaffService.list();
    usePortalStore.setState({ managedStaffAccounts: accounts });
    return { ok: true, accountId: result.id };
  },

  setStatus: async (staffId, status) => {
    const result = await userService.setStatus(staffId, status);
    if (result.ok) {
      const accounts = await supabaseStaffService.list();
      usePortalStore.setState({ managedStaffAccounts: accounts });
    }
    return result;
  },

  resetPassword: async (staffId, newPassword) => {
    const result = await userService.resetPassword(staffId, newPassword);
    if (!result.ok) return result;

    const actor = usePortalStore.getState().currentUser;
    if (actor) {
      usePortalStore.getState().recordAudit({
        action: "staff.password_reset",
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        targetType: "user",
        targetId: staffId,
        summary: `Reset password for staff user ${staffId}`,
      });
    }
    return { ok: true };
  },

  update: async (staffId, patch) => {
    const result = await userService.updateUser({
      portalUserId: staffId,
      name: patch.name,
      email: patch.email,
      password: patch.password,
    });
    if (result.ok) {
      const accounts = await supabaseStaffService.list();
      usePortalStore.setState({ managedStaffAccounts: accounts });
    }
    return result;
  },
};
