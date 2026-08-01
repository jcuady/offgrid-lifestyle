import fs from "node:fs";

const env = fs.readFileSync(fs.existsSync(".env.local") ? ".env.local" : ".env", "utf8");
const url = env.match(/^VITE_SUPABASE_URL=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, "").trim();
const key = env.match(/^VITE_SUPABASE_ANON_KEY=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, "").trim();
if (!url || !key) throw new Error("missing env");

const productId = process.argv[2] || "og-arcade";
const price = Number(process.argv[3] || 1100);

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  // Match checkout client: insert without RETURNING (anon has INSERT, not SELECT of new row).
  Prefer: "return=minimal",
};

const payload = {
  id: `OG-TEST-${Date.now()}`,
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
      quantity: 1,
      size: "M",
      color: "Field Black",
      priceSnapshot: { amount: price, currency: "PHP" },
    },
  ],
  subtotal_centavos: Math.round(price * 100),
  shipping_centavos: 15000,
  tax_centavos: 0,
  total_centavos: Math.round(price * 100) + 15000,
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

const r = await fetch(`${url}/rest/v1/og_orders`, {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
});
const body = await r.text();
console.log("http", r.status);
console.log(body.slice(0, 2000));
if (r.status === 201 && payload.id.startsWith("OG-TEST-")) {
  // leave cleanup to caller with service token; print id for delete
  console.log("created", payload.id);
}
