import type { User } from "@supabase/supabase-js";
import {
  AUTH_ACCOUNT_EXISTS,
  isDuplicateSignUpUser,
  isEmailConfirmationPending,
  mapSignInErrorMessage,
  mapSignUpErrorMessage,
} from "@/src/lib/authErrors";
import { isValidEmail, validatePassword } from "@/src/lib/formValidation";
import { supabase } from "@/src/lib/supabase";
import { logger } from "@/src/lib/logger";
import { usePortalStore, type PortalUser, type UserRole } from "@/src/store/usePortalStore";
import {
  clearLocalShipping,
  hydrateCheckoutShipping,
} from "@/src/services/customerShippingService";
import { linkPushSubscriptionToUser } from "@/src/lib/pushSubscription";
import type { PasswordResetAudience } from "@/src/lib/passwordReset";
import {
  ensureRecoverySession,
  isRecoveryAuthBootstrap,
  markPasswordRecoveryIntent,
  passwordResetRedirectUrl,
  shouldSkipPostLoginSideEffects,
  stashRecoveryTokensFromUrl,
} from "@/src/lib/passwordReset";
import { authCallbackRedirectPath, classifyAuthCallback } from "@/src/lib/authCallbackRouting";
import { markEmailConfirmHandoffTab } from "@/src/lib/authTabSync";
import type { RegisterCustomerInput } from "@/src/types/portal";

export interface AuthService {
  currentUser: () => PortalUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  /** Development-only shortcut used by local demo flows. */
  loginAsRole: (role: UserRole) => void;
  registerCustomer: (input: RegisterCustomerInput) => Promise<{
    ok: boolean;
    message?: string;
    userId?: string;
    emailConfirmationRequired?: boolean;
    /** Present when sign-up failed because the email is already registered. */
    code?: "email_exists";
  }>;
  requestPasswordReset: (email: string, audience?: PasswordResetAudience) => Promise<{ ok: boolean; message?: string }>;
  /** Re-authenticate with the current account password (no audit side effects). */
  verifyPassword: (password: string) => Promise<{ ok: boolean; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  updateEmail: (newEmail: string) => Promise<{ ok: boolean; message?: string }>;
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
    const authEmail = (user.email ?? existing.email).trim().toLowerCase();
    if (authEmail && authEmail !== existing.email.toLowerCase()) {
      // Keep portal directory in sync after confirmed email changes.
      await supabase
        .from("og_portal_users")
        .update({ email: authEmail })
        .eq("id", existing.id);
    }
    return {
      id: existing.id,
      name: existing.name,
      email: authEmail || existing.email,
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
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return { ok: false, message: "Enter a valid email address." };
    }
    if (!password) {
      return { ok: false, message: "Enter your password." };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) {
      return { ok: false, message: mapSignInErrorMessage(error.message) };
    }
    const portalUser = await resolvePortalUser();
    if (!portalUser) {
      await supabase.auth.signOut();
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
    if (portalUser.role === "customer") void hydrateCheckoutShipping(portalUser.id);
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
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const passwordError = validatePassword(input.password);
    if (!name) return { ok: false, message: "Full name is required." };
    if (!isValidEmail(email)) return { ok: false, message: "Enter a valid email address." };
    if (passwordError) return { ok: false, message: passwordError };

    // After confirm, land on orders (session established from the email link).
    const redirectTo = `${window.location.origin}/account/orders`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: { name, phone },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      const message = mapSignUpErrorMessage(error.message);
      return {
        ok: false,
        message,
        ...(message === AUTH_ACCOUNT_EXISTS ? { code: "email_exists" as const } : {}),
      };
    }

    // Existing account: Supabase returns 200 + empty identities (do not show "check your email").
    if (isDuplicateSignUpUser(data.user)) {
      return { ok: false, message: AUTH_ACCOUNT_EXISTS, code: "email_exists" };
    }

    const authUserId = data.user?.id;
    if (!authUserId) {
      return { ok: false, message: "Sign-up succeeded but no user ID returned." };
    }

    const emailConfirmationRequired = isEmailConfirmationPending({
      user: data.user,
      session: data.session,
    });

    let portalUser: PortalUser | null = null;
    if (data.session && data.user) {
      portalUser = await ensurePortalUserRow(data.user);
    }

    if (!portalUser) {
      portalUser = {
        id: authUserId,
        name,
        email,
        role: "customer",
      };
    }

    if (!emailConfirmationRequired && data.session && portalUser) {
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
      return { ok: false, message: mapSignUpErrorMessage(error.message) };
    }
    const audienceHint =
      audience === "portal"
        ? " If this email is a team portal account, use the new password on the portal sign-in page."
        : "";
    // Always success-shaped: do not reveal whether the email exists.
    return { ok: true, message: `Check your email for a password reset link.${audienceHint}` };
  },

