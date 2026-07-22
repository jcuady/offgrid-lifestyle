/** Shared password-reset URL helpers (customer + portal use the same reset page). */

import { isPasswordRecoveryCallback } from "@/src/lib/authCallbackRouting";

export type PasswordResetAudience = "customer" | "portal";

export function passwordResetRedirectUrl(
  origin: string,
  audience: PasswordResetAudience = "customer",
): string {
  const base = `${origin.replace(/\/$/, "")}/account/reset-password`;
  return audience === "portal" ? `${base}?portal=1` : base;
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

export function isPortalPasswordReset(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("portal") === "1";
}
