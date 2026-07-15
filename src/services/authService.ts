import type { User } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";
import { logger } from "@/src/lib/logger";
import { usePortalStore, type PortalUser, type UserRole } from "@/src/store/usePortalStore";
import { linkPushSubscriptionToUser } from "@/src/lib/pushSubscription";
import type { PasswordResetAudience } from "@/src/lib/passwordReset";
import { passwordResetRedirectUrl } from "@/src/lib/passwordReset";

export interface AuthService {
  currentUser: () => PortalUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  /** Development-only shortcut used by local demo flows. */
  loginAsRole: (role: UserRole) => void;
  registerCustomer: (input: RegisterCustomerInput) => Promise<{ ok: boolean; message?: string; userId?: string; emailConfirmationRequired?: boolean }>;
  requestPasswordReset: (email: string, audience?: PasswordResetAudience) => Promise<{ ok: boolean; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
}

/** Ensure og_portal_users row exists and return the portal-scoped user (not auth.users id). */
async function ensurePortalUserRow(user: User): Promise<PortalUser | null> {
  const role = (user.app_metadata?.portal_role as UserRole) ?? "customer";

  const { data: existing } = await supabase
    .from("og_portal_users")
    .select("id, name, email, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role: existing.role as UserRole,
    };
  }

  if (role !== "customer") {
    return null;
  }

  const name = (user.user_metadata?.name as string) ?? user.email?.split("@")[0] ?? "Customer";
  const email = user.email ?? "";
  const phone = (user.user_metadata?.phone as string) ?? null;

  const { data: inserted, error: insertErr } = await supabase
    .from("og_portal_users")
    .insert({
      auth_user_id: user.id,
      name,
      email,
      phone,
      role: "customer",
      status: "active",
    })
    .select("id, name, email, role")
    .maybeSingle();

  if (insertErr && !insertErr.message.includes("duplicate")) {
    logger.warn("Portal user row insert failed", {
      operation: "ensurePortalUserRow",
      error: insertErr.message,
    });
  }

  if (inserted) {
    return { id: inserted.id, name: inserted.name, email: inserted.email, role: "customer" };
  }

  const { data: retry } = await supabase
    .from("og_portal_users")
    .select("id, name, email, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (retry) {
    return { id: retry.id, name: retry.name, email: retry.email, role: retry.role as UserRole };
  }

  return null;
}

async function resolvePortalUser(): Promise<PortalUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return ensurePortalUserRow(user);
}

export const supabaseAuthService: AuthService = {
  currentUser: () => usePortalStore.getState().currentUser,

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, message: error.message };
    }
    const portalUser = await resolvePortalUser();
    if (!portalUser) {
      return { ok: false, message: "Could not load your account profile. Please try again." };
    }
    usePortalStore.getState().setCurrentUser(portalUser);
    usePortalStore.getState().recordAudit({
      action: "auth.login",
      actorId: portalUser.id,
      actorEmail: portalUser.email,
      actorRole: portalUser.role,
      targetType: "session",
      targetId: portalUser.id,
      summary: `${portalUser.email} signed in`,
    });
    void linkPushSubscriptionToUser();
    return { ok: true };
  },

  loginAsRole: (role) => {
    if (!import.meta.env.DEV) {
      logger.warn("Blocked demo role login outside development", {
        operation: "auth.loginAsRole",
        role,
      });
      return;
    }
    usePortalStore.getState().loginAsRole(role);
  },

  registerCustomer: async (input) => {
    const redirectTo = `${window.location.origin}/account/sign-in?confirmed=1`;
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { name: input.name, phone: input.phone },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
        return { ok: false, message: "An account with this email already exists. Please sign in instead." };
      }
      return { ok: false, message: error.message };
    }

    const authUserId = data.user?.id;
    if (!authUserId) {
      return { ok: false, message: "Sign-up succeeded but no user ID returned." };
    }

    const emailConfirmationRequired = data.user?.identities !== undefined && data.user.identities.length === 0;

    let portalUser: PortalUser | null = null;
    if (data.session && data.user) {
      portalUser = await ensurePortalUserRow(data.user);
    }

    if (!portalUser) {
      portalUser = {
        id: authUserId,
        name: input.name,
        email: input.email,
        role: "customer",
      };
    }

    if (!emailConfirmationRequired && portalUser) {
      usePortalStore.getState().setCurrentUser(portalUser);
      usePortalStore.getState().recordAudit({
        action: "auth.register",
        actorId: portalUser.id,
        actorEmail: portalUser.email,
        actorRole: portalUser.role,
        targetType: "user",
        targetId: portalUser.id,
        summary: `Customer account created for ${portalUser.email}`,
        metadata: { customerId: portalUser.id },
      });
      void linkPushSubscriptionToUser();
    }

    return { ok: true, userId: portalUser.id, emailConfirmationRequired };
  },

  requestPasswordReset: async (email, audience = "customer") => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      return { ok: false, message: "Enter your email address." };
    }

    const redirectTo = passwordResetRedirectUrl(window.location.origin, audience);
    const { error } = await supabase.auth.resetPasswordForEmail(normalized, { redirectTo });
    if (error) {
      return { ok: false, message: error.message };
    }
    const audienceHint =
      audience === "portal"
        ? " If this email is a team portal account, use the new password on the portal sign-in page."
        : "";
    return { ok: true, message: `Check your email for a password reset link.${audienceHint}` };
  },

  updatePassword: async (newPassword) => {
    const password = newPassword.trim();
    if (password.length < 8) {
      return { ok: false, message: "Password must be at least 8 characters." };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true };
  },

  logout: async () => {
    const user = usePortalStore.getState().currentUser;
    if (user) {
      usePortalStore.getState().recordAudit({
        action: "auth.logout",
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        targetType: "session",
        targetId: user.id,
        summary: `${user.email} signed out`,
      });
    }
    await supabase.auth.signOut();
    usePortalStore.getState().setCurrentUser(null);
  },
};

/** Initialize auth state from existing session on app load. */
export async function initAuthListener() {
  const portalUser = await resolvePortalUser();
  usePortalStore.getState().setCurrentUser(portalUser);

  supabase.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_OUT") {
      usePortalStore.getState().setCurrentUser(null);
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      const user = await resolvePortalUser();
      usePortalStore.getState().setCurrentUser(user);
      if (event === "SIGNED_IN" && user) {
        void linkPushSubscriptionToUser();
      }
    }
  });
}
