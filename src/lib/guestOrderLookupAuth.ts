/** Normalize guest lookup email for comparison (client-side guard before RPC). */
export function normalizeGuestLookupEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** True when submitted email matches the order's stored customer email. */
export function guestOrderLookupAuthorized(
  storedEmail: string | null | undefined,
  submittedEmail: string,
): boolean {
  if (!storedEmail?.trim() || !submittedEmail.trim()) return false;
  return normalizeGuestLookupEmail(storedEmail) === normalizeGuestLookupEmail(submittedEmail);
}
