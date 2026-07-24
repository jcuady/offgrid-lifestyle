/**
 * Authorize PayMongo edge calls for an order.
 * Staff/service always pass. Owners pass (portal id OR matching email).
 * Guests must claim matching email within window.
 */
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  decideOrderPaymentAccess,
  type OrderPaymentAccessDecision,
} from "./orderPaymentAccessDecision.ts";

export type OrderAccessRow = {
  id: string;
  customer_id: string | null;
  customer_email: string | null;
  created_at: string;
};

export type { OrderPaymentAccessDecision };
export { decideOrderPaymentAccess } from "./orderPaymentAccessDecision.ts";

export async function assertOrderPaymentAccess(input: {
  req: Request;
  admin: SupabaseClient;
  order: OrderAccessRow;
  claimEmail?: string;
}): Promise<OrderPaymentAccessDecision> {
  const authHeader = input.req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  // Exact key only — never trust unsigned JWT role claims.
  if (token && serviceKey && token === serviceKey) {
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
  const role = (user?.app_metadata?.portal_role as string | undefined) ?? null;

  // og_orders.customer_id = og_portal_users.id (not auth.users.id)
  let portalUserId: string | null = null;
  if (user?.id) {
    const { data: portal } = await input.admin
      .from("og_portal_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    portalUserId = typeof portal?.id === "string" ? portal.id : null;
  }

  const orderAgeMs = Date.now() - new Date(input.order.created_at).getTime();

  return decideOrderPaymentAccess({
    portalRole: role,
    authUserId: user?.id ?? null,
    authEmail: user?.email ?? null,
    portalUserId,
    orderCustomerId: input.order.customer_id,
    orderEmail: input.order.customer_email,
    claimEmail: input.claimEmail,
    orderAgeMs,
  });
}
