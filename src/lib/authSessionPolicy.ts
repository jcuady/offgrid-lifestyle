/**
 * Pure auth-session policy — the testable seam for bootstrap + event routing.
 * No Supabase, no DOM, no Zustand. Callers apply the plan.
 */

import type { AuthCallbackKind } from "@/src/lib/authCallbackRouting";
import {
  authCallbackRedirectPath,
  classifyAuthCallback,
} from "@/src/lib/authCallbackRouting";

export type AuthLocation = {
  pathname: string;
  hash: string;
  search: string;
};

export type AuthBootstrapPlan = {
  kind: AuthCallbackKind;
  /** Snapshot recovery hash tokens before detectSessionInUrl clears them. */
  stashRecoveryTokens: boolean;
  /** Mark sessionStorage recovery intent. */
  markRecoveryIntent: boolean;
  /** Clear Zustand portal chrome only — NEVER call signOut during URL consume. */
  clearPortalChromeOnly: boolean;
  /** Absolute invariant: signOut during URL session consume is forbidden. */
  allowSignOut: false;
  /** Mark cross-tab signup confirm handoff. */
  markSignupHandoff: boolean;
  /** Full navigation target, or null to stay. */
  redirectTo: string | null;
  /** After getSession: repair recovery via setSession stash, else resolve portal user. */
  mode: "recovery" | "session" | "none";
};

export type AuthEventName =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "PASSWORD_RECOVERY"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | string;

export type AuthEventPlan = {
  markRecoveryIntent: boolean;
  clearUserAndShipping: boolean;
  resolvePortalUser: boolean;
  /** Push link + shipping hydrate — only when a new identity lands. */
  runPostLoginSideEffects: boolean;
};

/**
 * Plan the URL bootstrap phase. Recovery never signs out — that races
 * detectSessionInUrl and wipes the session after the hash is empty.
 */
export function planAuthBootstrap(location: AuthLocation): AuthBootstrapPlan {
  const kind = classifyAuthCallback(location);
  const redirectTo = authCallbackRedirectPath(location);
  const isRecovery = kind === "recovery";

  return {
    kind,
    // Always attempt stash — helper no-ops unless recovery tokens are present.
    stashRecoveryTokens: true,
    markRecoveryIntent: isRecovery,
    clearPortalChromeOnly: isRecovery,
    allowSignOut: false,
    markSignupHandoff: kind === "signup_confirm",
    redirectTo,
    // Persisted sessions and signup confirms both resolve a portal user.
    mode: isRecovery ? "recovery" : "session",
  };
}

/** Absolute regression guard — used by tests and bootstrap. */
export function maySignOutDuringUrlSessionConsume(): false {
  return false;
}

/**
 * Plan a GoTrue auth event. Side effects run only on SIGNED_IN when not in
 * recovery and the portal identity is new (dedupes login + verifyPassword).
 */
export function planAuthEvent(
  event: AuthEventName,
  ctx: {
    recoveryActive: boolean;
    /** Prior portal user id already in store, if any. */
    previousPortalUserId: string | null;
    /** Newly resolved portal user id, if any. */
    nextPortalUserId: string | null;
  },
): AuthEventPlan {
  if (event === "SIGNED_OUT") {
    return {
      markRecoveryIntent: false,
      clearUserAndShipping: true,
      resolvePortalUser: false,
      runPostLoginSideEffects: false,
    };
  }

  if (event === "PASSWORD_RECOVERY") {
    return {
      markRecoveryIntent: true,
      clearUserAndShipping: false,
      resolvePortalUser: false,
      runPostLoginSideEffects: false,
    };
  }

  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
    if (ctx.recoveryActive) {
      return {
        markRecoveryIntent: false,
        clearUserAndShipping: false,
        resolvePortalUser: false,
        runPostLoginSideEffects: false,
      };
    }

    const identityChanged =
      Boolean(ctx.nextPortalUserId) && ctx.nextPortalUserId !== ctx.previousPortalUserId;

    return {
      markRecoveryIntent: false,
      clearUserAndShipping: false,
      resolvePortalUser: true,
      runPostLoginSideEffects: event === "SIGNED_IN" && identityChanged,
    };
  }

  return {
    markRecoveryIntent: false,
    clearUserAndShipping: false,
    resolvePortalUser: false,
    runPostLoginSideEffects: false,
  };
}

/** Whether portal index redirect may navigate before hydrate finishes. */
export function mayRedirectBeforeAuthHydrated(authHydrated: boolean): boolean {
  return authHydrated;
}
