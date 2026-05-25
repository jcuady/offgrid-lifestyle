# Off Grid Lifestyle — Client Request & Product Brief (MVP + Roadmap)

**Document owner:** Principal full stack / product engineering  
**Audience:** Client stakeholders, design, and engineering  
**Status:** Living document — MVP scope locked; post-MVP items are sequenced, not committed to dates until approved.

---

## 1. Executive summary

The MVP delivers a **landing-connected storefront and custom-order funnel** with **brand-consistent UI**, **downloadable production templates**, **account-based order visibility** (no separate customer “portal dashboard”), **admin/staff tooling for catalog and operations**, and **deployment readiness** (e.g. Vercel) with SPA routing and production build validation.

Primary goals for MVP:

- **Conversion:** Clear paths from discovery → shop PDP → cart/checkout, and from custom guide → templates → wizard → submit.
- **Trust:** Shipping/returns messaging on PDP, consistent typography/color tokens, and order status visibility for signed-in customers.
- **Operations:** Admin can manage products, events, ordering-guide content, and templates; staff/admin can move orders through statuses with guardrails.
- **Future backend:** Frontend is structured with **service boundaries** so API/database integration is a swap of adapters, not a rewrite of UI.

---

## 2. MVP — in scope (must ship)

### 2.1 Brand & experience

- Visual system aligned to **brandbook** (Off Grid green, cream, lime accents; display + sans hierarchy).
- **Responsive** layouts for shop, custom hub, templates, account pages, and checkout/cart patterns.
- **Header** remains visible and readable on inner routes (shop, account, etc.); primary nav includes customer **My Orders** when authenticated as customer.

### 2.2 Retail commerce

- **Shop listing** with filters/search and **pagination**.
- **Product detail pages (PDP)** at `/shop/:slug` with size/color, quantity, add to cart, and **shipping & returns** block.
- **Cart** and **checkout** flow (shipping → payment selection → confirmation) with order ID generation and persistence of cart where configured.

### 2.3 Custom orders

- **Ordering guide** hub at `/custom` with expandable sections (CMS-driven content from site store).
- **Dedicated routes:** `/custom/order` (wizard), `/custom/templates` (downloads).
- **Custom order wizard** with steps through design, specs, summary; **submit** creates a tracked custom order record.
- **Templates:** canonical OG client assets under `public/templates/og-client/`, optional **admin upload** (IndexedDB for large blobs in-browser MVP), unified **download** behavior.
- **Sizing:** inline sample preview in ordering guide where applicable; PDP link to sizing context on custom hub.

### 2.4 Customer account (landing-connected)

- Routes: **`/account/orders`**, **`/account/profile`**, **`/account/orders/:orderId`** (detail).
- **No** nested `/portal/customer` dashboard; legacy URLs redirect to `/account/*`.
- Order list shows **retail + custom** in one timeline; retail cards show **line image previews** and **View order details** CTA.

### 2.5 Admin & staff

- **Admin:** dashboard, orders board, products CRUD, events CRUD, custom content (sections + template manager), analytics entry as present in app.
- **Staff:** scoped orders/analytics per existing role rules.
- **Validation:** basic guardrails on products (required fields, slug uniqueness), events (required fields + full field set), operations order status transitions with user feedback.

### 2.6 Technical & release

- **TypeScript** clean compile; **production build** passes.
- **Vercel-ready:** `vercel.json` with Vite framework hints, `dist` output, and SPA rewrites for client-side routes.
- **Environment:** document any build-time keys (e.g. optional AI keys) in deployment settings.

---

## 3. MVP — explicit non-goals (honest boundaries)

These are **not** promised in MVP unless separately scoped and estimated:

- **Real payment capture** (GCash/Card/COD are UI/MVP flows; no live PSP integration).
- **Server-side auth**, multi-device template sync for admin uploads (IndexedDB is per-browser).
- **Inventory sync**, tax engine, multi-currency, or full ERP.
- **Email/SMS notifications** and webhooks (can be stubbed or copy-only in UI).
- **SEO server rendering** beyond static Vite output (no SSR/ISR in MVP unless added).

---

## 4. Acceptance criteria (MVP sign-off checklist)

Implementation status (MVP, no DB):  
- [x] All primary routes load on cold open in local/prod build; SPA rewrite config is present in `vercel.json`.  
  - **Pending final deploy check:** hard refresh test on the live Vercel URL after deployment.
- [x] Customer can sign in (demo), see **My Orders** in header, open **order detail** from list, and see line previews for retail orders.
- [x] Guest or customer can complete **checkout** and see order appear for customer when email/id matches rules.
- [x] Custom order submission creates a **custom order** visible in account and operations board.
- [x] Templates download works for **static** and **IDB** assets; admin can add/edit/test/delete templates.
- [x] Admin CRUD paths are implemented for products, events, and custom content without breaking shop/custom pages.
- [x] Lint + production build pass locally (`tsc --noEmit`, `vite build`).

---

## 5. Post-MVP plan (phased, principal-level)

### Phase A — Backend & data (highest leverage)

- **Auth:** real sessions (e.g. Supabase Auth or custom JWT), secure cookies, role claims.
- **Orders API:** persist retail + custom orders; idempotent checkout; customer scoping by `customer_id` + email fallback rules documented in API.
- **Catalog API:** products, variants, media URLs; replace Zustand-as-source-of-truth with **read-through cache** + optimistic updates where safe.
- **Content API:** ordering-guide sections, events, template metadata + **object storage** (S3/R2/Supabase Storage) replacing static + IndexedDB for uploads.
- **Webhooks:** payment provider + fulfillment events; order status driven by server state machine.

### Phase B — Conversion, trust, and content

- **Testimonials / past work** gallery page (referenced in earlier notes) with CMS fields and light moderation workflow.
- **Rich PDP:** variant-level imagery, size guide embed from CMS, structured data (JSON-LD) for products.
- **Performance:** route-based code splitting, image CDN, lazy below-the-fold sections to address large JS bundle warnings.

### Phase C — Payments & logistics (PH market)

- Expand **real** payment methods (GCash, Maya, bank transfer with proof upload), COD rules, and refund/cancellation policies in UI + policy pages.
- **Shipping integrations** (LBC/J&T/etc.) or manual tracking upload with customer-visible timeline component on order detail.

### Phase D — Operations scale

- Production queue, internal notes, SLA dashboards, export CSV for finance.
- Role expansion (e.g. production-only user) and audit log on status changes.

---

## 6. Risks & dependencies

- **Client assets:** final logo lockups, legal copy for shipping/returns, and template filenames must stay stable or redirects/migrations planned.
- **Content accuracy:** sizing numbers and free-shipping thresholds must match real operations or be clearly labeled “sample.”
- **Single-browser admin uploads** (MVP): communicate limitation until cloud storage ships.

---

## 7. Change control

Any request outside Sections **2** and **4** should go through:

1. Short impact note (UX, data, security, timeline).  
2. Approval on priority vs Phase A–D.  
3. Ticket with acceptance criteria and rollback plan.

---

## 8. Original intent (preserved from stakeholder notes)

The following themes remain valid and are **mapped** above: stronger **conversion** and **customer guidance**, **storytelling** and **emotional branding**, **trust**, and a future **testimonials / past works** surface (Phase B). Official color system and performance identity are treated as **ongoing** brand engineering, not a one-off ticket.
