import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

async function countRecent(admin: SupabaseClient, bucketKey: string): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await admin
    .from("og_contact_rate_log")
    .select("id", { count: "exact", head: true })
    .eq("bucket_key", bucketKey)
    .gte("created_at", since);

  if (error) throw error;
  return count ?? 0;
}

export async function assertContactRateLimit(input: {
  admin: SupabaseClient;
  req: Request;
  email: string;
}): Promise<{ ok: true } | { ok: false; status: 429; error: string }> {
  const ipHash = await sha256Hex(clientIp(input.req));
  const emailKey = `email:${input.email.trim().toLowerCase()}`;
  const ipKey = `ip:${ipHash}`;

  const [ipHits, emailHits] = await Promise.all([
    countRecent(input.admin, ipKey),
    countRecent(input.admin, emailKey),
  ]);

  if (ipHits >= MAX_PER_IP || emailHits >= MAX_PER_EMAIL) {
    return { ok: false, status: 429, error: "Too many contact requests. Try again later." };
  }

  const { error } = await input.admin.from("og_contact_rate_log").insert([
    { bucket_key: ipKey },
    { bucket_key: emailKey },
  ]);

  if (error) throw error;
  return { ok: true };
}
