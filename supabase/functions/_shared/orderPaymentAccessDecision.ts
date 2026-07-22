/**
 * Pure PayMongo order-access decision (no Deno/Supabase deps).
 * Keep in sync with src/lib/orderPaymentAccess.ts — Edge cannot import from src/.
 */

export const GUEST_ORDER_ACCESS_WINDOW_MS = 24 * 60 * 60 * 1000;

export type OrderPaymentAccessDecision =
  | { ok: true }
  | { ok: false; status: number; error: string };

function normalizeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function decideOrderPaymentAccess(input: {
  isServiceRole?: boolean;
  portalRole?: string | null;
  authUserId?: string | null;
  authEmail?: string | null;
  /** og_portal_users.id for the signed-in auth user */
  portalUserId?: string | null;
  orderCustomerId: string | null;
  orderEmail: string | null;
  claimEmail?: string | null;
  orderAgeMs: number;
}): OrderPaymentAccessDecision {
  if (input.isServiceRole) return { ok: true };

  const role = input.portalRole ?? null;
  if (role === "admin" || role === "staff") return { ok: true };

  const orderEmail = normalizeEmail(input.orderEmail);
  const authEmail = normalizeEmail(input.authEmail);
  const claim = normalizeEmail(input.claimEmail);

  if (input.portalUserId && input.orderCustomerId && input.portalUserId === input.orderCustomerId) {
    return { ok: true };
  }

  if (input.authUserId && orderEmail && authEmail && authEmail === orderEmail) {
    return { ok: true };
  }

  if (!input.orderCustomerId && orderEmail && claim && claim === orderEmail) {
    if (input.orderAgeMs >= 0 && input.orderAgeMs <= GUEST_ORDER_ACCESS_WINDOW_MS) return { ok: true };
    return { ok: false, status: 403, error: "Guest checkout window expired. Sign in to continue." };
  }

  if (input.authUserId) {
    return { ok: false, status: 403, error: "You do not have access to this order." };
  }

  return {
    ok: false,
    status: 403,
    error: "Sign in or confirm the order email to continue payment.",
  };
}
