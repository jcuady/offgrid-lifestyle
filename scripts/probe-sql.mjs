import fs from "node:fs";

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error("SUPABASE_ACCESS_TOKEN required");
const query = process.argv[2] ?? fs.readFileSync(0, "utf8");
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
console.log("status", r.status);
console.log(text);
process.exit(r.ok ? 0 : 1);
