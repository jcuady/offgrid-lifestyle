/** Shared password-reset URL helpers (customer + portal use the same reset page). */

export type PasswordResetAudience = "customer" | "portal";

export function passwordResetRedirectUrl(
  origin: string,
  audience: PasswordResetAudience = "customer",
): string {
  const base = `${origin.replace(/\/$/, "")}/account/reset-password`;
  return audience === "portal" ? `${base}?portal=1` : base;
}

export function hasPasswordRecoveryUrlHint(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  const search = new URLSearchParams(window.location.search);
  return hash.includes("type=recovery") || hash.includes("access_token=") || search.has("code");
}

export function isPortalPasswordReset(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("portal") === "1";
}
