/** Shared Auth UX messages — keep copy consistent across customer + portal. */

export const AUTH_ACCOUNT_EXISTS =
  "An account with this email already exists. Please sign in instead.";

/**
 * Supabase anti-enumeration: signUp for an existing email often returns 200 with
 * a user object whose `identities` array is empty (no new identity was created).
 * That is NOT "needs email confirmation" — treat it as a duplicate account.
 */
export function isDuplicateSignUpUser(
  user: { identities?: unknown[] | null } | null | undefined,
): boolean {
  return Array.isArray(user?.identities) && user.identities.length === 0;
}

/** New signup that still needs the confirmation email (confirmations enabled, no session). */
export function isEmailConfirmationPending(params: {
  user: { identities?: unknown[] | null } | null | undefined;
  session: unknown;
}): boolean {
  if (!params.user || params.session) return false;
  if (isDuplicateSignUpUser(params.user)) return false;
  return true;
}

export function mapSignInErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("email not confirmed")) {
    return "Please confirm your email first. Check your inbox for the confirmation link we sent when you signed up.";
  }
  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid credentials") ||
    m.includes("invalid email or password")
  ) {
    return "Incorrect email or password. Check your details, or use Forgot password if you need a reset.";
  }
  if (m.includes("too many") || m.includes("rate limit")) {
    return "Too many sign-in attempts. Wait a few minutes and try again.";
  }
  if (m.includes("banned")) {
    return "This account has been suspended. Contact support if you need help.";
  }
  // ponytail: generic fallback — never echo raw provider strings that leak internals
  return "Unable to sign in. Check your email and password, then try again.";
}

export function mapSignUpErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (
    m.includes("already registered") ||
    m.includes("already exists") ||
    m.includes("user already") ||
    m.includes("email address is already")
  ) {
    return AUTH_ACCOUNT_EXISTS;
  }
  if (m.includes("password") && (m.includes("weak") || m.includes("least") || m.includes("characters"))) {
    return "Choose a stronger password (at least 8 characters).";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Wait a few minutes and try again.";
  }
  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "Enter a valid email address.";
  }
  const trimmed = raw.trim();
  return trimmed || "Unable to create account. Please try again.";
}

/** Map GoTrue errors from change-email / change-password (never leak internals). */
export function mapCredentialUpdateErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("same password") || (m.includes("different") && m.includes("password"))) {
    return "New password must be different from your current password.";
  }
  if (
    m.includes("already been registered") ||
    m.includes("already registered") ||
    m.includes("email address has already") ||
    m.includes("duplicate")
  ) {
    return "That email is already in use. Try a different address.";
  }
  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "Enter a valid email address.";
  }
  if (m.includes("password") && (m.includes("weak") || m.includes("least") || m.includes("characters"))) {
    return "Choose a stronger password (at least 8 characters).";
  }
  if (m.includes("reauth") || m.includes("reauthentication") || m.includes("session is not recent")) {
    return "For security, enter your current password again and retry.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Wait a few minutes and try again.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  const trimmed = raw.trim();
  return trimmed || "Unable to update account. Please try again.";
}
