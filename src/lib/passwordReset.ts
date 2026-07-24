/** Shared password-reset URL helpers (customer + portal use the same reset page). */

import {
  classifyAuthCallback,
  isPasswordRecoveryCallback,
} from "@/src/lib/authCallbackRouting";

export type PasswordResetAudience = "customer" | "portal";

const RECOVERY_INTENT_KEY = "og-pw-recovery";

export function passwordResetRedirectUrl(
  origin: string,
  audience: PasswordResetAudience = "customer",
): string {
  const base = `${origin.replace(/\/$/, "")}/account/reset-password`;
  return audience === "portal" ? `${base}?portal=1` : base;
}

/** Persist recovery intent before Supabase strips hash/?code= from the URL. */
export function markPasswordRecoveryIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RECOVERY_INTENT_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function hasPasswordRecoveryIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(RECOVERY_INTENT_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearPasswordRecoveryIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RECOVERY_INTENT_KEY);
  } catch {
    // ignore
  }
}

/** @deprecated use isPasswordRecoveryUrlHint — kept name for existing imports */
export function hasPasswordRecoveryUrlHint(): boolean {
  return isPasswordRecoveryUrlHint();
}

/** True only for password-recovery callbacks (not signup email confirm). */
export function isPasswordRecoveryUrlHint(): boolean {
  if (typeof window === "undefined") return false;
  return isPasswordRecoveryCallback({
    pathname: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search,
  });
}

/** URL hint or sticky sessionStorage flag after tokens were consumed. */
export function canContinuePasswordRecovery(): boolean {
  return isPasswordRecoveryUrlHint() || hasPasswordRecoveryIntent();
}

/**
 * Existing signed-in tabs must drop the local session before recovery tokens
 * are consumed — otherwise getSession() keeps the old session and the reset UI is skipped.
 */
export function mustClearSessionBeforeRecovery(input: {
  pathname: string;
  hash: string;
  search: string;
}): boolean {
  return classifyAuthCallback(input) === "recovery";
}

/** Skip push-link / shipping hydrate while completing a password reset. */
export function shouldSkipPostLoginSideEffects(): boolean {
  return hasPasswordRecoveryIntent() || isPasswordRecoveryUrlHint();
}

export function isPortalPasswordReset(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("portal") === "1";
}
