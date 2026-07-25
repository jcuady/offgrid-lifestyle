/**
 * Decide which inboxes get the email-change confirm link.
 * Keep in sync with supabase/functions/send-auth-email (email_change branch).
 *
 * Secure email change (default): dual tokens → current + new inbox.
 * Secure off: single token → new inbox only (never the old one alone).
 */
export function planEmailChangeSends(input: {
  currentEmail: string;
  newEmail?: string | null;
  tokenHash: string;
  token?: string;
  tokenHashNew?: string;
  tokenNew?: string;
}): Array<{ to: string; tokenHash: string; otp?: string }> {
  const current = input.currentEmail.trim();
  const next = input.newEmail?.trim() || "";
  const hasDual = Boolean(input.tokenHashNew?.trim() && input.tokenNew?.trim());

  if (hasDual) {
    const sends: Array<{ to: string; tokenHash: string; otp?: string }> = [
      { to: current, tokenHash: input.tokenHashNew!.trim(), otp: input.token },
    ];
    if (next) {
      sends.push({ to: next, tokenHash: input.tokenHash.trim(), otp: input.tokenNew });
    }
    return sends;
  }

  return [
    {
      to: next || current,
      tokenHash: input.tokenHash.trim(),
      otp: input.token,
    },
  ];
}

/** Where email-change confirmation should land after verify. */
export function emailChangeRedirectPath(role: "customer" | "admin" | "staff" | string): string {
  if (role === "admin") return "/portal/admin/settings";
  if (role === "staff") return "/portal/staff";
  return "/account/profile";
}

export function emailChangeRedirectUrl(origin: string, role: string): string {
  return `${origin.replace(/\/$/, "")}${emailChangeRedirectPath(role)}`;
}
