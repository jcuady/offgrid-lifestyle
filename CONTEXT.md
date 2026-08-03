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
| **Official quote** | Admin-set binding `officialTotal` / `officialDeposit` on a custom order; unlocks customer pay. Customer-facing name: **Invoice**. Wizard estimate is non-binding. |
| **Invoice** | Customer-facing name for the Official quote after admin review. |
| **Under review** | Custom order after submit; typically 1–3 business days before Invoice. Status `under_review`. |
| **Revision requested** | Customer or admin flagged design/spec changes (`revision_requested`) until shipped. |
| **Cancel window** | Customer may cancel only while unpaid and status is draft / under_review / pending_deposit / revision_requested. |
| **Awaiting quote** | Deprecated label — prefer Under review / Awaiting invoice. |
| **Pending deposit** | Custom order has an Invoice and still needs deposit (or retail “Order placed” alias for `pending_deposit`). Customer label: Invoice ready. |
| **Admin override** | Admin may set any fulfillment/payment status and skip the customer quote → pay pipeline for ops corrections. |
| **Custom payload write** | Explicit merge-patch of durable custom-order keys into `custom_payload` (no ManagedCustomOrder dump). |
| **Quote internal notes** | Staff/admin-only text on the quote; stored in `og_order_quote_internal_notes` (RLS), never in customer-readable `custom_payload`. |
| **Guest order claim** | `og_claim_my_guest_orders` attaches null-`customer_id` orders to the signed-in customer when emails match. |
| **Admin payment override** | Admin may set any payment/fulfillment status via `og_admin_override_order_payment` (manual ledger row). |
| **Towel order kit** | Towel custom orders skip the roster sheet; customer notes piece count; print method locked to sublimation. |
| **Bath towel** | Default towel type `towel-bath` alongside face and hand towels. |
