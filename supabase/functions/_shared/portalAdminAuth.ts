import { createClient, type SupabaseClient, type User } from "jsr:@supabase/supabase-js@2";

export type PortalAdminRow = {
  id: string;
  email: string;
  role: string;
  status: string;
};

export function isActivePortalAdmin(row: PortalAdminRow | null | undefined): boolean {
  return row?.role === "admin" && row.status === "active";
}

export async function loadActivePortalAdmin(
  admin: SupabaseClient,
  authUserId: string,
): Promise<PortalAdminRow | null> {
  const { data } = await admin
    .from("og_portal_users")
    .select("id, email, role, status")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  return data as PortalAdminRow | null;
}

export async function requireActivePortalAdmin(input: {
  admin: SupabaseClient;
  caller: User;
}): Promise<{ portalAdmin: PortalAdminRow } | { error: string; status: 403 | 404 }> {
  const portalAdmin = await loadActivePortalAdmin(input.admin, input.caller.id);
  if (!isActivePortalAdmin(portalAdmin)) {
    return { error: "Admin access required", status: 403 };
  }
  return { portalAdmin: portalAdmin! };
}
