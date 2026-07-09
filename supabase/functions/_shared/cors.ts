export function corsHeadersFor(req: Request): Record<string, string> {
  const defaults =
    "https://www.oglifestyleph.com,https://oglifestyleph.com,https://offgrid-lifestyle.vercel.app,https://offgrid-lifestyle-jcuadys-projects.vercel.app,http://localhost:3000,http://127.0.0.1:3000";
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? defaults)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = allowed.includes(origin) ? origin : (allowed[0] ?? "*");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    Vary: "Origin",
  };
}
