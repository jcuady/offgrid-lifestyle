# Auth / session domain terms

| Term | Meaning |
|---|---|
| **Auth session bootstrap** | Single module that owns URL callback consume (`detectSessionInUrl`), recovery stash, portal user hydrate, and one `onAuthStateChange` listener. |
| **Recovery intent** | `sessionStorage` flag (`og-pw-recovery`) marking an in-progress password reset; gates push/shipping side effects. |
| **Recovery token stash** | Snapshot of hash tokens before GoTrue clears the URL; used by `ensureRecoverySession` / `setSession`. |
| **Post-login side effects** | Push subscription link + customer shipping hydrate; run once per new portal identity, never during recovery. |
| **Auth callback kind** | `recovery` \| `signup_confirm` \| `session` \| `none` — from `classifyAuthCallback`. |
| **Portal user** | Row in `og_portal_users` (not `auth.users`); roles: customer, staff, admin. |
| **Must-ship** | Launch-blocking production readiness items in `PRODUCTION_READINESS.md` (money integrity, auth, legal, SW). |
| **Order payment integrity** | DB triggers + PayMongo edge settle that keep customers from inventing paid state or rewriting staff quotes. |
| **Official quote** | Admin-set binding `officialTotal` / `officialDeposit` on a custom order; unlocks customer pay. Wizard estimate is non-binding. |
| **Awaiting quote** | Custom fulfillment still `pending_deposit` but no official quote yet — customer label, not “Pending deposit”. |
| **Pending deposit** | Custom order has an official quote and still needs deposit (or retail “Order placed” alias for `pending_deposit`). |
| **Admin override** | Admin may set any fulfillment/payment status and skip the customer quote → pay pipeline for ops corrections. |
| **Custom payload write** | Explicit merge-patch of durable custom-order keys into `custom_payload` (no ManagedCustomOrder dump). |
| **Quote internal notes** | Staff/admin-only text on the quote; stripped from customer-mapped orders. |
| **Towel order kit** | Towel custom orders skip the roster sheet; customer notes piece count; print method locked to sublimation. |
| **Bath towel** | Default towel type `towel-bath` alongside face and hand towels. |
