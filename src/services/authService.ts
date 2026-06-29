import { supabase } from "@/src/lib/supabase";
import { usePortalStore, type PortalUser, type UserRole } from "@/src/store/usePortalStore";
import type { RegisterCustomerInput } from "@/src/types/portal";

export interface AuthService {
  currentUser: () => PortalUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  loginAsRole: (role: UserRole) => void;
  registerCustomer: (input: RegisterCustomerInput) => Promise<{ ok: boolean; message?: string; userId?: string; emailConfirmationRequired?: boolean }>;
  logout: () => Promise<void>;
}

async function resolvePortalUser(): Promise<PortalUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const role = (user.app_metadata?.portal_role as UserRole) ?? "customer";

  const { data: portalRow } = await supabase
    .from("og_portal_users")
    .select("id, name, email, role")
    .eq("auth_user_id", user.id)
    .single();

  if (portalRow) {
    return {
      id: portalRow.id,
      name: portalRow.name,
      email: portalRow.email,
      role: portalRow.role as UserRole,
    };
  }

  return {
    id: user.id,
    name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
    email: user.email ?? "",
    role,
  };
}

export const supabaseAuthService: AuthService = {
  currentUser: () => usePortalStore.getState().currentUser,

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, message: error.message };
    }
    const portalUser = await resolvePortalUser();
    if (portalUser) {
      usePortalStore.getState().setCurrentUser(portalUser);
    }
    return { ok: true };
  },

  loginAsRole: (role) => {
    usePortalStore.getState().loginAsRole(role);
  },

  registerCustomer: async (input) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { name: input.name, portal_role: "customer" },
      },
    });

    if (error) {
      // "Email already registered" — give a clear, friendly message
      if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
        return { ok: false, message: "An account with this email already exists. Please sign in instead." };
      }
      return { ok: false, message: error.message };
    }

    const authUserId = data.user?.id;
    if (!authUserId) {
      return { ok: false, message: "Sign-up succeeded but no user ID returned." };
    }

    // Detect if email confirmation is pending (Supabase returns empty identities)
    const emailConfirmationRequired = (data.user?.identities?.length ?? 1) === 0;

    // Insert og_portal_users row — allowed by the customer insert RLS policy
    const { data: portalRow, error: insertErr } = await supabase
      .from("og_portal_users")
      .insert({
        auth_user_id: authUserId,
        name: input.name,
        email: input.email,
        role: "customer",
        status: "active",
      })
      .select("id")
      .single();

    if (insertErr && !insertErr.message.includes("duplicate")) {
      console.warn("Portal user row insert failed:", insertErr.message);
    }

    // Fetch existing row if insert failed (user may have re-registered)
    let portalId = portalRow?.id;
    if (!portalId) {
      const { data: existing } = await supabase
        .from("og_portal_users")
        .select("id")
        .eq("auth_user_id", authUserId)
        .single();
      portalId = existing?.id ?? authUserId;
    }

    const portalUser: PortalUser = {
      id: portalId,
      name: input.name,
      email: input.email,
      role: "customer",
    };

    if (!emailConfirmationRequired) {
      usePortalStore.getState().setCurrentUser(portalUser);
    }

    return { ok: true, userId: portalUser.id, emailConfirmationRequired };
  },

  logout: async () => {
    await supabase.auth.signOut();
    usePortalStore.getState().setCurrentUser(null);
  },
};

/** Initialize auth state from existing session on app load. */
export async function initAuthListener() {
  const portalUser = await resolvePortalUser();
  if (portalUser) {
    usePortalStore.getState().setCurrentUser(portalUser);
  }

  supabase.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_OUT") {
      usePortalStore.getState().setCurrentUser(null);
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      const user = await resolvePortalUser();
      if (user) {
        usePortalStore.getState().setCurrentUser(user);
      }
    }
  });
}
