import type { CreateStaffInput } from "@/src/types/portal";
import { logger } from "@/src/lib/logger";
import { supabase } from "@/src/lib/supabase";
import { usePortalStore } from "@/src/store/usePortalStore";

export interface PortalUserRow {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface UpdateUserInput {
  portalUserId: string;
  name?: string;
  email?: string;
  password?: string;
}

async function callManageUser(body: Record<string, unknown>): Promise<{ ok: boolean; message?: string; id?: string }> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) {
    return { ok: false, message: "You must be signed in as admin." };
  }

  try {
    const response = await fetch(`${projectUrl}/functions/v1/manage-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        ...(anonKey ? { apikey: anonKey } : {}),
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!response.ok) {
      return { ok: false, message: result.error ?? "Request failed." };
    }
    return { ok: true, id: result.id };
  } catch (err) {
    logger.warn("manage-user edge function failed", {
      service: "userService",
      operation: String(body.action),
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, message: "Could not reach user management service." };
  }
}

export const userService = {
  async list(role?: PortalUserRow["role"]): Promise<PortalUserRow[]> {
    let query = supabase
      .from("og_portal_users")
      .select("id, name, email, role, status, created_at, updated_at, last_login_at")
      .order("created_at", { ascending: false });

    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query;
    if (error || !data) {
      logger.warn("Failed to list portal users", {
        service: "userService",
        operation: "list",
        error: error?.message,
      });
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as PortalUserRow["role"],
      status: row.status as PortalUserRow["status"],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
    }));
  },

  createStaff(input: CreateStaffInput) {
    return callManageUser({
      action: "create",
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
  },

  updateUser(input: UpdateUserInput) {
    return callManageUser({
      action: "update",
      portalUserId: input.portalUserId,
      name: input.name?.trim(),
      email: input.email?.trim().toLowerCase(),
      password: input.password,
    });
  },

  resetPassword(portalUserId: string, password: string) {
    return callManageUser({
      action: "reset_password",
      portalUserId,
      password,
    });
  },

  deleteUser(portalUserId: string) {
    return callManageUser({
      action: "delete",
      portalUserId,
    });
  },

  async setStatus(portalUserId: string, status: PortalUserRow["status"]) {
    const { error } = await supabase
      .from("og_portal_users")
      .update({ status })
      .eq("id", portalUserId);

    if (error) {
      return { ok: false, message: error.message };
    }

    const actor = usePortalStore.getState().currentUser;
    if (actor) {
      usePortalStore.getState().recordAudit({
        action: status === "active" ? "staff.reactivated" : "staff.deactivated",
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        targetType: "user",
        targetId: portalUserId,
        summary: `${status === "active" ? "Reactivated" : "Deactivated"} user ${portalUserId}`,
      });
    }

    return { ok: true };
  },
};
