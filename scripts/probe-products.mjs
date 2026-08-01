import fs from "node:fs";

const envPath = fs.existsSync(".env.local") ? ".env.local" : ".env";
const env = fs.readFileSync(envPath, "utf8");
const url = env.match(/^VITE_SUPABASE_URL=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, "");
const key = env.match(/^VITE_SUPABASE_ANON_KEY=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, "");
if (!url || !key) {
  console.error("missing supabase env");
  process.exit(1);
}

const r = await fetch(
  `${url}/rest/v1/og_products?select=id,slug,name,status,stock,price&order=id`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);
console.log("http", r.status);
const data = await r.json();
if (!Array.isArray(data)) {
  console.log(JSON.stringify(data, null, 2));
  process.exit(1);
}
console.log("count", data.length);
console.log(
  "arcade",
  JSON.stringify(
    data.filter((p) => String(p.id).includes("arcade") || String(p.slug).includes("arcade")),
    null,
    2,
  ),
);
const byStatus = {};
for (const p of data) byStatus[p.status] = (byStatus[p.status] || 0) + 1;
console.log("byStatus", byStatus);
console.log(data.map((p) => `${p.id}\t${p.status}\t${p.price}`).join("\n"));
