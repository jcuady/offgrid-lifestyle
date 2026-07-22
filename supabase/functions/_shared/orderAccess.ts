/**
 * Authorize PayMongo edge calls for an order.
 * Staff/service always pass. Owners pass. Guests must claim matching email within window.
 */
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const GUEST_ACCESS_WINDOW_MS = 24 * 60 * 60 * 1000;

export type OrderAccessRow = {
  id: string;
  customer_id: string | null;
  customer_email: string | null;
  created_at: string;
};

function normalizeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function getJwtRole(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function assertOrderPaymentAccess(input: {
  req: Request;
  admin: SupabaseClient;
  order: OrderAccessRow;
  claimEmail?: string;
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const authHeader = input.req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (token && (token === serviceKey || getJwtRole(token) === "service_role")) {
    return { ok: true };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return { ok: false, status: 500, error: "Server misconfigured." };
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData } = await userClient.auth.getUser(token);
  const user = authData.user;
  const role = user?.app_metadata?.portal_role as string | undefined;

  if (role === "admin" || role === "staff") return { ok: true };
  if (user?.id && input.order.customer_id && user.id === input.order.customer_id) {
    return { ok: true };
  }

  // Guest checkout / return pages: email claim + fresh order.
  const orderEmail = normalizeEmail(input.order.customer_email);
  const claim = normalizeEmail(input.claimEmail);
  if (!input.order.customer_id && orderEmail && claim && claim === orderEmail) {
    const ageMs = Date.now() - new Date(input.order.created_at).getTime();
    if (ageMs >= 0 && ageMs <= GUEST_ACCESS_WINDOW_MS) return { ok: true };
    return { ok: false, status: 403, error: "Guest checkout window expired. Sign in to continue." };
  }

  if (user?.id) {
    return { ok: false, status: 403, error: "You do not have access to this order." };
  }

  return {
    ok: false,
    status: 403,
    error: "Sign in or confirm the order email to continue payment.",
  };
}
