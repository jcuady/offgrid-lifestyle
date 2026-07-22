/**
 * Shared PayMongo helpers for Edge Functions.
 * Secret key: Deno.env PAYMONGO_SECRET_KEY, else vault secret `paymongo_secret_key`.
 * Webhook secret: Deno.env PAYMONGO_WEBHOOK_SECRET, else vault `paymongo_webhook_secret`.
 */

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const PAYMONGO_API_V1 = "https://api.paymongo.com/v1";
export const PAYMONGO_API_V2 = "https://api.paymongo.com/v2";

export type PaymentKind = "full" | "deposit" | "balance";

export function paymongoAuthHeader(secretKey: string): string {
  const token = `${secretKey.trim()}:`;
  // Edge runtimes: prefer std encoding over btoa for predictable ASCII Base64.
  const bytes = new TextEncoder().encode(token);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return `Basic ${btoa(bin)}`;
}

export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function readVaultSecret(admin: SupabaseClient, name: string): Promise<string | null> {
  const { data, error } = await admin.rpc("og_read_vault_secret", { secret_name: name });
  if (error) {
    console.error("og_read_vault_secret", name, error.message);
    return null;
  }
  if (typeof data === "string" && data.trim().length > 0) return data.trim();
  return null;
}

export async function resolvePayMongoSecretKey(admin: SupabaseClient): Promise<string> {
  const fromEnv = Deno.env.get("PAYMONGO_SECRET_KEY")?.trim();
  if (fromEnv) {
    if (!fromEnv.startsWith("sk_")) {
      throw new Error("PAYMONGO_SECRET_KEY must be a secret key (sk_test_/sk_live_).");
    }
    return fromEnv;
  }
  const fromVault = await readVaultSecret(admin, "paymongo_secret_key");
  if (fromVault) {
    if (!fromVault.startsWith("sk_")) {
      throw new Error("Vault paymongo_secret_key is not a valid secret key format.");
    }
    return fromVault;
  }
  throw new Error("PayMongo secret key is not configured.");
}

export async function resolvePayMongoWebhookSecret(admin: SupabaseClient): Promise<string | null> {
  const fromEnv = Deno.env.get("PAYMONGO_WEBHOOK_SECRET")?.trim();
  if (fromEnv) return fromEnv;
  return await readVaultSecret(admin, "paymongo_webhook_secret");
}

export function siteBaseUrl(req?: Request): string {
  const fromEnv = Deno.env.get("SITE_URL")?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const origin = req?.headers.get("Origin")?.trim();
  if (origin && /^https?:\/\//i.test(origin)) return origin.replace(/\/$/, "");
  return "https://www.oglifestyleph.com";
}

export function jsonResponse(
  body: unknown,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export function paymongoErrorMessage(payload: unknown): string {
  const errors = (payload as { errors?: Array<{ detail?: string; code?: string }> })?.errors;
  if (Array.isArray(errors) && errors[0]?.detail) return errors[0].detail;
  return "PayMongo request failed.";
}

export async function paymongoFetch(
  url: string,
  secretKey: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", paymongoAuthHeader(secretKey));
  headers.set("Content-Type", "application/json");
  if (init.idempotencyKey) headers.set("Idempotency-Key", init.idempotencyKey);

  const res = await fetch(url, { ...init, headers });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
}

/** Timing-safe hex compare. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/**
 * Verify Paymongo-Signature: HMAC-SHA256(secret, `${t}.${rawBody}`) vs te (test) or li (live).
 */
export async function verifyPaymongoSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, ...rest] = p.trim().split("=");
      return [k, rest.join("=")];
    }),
  ) as Record<string, string>;

  const t = parts.t;
  if (!t) return false;
  const candidate = parts.te || parts.li;
  if (!candidate) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqualHex(hex, candidate);
}

export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}

export function isPaidStatus(status: string): boolean {
  return status === "fully_paid" || status === "deposit_paid";
}
