/**
 * Live evidence: tracked stock decrements on retail insert and restores on cancel.
 * Requires SUPABASE_ACCESS_TOKEN (Management API) + .env anon key.
 */
import fs from "node:fs";

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error("SUPABASE_ACCESS_TOKEN required");

const env = fs.readFileSync(fs.existsSync(".env.local") ? ".env.local" : ".env", "utf8");
const url = env.match(/^VITE_SUPABASE_URL=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, "").trim();
const key = env.match(/^VITE_SUPABASE_ANON_KEY=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, "").trim();
if (!url || !key) throw new Error("missing env");

async function sql(query) {
  const r = await fetch(
    "https://api.supabase.com/v1/projects/sswzfwfpnyhnvstabteo/database/query",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  const text = await r.text();
  if (!r.ok) throw new Error(`sql ${r.status}: ${text}`);
  return text ? JSON.parse(text) : [];
}

const productId = "og-arcade";
const orderId = `OG-TEST-STOCK-${Date.now()}`;

await sql(`update public.og_products set stock = 5 where id = '${productId}'`);
const before = await sql(`select stock from public.og_products where id = '${productId}'`);
console.log("stock_before", before[0]?.stock);

const payload = {
  id: orderId,
  order_type: "retail",
  status: "pending_deposit",
  payment_status: "unpaid",
  payment_method: "gcash",
  customer_name: "Probe",
  customer_email: "probe@example.com",
  line_items: [
    {
      productId,
      name: productId,
      quantity: 2,
      priceSnapshot: { amount: 1100, currency: "PHP" },
    },
  ],
  subtotal_centavos: 220000,
  shipping_centavos: 0,
  tax_centavos: 0,
  total_centavos: 220000,
  shipping_info: {
    fullName: "Probe",
    email: "probe@example.com",
    phone: "+639170000000",
    address: "1 Test St",
    barangay: "Ermita",
    city: "Manila",
    province: "Metro Manila",
    region: "NCR",
    zip: "1000",
  },
};

const insert = await fetch(`${url}/rest/v1/og_orders`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  },
  body: JSON.stringify(payload),
});
const insertBody = await insert.text();
console.log("insert_http", insert.status, insertBody.slice(0, 200));
if (insert.status !== 201) process.exit(1);

const afterInsert = await sql(`select stock from public.og_products where id = '${productId}'`);
console.log("stock_after_insert", afterInsert[0]?.stock);

await sql(`update public.og_orders set status = 'cancelled' where id = '${orderId}'`);
const afterCancel = await sql(`select stock from public.og_products where id = '${productId}'`);
console.log("stock_after_cancel", afterCancel[0]?.stock);

await sql(`delete from public.og_orders where id = '${orderId}'`);
await sql(`update public.og_products set stock = null where id = '${productId}'`);

const ok =
  before[0]?.stock === 5 &&
  afterInsert[0]?.stock === 3 &&
  afterCancel[0]?.stock === 5;
console.log(ok ? "STOCK_CANCEL_OK" : "STOCK_CANCEL_FAIL");
process.exit(ok ? 0 : 1);
