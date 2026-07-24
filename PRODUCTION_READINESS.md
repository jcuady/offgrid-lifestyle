# Production readiness — OFFGRID Lifestyle

Living checklist for a public commerce + custom-order SPA on Vite / Vercel / Supabase / PayMongo / Resend.

**API style:** PostgREST + Edge Functions (RPC). GraphQL is not used; treat RLS + edge auth as the API gate.

**Launch bar (this doc):** All **Must-ship** items ✅ before calling the store public. **Should-ship** can land in the first week. **Later** is post-launch.

Last audited: 2026-07-24 · Commit hardening wave: launch P0 security + UX shell.

---

## System map

| Surface | Stack | Owner modules |
|--------|--------|----------------|
| Storefront / account / portal | React SPA | `src/pages`, `src/components` |
| Auth session | Supabase GoTrue | `authSessionBootstrap`, `authSessionPolicy` |
| Data + RLS | Postgres | `supabase/migrations` |
| Payments | PayMongo QR Ph | `create-paymongo-checkout`, `paymongo-webhook`, `paymongo-payment-status` |
| Email | Resend | `send-order-email`, `send-auth-email`, `submit-contact` |
| Push | Web Push + VAPID | `send-push`, `og_upsert_my_push_subscription` |
| Hosting | Vercel | `vercel.json`, PWA `src/sw.ts` |

---

## Must-ship (public launch)

| # | Item | Status | Notes |
|---|------|--------|-------|
| M1 | Client uses anon key only (no service role in Vite) | ✅ | `src/lib/supabase.ts` |
| M2 | RLS on all `og_*` business tables | ✅ | Live project |
| M3 | Customers cannot UPDATE `payment_status` / money columns | ✅ | Restrict trigger |
| M4 | Customers cannot forge paid INSERT | ✅ | `og_force_safe_order_insert_defaults` |
| M5 | Customers cannot rewrite `officialTotal` / `officialDeposit` | ✅ | Payload lock in restrict trigger |
| M6 | Edge `service_role` = exact key only (no forged JWT role) | ✅ | `serviceRoleAuth`, orderAccess, send-order-email |
| M7 | PayMongo webhook fail-closed without secret | ✅ | `paymongo-webhook` |
| M8 | PayMongo amount match fail-closed if amount missing | ✅ | `amountsMatchCentavos` |
| M9 | Auth session bootstrap (recovery / signup / login) | ✅ | `authSessionBootstrap` |
| M10 | React error boundary (no white-screen) | ✅ | `AppErrorBoundary` |
| M11 | Legal terms + privacy live + linked | ✅ | `/legal/*` |
| M12 | SW does not cache Supabase API | ✅ | Removed NetworkFirst route |
| M13 | Retail stock enforced when `stock` set | ✅ | Decrement in validate insert |
| M14 | Secrets documented; no secrets in `.env.example` | ✅ | Ops must set vault/edge secrets |
| M15 | Production deploy of edge auth + webhook + migration | ✅ | Migration applied; edge v12 webhook, v19 push, etc. |

---

## Should-ship (week 1)

| # | Item | Status | Notes |
|---|------|--------|-------|
| S1 | Sitemap matches live routes (`/collections`, `/community`, `/faq`) | ✅ | `public/sitemap.xml` |
| S2 | `/faq` has real SEO (not “Page Not Found”) | ✅ | `routeSeo.ts` |
| S3 | Enable Supabase leaked-password protection | ⬜ | Auth dashboard toggle |
| S4 | `create-staff` / `manage-user` check DB admin role | ⬜ | Today: JWT `app_metadata` |
| S5 | CORS allowlist (optional; auth still required) | ⬜ | Currently `*` by design for push |
| S6 | Contact form rate limit / Turnstile | ⬜ | Honeypot only |
| S7 | Security headers on Vercel (CSP, HSTS, etc.) | ⬜ | `vercel.json` |
| S8 | Client error monitoring (Sentry or similar) | ⬜ | Logger only |
| S9 | Checkout dialog a11y (focus trap, Escape) | ⬜ | |
| S10 | E2E: retail checkout + PayMongo return smoke | ⬜ | Unit coverage exists |
| S11 | Align legal contact email with live domain | ⬜ | `hello@offgridlifestyle.ph` vs site |
| S12 | Admin Settings copy (“PayMongo coming soon”) | ✅ | Fixed |
| S13 | Gitignore deploy-args / MCP scratch | ✅ | `.gitignore` |
| S14 | REVOKE EXECUTE on trigger helpers from anon | ✅ | In launch migration |

---

## Later / nice-to-have

| # | Item | Notes |
|---|------|-------|
| L1 | Guest payment access → signed short-lived token | Reduces email+orderId guessing |
| L2 | Drop or token-bind anon UPDATE of guest custom orders | |
| L3 | Product URLs in sitemap | Dynamic |
| L4 | Feature flags | Env gates today |
| L5 | Immutable audit writer (SECURITY DEFINER only) | |
| L6 | README ops runbook | Expand from this file |

---

## Standard production checklist (template for systems like this)

Use this for any similar storefront + portal + payments stack:

### Trust & auth
- [ ] Single session bootstrap owns URL callbacks
- [ ] Password recovery never `signOut` during URL consume
- [ ] Role from DB (or verified JWT), not forgeable claims
- [ ] Leaked-password / MFA policy decided
- [ ] Route guards wait for auth hydrate

### Data plane
- [ ] RLS on every tenant/business table
- [ ] Money and fulfillment columns staff/service only
- [ ] Insert defaults cannot invent “paid”
- [ ] Stock / inventory consistency if displayed
- [ ] Advisors reviewed (security + performance)

### Payments
- [ ] Webhook signature required (fail closed)
- [ ] Amounts matched to ledger
- [ ] Idempotent webhook event store
- [ ] Secrets in vault / edge env, never Vite

### Edge / API
- [ ] Service role = shared secret equality (or verified JWT)
- [ ] CORS decision documented
- [ ] Public forms rate-limited
- [ ] No GraphQL/PostgREST privilege leaks to anon

### Client UX
- [ ] Error boundary
- [ ] Legal pages
- [ ] SEO for public routes + sitemap honesty
- [ ] PWA does not cache auth/API
- [ ] Mobile checkout usable (44px, no zoom traps)

### Ops
- [ ] Monitoring / alerts on payment + auth errors
- [ ] Backups / PITR on Postgres
- [ ] Runbook for rotate PayMongo webhook + Resend
- [ ] Staging smoke: signup, reset, retail pay, custom quote pay

---

## Ops actions before flipping “public”

1. Apply migration `20260724180000_launch_order_payment_hardening`.
2. Redeploy edge functions: `paymongo-webhook`, `send-push`, `send-order-email`, `create-paymongo-checkout`, `paymongo-payment-status` (shared auth helpers).
3. Confirm vault has `paymongo_webhook_secret` and `paymongo_secret_key`.
4. Enable Auth → leaked password protection in Supabase.
5. Hard-refresh / update SW on a real device after deploy.
6. Smoke: forgot-password, signup confirm, retail cart → PayMongo, staff quote → customer deposit.

---

## Architecture deepening (already done / next)

| Candidate | Strength | Status |
|-----------|----------|--------|
| Auth session bootstrap | Strong | Done |
| Order payment integrity (DB triggers + edge settle) | Strong | This wave |
| Collapse login vs SIGNED_IN side effects | Worth exploring | Partially done (identity gate) |
| Guest payment token module | Worth exploring | Open |
| Manual PKCE (`detectSessionInUrl: false`) | Speculative | Defer |