  updatePassword: async (newPassword) => {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return { ok: false, message: passwordError };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
    if (error) {
      return { ok: false, message: error.message.trim() || "Unable to update password. Please try again." };
    }
    return { ok: true };
  },

  verifyPassword: async (password) => {
    const email = usePortalStore.getState().currentUser?.email;
    if (!email) {
      return { ok: false, message: "You must be signed in." };
    }
    if (!password) {
      return { ok: false, message: "Enter your current password." };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { ok: false, message: "Current password is incorrect." };
    }
    return { ok: true };
  },

  updateEmail: async (newEmail) => {
    const normalized = newEmail.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      return { ok: false, message: "Enter a valid email address." };
    }
    const current = usePortalStore.getState().currentUser?.email?.trim().toLowerCase();
    if (current && normalized === current) {
      return { ok: false, message: "New email must be different from your current email." };
    }

    const { data, error } = await supabase.auth.updateUser({ email: normalized });
    if (error) {
      return { ok: false, message: error.message.trim() || "Unable to update email. Please try again." };
    }

    // Immediate email change (no confirm) — sync portal row now.
    // Confirm-required flows keep the old email until the user clicks the link.
    const confirmedEmail = data.user?.email?.trim().toLowerCase();
    if (confirmedEmail === normalized) {
      const portalId = usePortalStore.getState().currentUser?.id;
      if (portalId) {
        await supabase.from("og_portal_users").update({ email: normalized }).eq("id", portalId);
        const user = usePortalStore.getState().currentUser;
        if (user) {
          usePortalStore.getState().setCurrentUser({ ...user, email: normalized });
        }
      }
      return { ok: true, message: "Email updated." };
    }

    return {
      ok: true,
      message: "Check your new inbox to confirm the email change, then sign in with the new address.",
    };
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
  // Route signup confirm → /account/orders and recovery → /account/reset-password.
  // Never treat signup tokens as password recovery.
  if (typeof window !== "undefined") {
    // Snapshot hash tokens BEFORE detectSessionInUrl clears them.
    stashRecoveryTokensFromUrl();
    const { pathname, hash, search } = window.location;
    if (isRecoveryAuthBootstrap({ pathname, hash, search })) {
      markPasswordRecoveryIntent();
      // Clear portal chrome only. Never signOut here — it races detectSessionInUrl
      // and wipes the recovery session after the hash is already empty.
      usePortalStore.getState().setCurrentUser(null);
    }
  }

  redirectAuthCallback();

  try {
    // Ensures PKCE/hash from the confirm-email link is exchanged before route guards run.
    await supabase.auth.getSession();
    if (shouldSkipPostLoginSideEffects()) {
      await ensureRecoverySession(supabase);
    } else {
      const portalUser = await resolvePortalUser();
      usePortalStore.getState().setCurrentUser(portalUser);
    }
  } finally {
    usePortalStore.getState().setAuthHydrated(true);
  }

  // Hydrate saved shipping after session restore (SIGNED_IN may not fire on page load).
  const restored = usePortalStore.getState().currentUser;
  if (restored?.role === "customer" && !shouldSkipPostLoginSideEffects()) {
    void hydrateCheckoutShipping(restored.id);
  }

  supabase.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_OUT") {
      usePortalStore.getState().setCurrentUser(null);
      clearLocalShipping();
      return;
    }

    if (event === "PASSWORD_RECOVERY") {
      markPasswordRecoveryIntent();
      // Keep recovery session for updateUser(password); do not treat as a normal login.
      return;
    }

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      if (shouldSkipPostLoginSideEffects()) {
        // Recovery session may emit SIGNED_IN — stay on reset page, no push link.
        return;
      }
      const user = await resolvePortalUser();
      usePortalStore.getState().setCurrentUser(user);
      if (event === "SIGNED_IN" && user) {
        void linkPushSubscriptionToUser();
        if (user.role === "customer") void hydrateCheckoutShipping(user.id);
      }
    }
  });
}

function redirectAuthCallback(): void {
  if (typeof window === "undefined") return;
  const { pathname, hash, search } = window.location;
  const kind = classifyAuthCallback({ pathname, hash, search });
  if (kind === "signup_confirm") {
    markEmailConfirmHandoffTab();
  }
  if (kind === "recovery") {
    stashRecoveryTokensFromUrl();
    markPasswordRecoveryIntent();
  }
  const target = authCallbackRedirectPath({ pathname, hash, search });
  if (!target) return;
  window.location.replace(target);
}
