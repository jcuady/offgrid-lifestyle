# OFF GRID® — Brand Book

> **Version 1.2 · June 2026**  
> **Primary source:** `Offgrid - Branding Guide/` (6 pages, Oct 2024) — audited image-by-image against this document.  
> **Secondary sources:** `OG Lifestyle Company Profile.pdf`, logo assets in `public/OG logo/`, live storefront (`src/`).  
> **v1.2 change:** Storefront retheme to the guide palette (White/Black/Electric Blue) and guide-matched fonts (Archivo display, Space Mono labels, Inter UI). Legacy green/cream/lime/gold retired; token names retained but remapped. See §5.2, §5.4, §6.2.

---

## Table of Contents

0. [Branding Guide Source Audit](#0-branding-guide-source-audit-oct-2024)
1. [Brand Architecture & Naming](#1-brand-architecture--naming)
2. [Purpose, Vision & Audience](#2-purpose-vision--audience)
3. [Voice & Messaging System](#3-voice--messaging-system)
4. [Logo System](#4-logo-system)
5. [Color System](#5-color-system)
6. [Typography System](#6-typography-system)
7. [Imagery & Creative Direction](#7-imagery--creative-direction)
8. [Digital Implementation Audit](#8-digital-implementation-audit)
9. [Product Data Deep Analysis](#9-product-data-deep-analysis)
10. [Canonical Product Schema](#10-canonical-product-schema)
11. [Brand Compliance Gaps](#11-brand-compliance-gaps)
12. [Execution Roadmap](#12-execution-roadmap)

---

## 0. Branding Guide Source Audit (Oct 2024)

Authoritative reference files:

| Page | File | What the guide defines |
|------|------|------------------------|
| **1 — Cover** | `Offgrid - Branding Guide-1.png` | Full-bleed **Electric Blue** field `#000AFF`; centered white **OFF GRID®** wordmark; cover metadata **OCT. 2024** (top-left) and **BRAND GUIDE** (bottom-left) in small monospaced caps. Wordmark letters show deliberate optical jitter (e.g. `F`/`G` sit on slightly different baselines) — this is authored character, not an error. |
| **2 — Logos** | `Offgrid - Branding Guide-2.png` | **LOGOS** panel: wordmark `OFF GRID®` + logomark `OG` in **Black**, **White**, and **Blue** (`#000AFF`) ink on neutral gray preview fields. **LOGO APPLICATION SAMPLES** panel: in-motion running photography; overlays include `WHEN COMFORT MEETS MOVEMENT`, `EST. MANILA, PH`, `RUN.`, `MERCH DROP`, dates (e.g. `10.09.2024`); white wordmark centered on photos; **OG** logomark as bottom-right corner bug. |
| **3 — Colors** | `Offgrid - Branding Guide-3.png` | **Primary:** `#FFFFFF`, `#000000`, `#000AFF` (labeled **Blue**). **Secondary (Shades):** grayscale ramp `#F1F1F1`, `#E4E4E4`, `#A1A1A1`, `#6A6A6A`, `#3A3939` plus blue ramp `#0008C3`, `#00068D`, `#000AFF`. **Field lockups:** white-on-black, black-on-white, white-on-blue bars (not transparent PNG treatments). |
| **4 — Imagery** | `Offgrid - Branding Guide-4.png` | Directive headline: **GRITTY, IN MOTION, PRODUCT-FOCUSED**. Sample photo grid shows motion blur, tight athletic crops, product/fabric detail. **Legal:** *"DO NOT USE PHOTOS IN IMAGERY — THESE ARE STRICTLY FOR SAMPLE/GUIDELINE PURPOSES ONLY"* (repeated top and bottom). |
| **5 — Applications** | `Offgrid - Branding Guide-5.png` | **BRAND APPLICATION SAMPLES** collage: ticker band `OFF GRID ® OFF GRID ® OFF GRID ®`; campaign type `RUN.`; philosophy `PROGRESS > PERFECTION`; merch card with date + `MERCH DROP` + **OG** corner mark; recurring `WHEN COMFORT MEETS MOVEMENT` + `EST. MANILA, PH`. |
| **6 — OG mark** | `Offgrid - Branding Guide-6.png` | **Dynamic OG mark:** uppercase **OG** (both letters capital), white on pure black, rotated ~20–30° counter-clockwise. Canonical avatar / icon / favicon reference — not a lowercase `o` treatment. |

**Rule:** When this brand book conflicts with the six guide pages above, **the guide pages win**. As of v1.2 the digital storefront (`src/`) also follows the guide's palette and type — see §5.2 and §6.2. The only digital-specific constraint is the Electric Blue accessibility rule (§5.4), which governs *how* the guide's blue is applied so it never falls below WCAG contrast.

---

## 1. Brand Architecture & Naming

### 1.1 The Entity Hierarchy

| Level | Name | Context of Use |
|-------|------|----------------|
| **Registered Mark** | `OFF GRID®` | Primary brand mark; use on all official collateral, logo lockups, social bios, legal references, and garment labeling. |
| **Legal / Business Name** | `Off Grid Lifestyle` | Appears on receipts, legal documents, team uniform ordering forms, and the company profile. Do not use as a design element. |
| **Monogram** | `OG` | Compact logomark for apparel embroidery, watermarks, small-format print, social avatars, and favicon contexts. |
| **Domain** | `offgridlifestyle.ph` | Web and email. Use `offgridlifestyle.ph` in lower-case in prose; never use `www.offgridlifestyle.ph` unless technically required. |
| **Tagline (guide applications)** | `WHEN COMFORT MEETS MOVEMENT` | Primary line on logo-application samples (Pages 2 & 5). Use all-caps in campaign overlays; sentence case acceptable in long-form web copy. |
| **Tagline (digital extended)** | `Play Different. Live Off Grid.` | Storefront hero and SEO — not shown on guide pages 1–6; requires brand approval before print use. |

### 1.2 When to Use Each Form

| Scenario | Correct Form |
|----------|--------------|
| Logo on garment, hang tag | `OFF GRID®` wordmark or `OG` monogram |
| Social media handle / bio | `OFF GRID®` or `@offgridlifestyle` |
| Page title, browser tab | `OffGrid Lifestyle` (single word, no space — for digital SEO) |
| Cheque / invoice / receipt | `Off Grid Lifestyle` |
| Product line prefix | `OG` (e.g., OG Court Polo, OG GOLF) |
| URL slug | `offgrid-lifestyle` or `offgridlifestyle` |

### 1.3 Trademark Usage

The `®` symbol is part of the wordmark lockup. It must always follow `OFF GRID` in logo applications. In running body text, use the registered mark on first mention per document only: "OFF GRID® was founded in Manila…" — subsequent mentions within the same document use `OFF GRID` without the symbol.

---

## 2. Purpose, Vision & Audience

### 2.1 Brand Purpose

> **WHEN COMFORT MEETS MOVEMENT**  
> *(Guide Pages 2 & 5 — primary application tagline; sentence case acceptable in long-form web copy per §1.1)*

### 2.2 Brand Pillars

| Pillar | Description |
|--------|-------------|
| **Gritty** | Honest, raw, effort-driven. No filters. The brand does not shy away from sweat and strain. |
| **In Motion** | Product is built for movement. Still-life product shots are secondary to action. |
| **Product-Focused** | The garment is the hero. Every design decision serves the product, not the brand ego. |
| **Progress > Perfection** | Iterative. Launch, learn, improve. The OG Vibe Collection and merch drops reflect this cadence. |
| **Proudly Pinoy** | Grounded in Manila. The brand serves Filipino athletes first; the `EST. MANILA, PH` locality line is non-negotiable. |

### 2.3 Audience Segments

| Segment | Profile | Product Fit |
|---------|---------|-------------|
| **Teams & Organizations** | Sports clubs, university teams, corporate squads, national teams (e.g., Pilipinas Ultimate National Handball Team, Boracay Dragons) | Custom team uniforms, event kits |
| **Event Organizers** | Tournament directors, community sports leagues (e.g., Boracay Open) | Event exclusive merch drops |
| **Individual Athletes** | Pickleball, running, golf, disc sports enthusiasts | Retail product lines |
| **Lifestyle Consumers** | Fashion-forward Filipinos who wear athleisure beyond sport | OG Vibe Collection, Everyday Wear |

### 2.4 Positioning Statement

OFF GRID® is a **Filipino performance apparel brand** that produces **premium, minimally styled sportswear** for athletes, teams, and communities — combining precision fabric engineering with a gritty, unapologetic creative identity rooted in Manila.

---

## 3. Voice & Messaging System

### 3.1 Brand Voice Attributes

| Attribute | Meaning | Example |
|-----------|---------|---------|
| **Direct** | Short sentences. No filler. Get to the point. | "RUN." not "Experience the joy of running with…" |
| **Confident** | No hedging. No asterisks on bold claims. | "PROGRESS > PERFECTION" — not "We believe in progress…" |
| **Playful** | Allowed in product names and community content. | "TAKBONG OG", "GET YOUR DINK", "SALMON SMASHER" |
| **Grounded** | Always ties back to Manila and Filipino athletic culture. | "EST. MANILA, PH" appears in nearly every layout. |

### 3.2 Core Messaging Lines

These are approved and may not be altered without brand review.

| Line | Use |
|------|-----|
| `WHEN COMFORT MEETS MOVEMENT` | **Guide-primary** — logo applications, campaign overlays, about/brand story (Pages 2 & 5) |
| `Play Different. Live Off Grid.` | Digital storefront hero, packaging extensions, social bios (not on guide pages 1–6) |
| `Progress > Perfection` | Philosophy copy — editorial, campaign posters (Page 5) |
| `EST. MANILA, PH` | Locality anchor — appears on application samples; always uppercase |
| `MERCH DROP` | Campaign-type label — pair with date, e.g. `10.09.2024 MERCH DROP` (Page 5) |
| `RUN.` | Single-word campaign display type (Page 5) |

### 3.3 Product Naming Voice

Product names operate under a separate, more playful register:

**Allowed patterns:**
- Filipino slang/portmanteau: `TAKBONG OG`, `TAKBONG POGI`
- Sport culture slang: `GET YOUR DINK`, `EVERYDAY IS PICKLE DAY`, `SALMON SMASHER`
- Clean descriptor + OG prefix: `OG GOLF`, `OG SOLAR LONGSLEEVE`, `OG COURT POLO`
- Motivational shorthand: `FULL THROTTLE`, `STAY OFFGRID`, `OG DINK DIFFERENT`

**Not allowed:**
- Generic descriptors with no brand identity: "Blue T-Shirt", "Running Top"
- Marketing superlatives: "The BEST pickleball jersey EVER"
- All-lowercase product names (breaks catalog consistency)

### 3.4 Copy Do / Don't

| Do | Don't |
|----|-------|
| "Rep the nation with pride." | "This shirt is great for showing your Filipino pride!" |
| "Engineered for the court, styled for the culture." | "This product is designed for sports and can also be worn casually." |
| "Once it's gone, it's gone." | "Limited quantities available while supplies last." |
| "4-way stretch. UV protection." | "Has stretch and UV protection built in." |
| "3,200+ items sold." | "Over three thousand items have been sold to date." |

### 3.5 Digital & SEO Copy Rules

- **Page `<title>` format**: `{Page Name} | OffGrid Lifestyle`
- **Primary meta description length**: 120–155 characters
- **Approved SEO tagline** (as in `index.html`): *"Play Different. Live Off Grid. Premium sportswear for pickleball, golf, and everyday wear. Proudly made for Filipino athletes."*
- Keywords cluster: `Filipino sportswear`, `pickleball apparel`, `golf wear`, `premium athletic wear`, `Philippines`

---

## 4. Logo System

### 4.1 Logo Variants (Official Lockups)

The guide defines two lockup types in **three ink colors** (Page 2) and **three field treatments** (Page 3).

#### Wordmark — `OFF GRID®`

**Typography (guide):** Heavy **geometric sans-serif** — wide, blocky caps. The `O` reads as a near-perfect circle; the `G` has a sharp horizontal crossbar. On the cover (Page 1), individual letters may sit on slightly different baselines (authored jitter).

| Variant | Guide reference | Repo file | Background use |
|---------|-----------------|-----------|----------------|
| **Black ink** | Page 2 — black on gray preview | `public/OG logo/OG logo/Complete/Black No BG.png` | White, cream, light fields |
| **White ink** | Page 2 — white on gray preview | `public/OG logo/OG logo/Complete/White No BG.png` | Dark, photo, colored fields |
| **Blue ink** | Page 2 — `#000AFF` on gray preview | *(not exported to repo — Gap §11.6)* | Accent ink on light neutral fields |
| **White on Blue field** | Page 3 — full bar lockup | *(not exported — use `#000AFF` field + white wordmark)* | Cover, campaign headers, merch cards |
| **White on Black field** | Page 3 | Use white wordmark on `#000000` | High-contrast campaign frames |
| **Black on White field** | Page 3 | Use black wordmark on `#FFFFFF` | Print / light collateral |

#### Logomark — `OG`

**Both letters are uppercase** in all guide applications. Page 6 is the canonical **dynamic mark**: white **OG** on pure black, rotated ~20–30° counter-clockwise (avatar, favicon, app icon, embroidery at small scale).

| Variant | Guide reference | Repo file | Background use |
|---------|-----------------|-----------|----------------|
| **Black** | Page 2 | `public/OG logo/OG logo/Short/Black No BG.png` | Light backgrounds |
| **White** | Page 2 | `public/OG logo/OG logo/Short/White No BG.png` | Dark / photo backgrounds |
| **Blue** | Page 2 | *(not exported — Gap §11.6)* | Blue accent contexts |
| **White on Black (tilted)** | Page 6 | *(not exported — Gap §11.17)* | Favicon, social avatar, corner bug |

**Placement on photography (Page 2):** Full wordmark centered or lower-third in **white**; **OG** logomark as a **bottom-right corner bug** — never compete with the primary wordmark in the same corner.

#### Dynamic OG Mark (Page 6)

Page 6 is the **icon/avatar canonical form**: uppercase **OG**, white on `#000000`, tilted counter-clockwise. Do **not** substitute a lowercase `o` + uppercase `G` pairing — that treatment is not in the Oct 2024 guide.

### 4.2 Logo Selection Rules

Use this decision tree when choosing which logo to apply:

```
Is the background #000AFF Electric Blue (cover / campaign field)?
├── YES → White wordmark OR white OG corner bug only
└── NO
      Is the background dark, a photo, or black?
      ├── YES → White variant
      │         └── Small format (avatar, favicon, embroidery)?
      │               ├── YES → White OG logomark (tilted per Page 6 for icons)
      │               └── NO  → White wordmark if width > 80px
      └── NO (white / cream / light gray)
            └── Small format?
                  ├── YES → Black OG logomark
                  └── NO  → Black wordmark
```

### 4.3 Clearance & Minimum Size

| Rule | Specification |
|------|---------------|
| **Minimum wordmark width** | 80px digital / 20mm print |
| **Minimum logomark width** | 32px digital / 8mm print |
| **Clear space** | Minimum 1× the height of the `G` on all four sides |
| **On apparel** | White logomark preferred for dark garments; black for light garments |

### 4.4 Incorrect Logo Uses — Never Do

- Do not rotate, skew, or add a drop shadow
- Do not recolor with off-brand colors (e.g., lime green, cream, gold)
- Do not remove the `®` symbol from the wordmark lockup
- Do not place the black wordmark on a dark background (use white variant instead)
- Do not stretch or distort aspect ratio
- Do not use the logo inside a container shape (e.g., circle, badge) without brand approval
- Do not straighten the Page 6 OG mark — rotation is part of the lockup
- Do not use lowercase `o` in the OG logomark (guide uses uppercase **OG**)
- Do not recreate the wordmark using a different typeface

### 4.5 Current Implementation Note

The live site (`Navbar.tsx`, `Footer.tsx`) loads the canonical white wordmark via `LOGO_WORDMARK_WHITE` in `src/lib/brandAssets.ts`, which resolves to `public/OG logo/OG logo/Complete/White No BG.png` (URL-encoded path for spaces). No CSS invert filter is applied — the asset is used as authored.

### 4.6 Favicon & Browser Chrome

| Asset | Path | Status |
|-------|------|--------|
| SVG favicon | `/favicon/favicon.svg` | Custom OG logomark — review for color alignment with `#000AFF` guide palette |
| 96×96 PNG | `/favicon/favicon-96x96.png` | Must match SVG |
| Apple touch icon | `/favicon/apple-touch-icon.png` | 180×180 — use OG monogram on dark field |
| Site manifest | `/favicon/site.webmanifest` | Review `theme_color` value |
| Browser `theme-color` | `#000000` (in `index.html`) | Guide-aligned (Black) ✓ |

---

## 5. Color System

### 5.1 Brand Guide Palette (Official Standard)

These are the authoritative colors from the Branding Guide (Page 3). These govern print, garment, brand collateral, and campaign materials.

#### Primary Colors

| Name | Hex | Swatch Role |
|------|-----|-------------|
| **White** | `#FFFFFF` | Background, reverse lockups |
| **Black** | `#000000` | Default text, primary wordmark |
| **Electric Blue** | `#000AFF` | Guide labels this **Blue** on Page 3. Cover field, campaign headers, blue ink variant |

#### Secondary Colors (Shades) — Page 3 grid

**Grayscale ramp (light → dark):**

| Hex | Role |
|-----|------|
| `#F1F1F1` | Near-white tint |
| `#E4E4E4` | Light gray |
| `#A1A1A1` | Mid gray |
| `#6A6A6A` | Dark gray |
| `#3A3939` | Near-black |

**Blue ramp (dark → primary):**

| Hex | Role |
|-----|------|
| `#00068D` | Navy (darkest) |
| `#0008C3` | Deep blue |
| `#000AFF` | Primary Blue (repeated) |

> **Photo accents (not official UI swatches):** Application samples (Pages 2, 4, 5) show **neon yellow/green**, **orange**, and **purple** in athletic photography. These are product/environment colors — **do not** add them to the official palette without brand review.

### 5.2 Digital / Storefront Token Palette (Implementation)

As of v1.2 the storefront **strictly follows the brand guide palette** (White / Black / Electric Blue + the gray and blue ramps from Page 3). The legacy green/cream/lime/gold palette has been retired. Token **names** are retained so the retheme stayed surgical, but their **values now map to guide colors** (`src/index.css`).

| Token Name | Class | Hex | Guide role | Usage in Code |
|------------|-------|-----|------------|---------------|
| `offgrid-green` | `bg-offgrid-green` | `#000000` | Black | Primary text, default buttons, navbar/dark surfaces |
| `offgrid-cream` | `bg-offgrid-cream` | `#F1F1F1` | Gray 50 | Page background, light cards, light text on dark |
| `offgrid-lime` | `bg-offgrid-lime` | `#000AFF` | Electric Blue | Brand accent — **fills with white text** or accent on light only |
| `offgrid-dark` | `bg-offgrid-dark` | `#000000` | Black | Footer, deep overlays |
| `offgrid-gold` | `bg-offgrid-gold` | `#00068D` | Navy | Premium/special accents (events) |

Supplemental guide-ramp tokens are also exposed for borders, muted UI and dividers: `og-gray-50 #F1F1F1`, `og-gray-100 #E4E4E4`, `og-gray-300 #A1A1A1`, `og-gray-600 #6A6A6A`, `og-gray-800 #3A3939`, `og-blue-700 #0008C3`, `og-blue-900 #00068D`.

### 5.3 Token Usage Rules

| Surface | Correct Token | Notes |
|---------|--------------|-------|
| Page background | `offgrid-cream` (#F1F1F1) | Applied globally via `body` in `index.css` |
| Primary CTAs / Buttons | `offgrid-green` (black) | `Button variant="default"`, white label |
| Secondary CTAs | `offgrid-cream` on black, or white on dark | `Button variant="secondary"` |
| Active / hover accent | `offgrid-lime` (blue) on light; **white on dark** | See a11y rule below |
| Footer / deep backgrounds | `offgrid-dark` (black) | |
| Events / premium highlight | `offgrid-gold` (navy) | |
| Body text on background | `offgrid-green` (black) | Set on `body` via `index.css` |

### 5.4 Electric Blue Accessibility Rule (critical)

Electric Blue `#000AFF` is dark and saturated. It has **strong** contrast on white/near-white but **fails** on black (≈2.2:1 both ways). Therefore in the UI:

- **Use blue** as a fill with **white** text, or as text/icons on white/`#F1F1F1` surfaces.
- **Never** put blue text/icons on black, and **never** put black text on a blue fill.
- On dark surfaces, the accent/hover/highlight is **white** (matching the guide's white-on-photo treatment), not blue.

### 5.5 Accessibility

| Combination | Ratio | WCAG AA |
|-------------|-------|---------|
| `#000000` (black) on `#F1F1F1` (bg) | ≈ 19:1 | Pass (AAA) |
| `#000AFF` (blue) on `#FFFFFF` / `#F1F1F1` | ≈ 8.6:1 | Pass (AAA) |
| `#FFFFFF` (white) on `#000AFF` (blue fill) | ≈ 5.9:1 | Pass (AA) |
| `#FFFFFF` (white) on `#000000` (black) | ≈ 21:1 | Pass (AAA) |
| `#000AFF` (blue) on `#000000` (black) | ≈ 2.2:1 | **Fail — never use** |
| `#000000` (black) on `#000AFF` (blue) | ≈ 2.2:1 | **Fail — never use** |

---

## 6. Typography System

### 6.1 Brand Guide Typography (Pages 1–6)

| Role | Guide treatment | Examples on guide |
|------|-----------------|-------------------|
| **Wordmark / display** | Heavy **geometric sans-serif**, all caps, ultra-bold | `OFF GRID®`, `RUN.`, `PROGRESS > PERFECTION`, `GRITTY, IN MOTION, PRODUCT-FOCUSED` |
| **Metadata / technical** | **Monospaced**, small, tracked, all caps | `BRAND GUIDE`, `OCT. 2024`, hex codes on Page 3 |
| **Application captions** | Clean sans or mono, small, uppercase | `WHEN COMFORT MEETS MOVEMENT`, `EST. MANILA, PH`, `MERCH DROP`, dates |

The guide uses a heavy geometric grotesque for display and a monospace for metadata. The digital implementation (§6.2) now mirrors this with **Archivo** + **Space Mono** (Inter remains for body/UI).

### 6.2 Digital Typography (Implementation)

Three font families are loaded via Google Fonts in `src/index.css`, chosen to match the guide:

| Role | Family | Token | Notes |
|------|--------|-------|-------|
| **Display / Headings** | Archivo | `font-display` | Heavy geometric grotesque, weights 400–900 + italic. The closest free match to the `OFF GRID®` wordmark. Used for hero `h1`, section headlines, product names, price displays, mobile nav. |
| **Body / UI** | Inter | `font-sans` | Weights 400–700. Nav links, buttons, body copy, descriptions, labels. |
| **Metadata / labels** | Space Mono | `font-mono` | Monospace for eyebrows/micro-labels (`EST. MANILA, PH`, section eyebrows, dates) — mirrors the guide's technical metadata type. |

> **Alignment note:** Playfair Display (the previous high-contrast serif) has been retired. Archivo restores the guide's heavy-grotesque voice, and Space Mono restores the monospaced metadata treatment seen on guide Pages 1–5. Do **not** introduce a fourth font.

### 6.3 Type Scale & Patterns

| Use | Class Pattern | Notes |
|-----|--------------|-------|
| Hero `h1` | `text-7xl md:text-[8rem] lg:text-[10rem] font-display font-black leading-[0.85] tracking-tight` | "OFF GRID / LIFESTYLE" — breaks two lines, no widows |
| Section headline | `font-display font-bold text-3xl–5xl` | All-caps optional |
| Micro label | `text-[10px] font-semibold tracking-[0.2em] uppercase` | Used for stats bar, product labels, category badges |
| Body copy | `font-sans text-sm–base font-normal leading-relaxed` | Line height relaxed |
| Price | `font-display font-bold` | Formatted via `formatPrice()` → `₱{amount}` |
| Button | `font-sans text-sm font-medium` | All button variants |

### 6.4 Typography Do / Don't

| Do | Don't |
|----|-------|
| Use `font-display` (Archivo) for all headings and hero copy | Mix heading fonts between Archivo and Inter in the same hierarchy |
| Use `font-sans` (Inter) for all UI controls, labels, and body | Use Archivo for long body copy |
| Use `font-mono` (Space Mono) for eyebrows, dates, and technical micro-labels | Use blue text on black, or black text on a blue fill (see §5.4) |
| Apply `tracking-[0.2em] uppercase` only on micro labels | Apply extreme tracking to headlines (breaks display intent) |
| Keep hero `h1` in all-caps with tight `leading-[0.85]` | Use sentence-case for the hero wordmark |

---

## 7. Imagery & Creative Direction

### 7.1 Core Image Directive

> **GRITTY, IN MOTION, PRODUCT-FOCUSED**  
> *(Branding Guide, Page 4)*

All OFF GRID® imagery must satisfy these three criteria simultaneously. Any image that is polished-studio, flat-lay-only, or person-absent fails the brand standard.

### 7.2 Approved Image Characteristics (from Page 4 samples)

| Criterion | Description |
|-----------|-------------|
| **Gritty** | High contrast, natural light, imperfect environments — tracks, asphalt, urban paths. Grain acceptable. |
| **In Motion** | Motion blur on limbs; mid-stride runners; dynamic low angles. Blur is intentional. |
| **Product-Focused** | Technical fabrics, shoes, socks, jacket textures visible. Tight crops on gear — not polished studio flat-lays. |
| **Cropping** | Prefer legs, feet, torso fragments over posed full-body studio shots. |
| **Tone** | Cool neutrals (charcoal, slate, asphalt) as base; high-vis **yellow/green** and **orange** appear in sample photos only. |

### 7.3 Approved Color Treatment

- Natural, high-contrast grading; avoid soft lifestyle filters
- Dark/moody overlays acceptable on campaign layouts
- `#000AFF` is a **layout field color** (cover, bars) — not a photo color grade
- Neon accents in sample photography are **not** licensed UI tokens (see §5.1 note)

### 7.4 Image Types by Context

| Context | Image Type |
|---------|-----------|
| Site hero | Full-bleed, in-motion sport photography + gradient overlay |
| Product cards | Clean product-on-body or ghost mannequin — 4:5 ratio |
| Campaign social | Gritty athlete photo + wordmark/tagline overlay |
| Events page | Dynamic event photography + electric blue or dark overlays |
| Garment marketing | Detail crop: fabric close-up, collar, print, stitching |

### 7.5 Legal Notice — Sample Photos (Non-Negotiable)

> **"DO NOT USE PHOTOS IN IMAGERY — THESE ARE STRICTLY FOR SAMPLE/GUIDELINE PURPOSES ONLY"**  
> *(Branding Guide, Page 4 — repeated at top and bottom of the sample grid)*

The people, environments, and third-party marks visible in guide pages 2, 4, and 5 are **style references only**. Production must use **owned, licensed, or released** photography.

**Storefront status (June 2026):** Homepage sections use client assets under `public/images/` (sourced from `og photos/`). Confirm licensing before public launch. Hero uses a **gradient field** (no photo) — aligned with avoiding unlicensed stock.

### 7.6 Brand Application Patterns (from Guide Page 5)

| Pattern | Description |
|---------|-------------|
| **Ticker strip** | Repeating `OFF GRID ® OFF GRID ® OFF GRID ®` on horizontal black bands — frames portrait crops (Page 5) |
| **Merch drop card** | Date (e.g. `10.09.2024`) + `MERCH DROP` + **OG** corner watermark on product/texture photo |
| **Campaign poster** | Single-word display (`RUN.`) or philosophy line (`PROGRESS > PERFECTION`) in bold white type |
| **Locality + tagline pair** | `WHEN COMFORT MEETS MOVEMENT` + `EST. MANILA, PH` on opposite corners of athletic crops |
| **Blue cover** | Full `#000AFF` field + centered white wordmark (Page 1) |

---

## 8. Digital Implementation Audit

### 8.1 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | React | 19 |
| Language | TypeScript | — |
| Build tool | Vite | 6 |
| Styling | Tailwind CSS | v4 (via `@tailwindcss/vite`) |
| State | Zustand | — |
| Motion | Motion One (`motion/react`) | — |
| Icons | Lucide React | — |
| UI primitives | `class-variance-authority` + Radix Slot | — |

### 8.2 Routing & Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Hero, Featured Collections, Best Sellers (Full Collection), Brand Story, Community & Events, Social Proof, CTA |
| `/shop` | `ShopPage` | Full catalog, filters (category/price/search), grid/list toggle |
| `/custom` | `CustomHubPage` | Custom orders hub — team order guide |
| `/events` | `EventsPage` | Community & events |

### 8.3 Brand Token Usage Map

| Component | Tokens Used | Notes |
|-----------|-------------|-------|
| `index.css` body | `bg-offgrid-cream` (#F1F1F1) `text-offgrid-green` (black) `font-sans` | Global base; blue selection w/ white text |
| `Navbar.tsx` | `bg-offgrid-green` (black), `text-offgrid-cream`, `hover:text-white`, blue cart badge w/ white count | Hover is white on the dark bar (§5.4) |
| `Hero.tsx` | Black field with low-opacity blue glow accent | No photo — see §7.5 |
| `Button.tsx` | `bg-offgrid-green` (black), `bg-offgrid-cream`, `border-offgrid-green`, `hover:bg-offgrid-dark` | `default`, `secondary`, `outline`, `ghost`, `link` variants |
| `Footer.tsx` | `bg-offgrid-dark` (black), `text-offgrid-cream`, `hover:text-white` | White hover on dark footer (§5.4) |
| `EventsPage.tsx` | `offgrid-gold` (navy), blue CTA w/ white text | Dark hero/cards use white accents (§5.4) |
| `ShopPage.tsx` | `bg-offgrid-green` (black) hero, `text-offgrid-lime` (blue) on light, `bg-offgrid-cream` | Hero italic/eyebrow now white on black |
| `ProductDetailPage.tsx` | `bg-offgrid-cream`, `text-offgrid-green`, blue price/accents on light | PDP — blue accents on light surfaces only |

### 8.4 Asset Pipeline Gaps

| Asset | Referenced In | Actual File | Status |
|-------|-------------|-------------|--------|
| `LOGO_WORDMARK_WHITE` | `Navbar.tsx`, `Footer.tsx` | `public/OG logo/OG logo/Complete/White No BG.png` | **Wired** |
| `LOGO_WORDMARK_BLACK` | — | `public/OG logo/OG logo/Complete/Black No BG.png` | Present — not auto-swapped on light nav |
| `LOGO_MARK_WHITE` / `BLACK` | — | `public/OG logo/OG logo/Short/*.png` | Present — unwired |
| Blue ink wordmark + logomark | Guide Page 2 | — | **Missing export (§11.6)** |
| Tilted OG on black (Page 6) | Favicon reference | — | **Missing export (§11.17)** |
| `/images/*` (collections, story, UGC) | `landingContent.ts` | `public/images/` (from `og photos/`) | **Present** — confirm license |
| Legacy `/images/product_*.png` | `products.ts` | `public/images/` | Present (underscore names) |
| `/images/hero_golf_course.png` | `index.html` (og:image) | `public/images/hero_golf_course.png` | Present |

### 8.5 Logo Implementation

Shared constant in `src/lib/brandAssets.ts`:

```ts
export const LOGO_WORDMARK_WHITE =
  "/OG%20logo/OG%20logo/Complete/White%20No%20BG.png";
```

`Navbar.tsx` and `Footer.tsx` import it and render:

```tsx
<img src={LOGO_WORDMARK_WHITE} alt="OFF GRID® — OffGrid Lifestyle" className="h-10 w-auto" />
```

**Optional enhancement:** When the navbar sits on a light background (e.g. cream body scroll), switch to `Complete/Black No BG.png` using the existing `isScrolled` / route context — today both surfaces are dark enough for the white wordmark.

### 8.6 Unused Code Items

| Item | File | Status |
|------|------|--------|
| `stock` field | `src/data/products.ts` | Defined on every product; no UI renders it — inventory is invisible |
| `getProductById()` | `src/data/products.ts` | Exported but not imported anywhere in `src/` |
| `offgrid-gold` token | `src/index.css` | Used only in `EventsPage.tsx` — underpromised in other brand docs |
| `package.json` name | `package.json` | Set to `"react-example"` — misaligned with brand |

---

## 9. Product Data Deep Analysis

### 9.1 Source Overview

`sampledata.md` contains **16 product line definitions** in a semi-structured plain-text format. This is an internal line sheet / catalog brief — not directly deployable to the storefront.

### 9.2 Complete Catalog Inventory

| # | Product Name | Sizes | Price (₱) | Cut | Material | Colors / Variants |
|---|-------------|-------|-----------|-----|----------|------------------|
| 1 | MOTOLINE | 2XS–3XL | 650 | Long sleeve | Drifit | FULL THROTTLE, TAKBONG OG, STAY OFFGRID, TAKBONG POGI |
| 2 | OG GOLF | S–5XL | 1,200 | Short sleeve | Polo shirt | Pink, Navy Blue, Green |
| 3 | OG PICKLEBALL 2.0 | 2XS–3XL | 900 | Short sleeve | Cotton | Green, Blue |
| 4 | RUNNING LINE | 2XS–3XL | 1,000 | Sleeveless | Running mesh | White-Teal, White-Pink, White-Neon Green, White-Orange, Black-Teal, Black-Pink, Black-Neon Green, Pink-Teal *(8 variants)* |
| 5 | THE OG VIBE COLLECTION | S–2XL | 850 | Short sleeve | Cotton | Black Steampunk, Cream Steampunk, Black Blossom, Cream Blossom |
| 6 | OG SOLAR SLEEVELESS | 2XS–3XL | 900 | Sleeveless | Drifit | White-Teal, White-Red, Blue-Yellow |
| 7 | OG PRIMAL LONGSLEEVE | 2XS–3XL | 990 | Long sleeve | Drifit | Green *(single color)* |
| 8 | OG PRIMAL SLEEVELESS | 2XS–3XL | 900 | Sleeveless | Drifit | Black-Neon Green, Teal-White |
| 9 | OG SOLAR LONGSLEEVE | 2XS–3XL | 900 | Long sleeve | Drifit | White-Teal, White-Red, Blue-Yellow |
| 10 | OG PRIMAL SHORTSLEEVE | 2XS–3XL | 900 | Short sleeve | Drifit | Teal-White, Blue-Ivory, Black-Green, Green-Pink |
| 11 | OG SOLAR SHORTSLEEVE | 2XS–3XL | 700 | Short sleeve | Drifit | White-Teal, White-Red, Blue-Yellow |
| 12 | EVERYDAY IS PICKLE DAY | 2XS–3XL | 1,100 | Short sleeve | Drifit or Running | White-Pink |
| 13 | GET YOUR DINK | 2XS–3XL | 1,100 | Short sleeve | Drifit or Running | Green |
| 14 | PICKLEBALL LIFESTYLE | S–XL | 1,100 | Short sleeve | Drifit or Running | White |
| 15 | SALMON SMASHER | 2XS–3XL | 1,100 | Short sleeve | Drifit or Running | Salmon |
| 16 | OG DINK DIFFERENT | 2XS–3XL | 1,100 | Short sleeve | Drifit or Running | Black |
| 17 | OG PICKLEBALL CLUB | 2XS–3XL | 1,100 | Short sleeve | Drifit or Running | White |

> Note: Products 12–17 (`₱1,100 pickleball line`) are currently the closest match to the coded `products.ts` pricing — however the coded catalog has different product names entirely.

### 9.3 Pricing Analysis

| Price Point | Products | Implied Tier |
|-------------|----------|-------------|
| ₱650 | MOTOLINE | Entry / community print |
| ₱700 | OG SOLAR SHORTSLEEVE | Performance entry |
| ₱850 | OG VIBE COLLECTION | Lifestyle cotton |
| ₱900 | OG PICKLEBALL 2.0, RUNNING LINE, SOLAR/PRIMAL lines | Core performance |
| ₱990 | OG PRIMAL LONGSLEEVE | Premium drifit |
| ₱1,000 | RUNNING LINE | Running specialist |
| ₱1,100 | OG GOLF, Pickleball 2.0 series, current coded catalog | Premium retail |
| ₱1,200 | OG GOLF | Top of range |

**Currency:** PHP (Philippine Peso) is assumed and confirmed by `formatPrice()` in `products.ts` (outputs `₱`).

### 9.4 Category Taxonomy (Derived)

Based on product names and profile, the following category structure is recommended:

```
OFF GRID® Catalog
├── Pickleball
│   ├── OG PICKLEBALL 2.0
│   ├── EVERYDAY IS PICKLE DAY
│   ├── GET YOUR DINK
│   ├── PICKLEBALL LIFESTYLE
│   ├── SALMON SMASHER
│   ├── OG DINK DIFFERENT
│   └── OG PICKLEBALL CLUB
├── Running
│   ├── RUNNING LINE
│   ├── MOTOLINE
│   └── [Stride Collection items from profile]
├── Golf
│   └── OG GOLF
├── Solar Collection
│   ├── OG SOLAR SLEEVELESS
│   ├── OG SOLAR SHORTSLEEVE
│   └── OG SOLAR LONGSLEEVE
├── Primal Collection
│   ├── OG PRIMAL LONGSLEEVE
│   ├── OG PRIMAL SHORTSLEEVE
│   └── OG PRIMAL SLEEVELESS
├── Lifestyle / OG Vibe
│   └── THE OG VIBE COLLECTION
└── Custom / Team
    └── [Team uniform orders — offline flow]
```

### 9.5 Data Quality Findings

| Issue | Affected Products | Severity |
|-------|------------------|----------|
| Size range notation is inconsistent: `small-5XL` vs `2XS-3XL` vs `SMALL-XL` | OG GOLF, OG PICKLEBALL 2.0, PICKLEBALL LIFESTYLE | Medium |
| Color options are comma-delimited strings with no schema: `FULL THROTTLE` is a design name, not a color | MOTOLINE, OG VIBE COLLECTION | High |
| `Material: drifit or running` is a branch condition, not a single material | Products 12–17 (Pickleball line) | High |
| No `sku`, `slug`, or unique identifier per product | All 16 products | High |
| No image reference for any product | All 16 products | High |
| No `category` or `collection` label in the raw data | All 16 products | Medium |
| No currency label on `Price` field | All 16 products | Low (PHP assumed) |
| Singleton color on OG PRIMAL LONGSLEEVE — may be incomplete | Product 7 | Low |
| Size `SMALL-XL` (uppercase) inconsistent with other entries | PICKLEBALL LIFESTYLE | Low |

---

## 10. Canonical Product Schema

### 10.1 Recommended TypeScript Interface

This extends the current `Product` interface in `src/data/products.ts` to be production-ready:

```typescript
// Normalized size codes — master list
export type SizeCode = "2XS" | "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL" | "5XL";

// Normalized cut / silhouette
export type GarmentCut = "long_sleeve" | "short_sleeve" | "sleeveless" | "polo" | "tank" | "shorts" | "cap";

// Normalized material
export type FabricType = "dri_fit" | "cotton" | "running_mesh" | "poly_blend" | "nylon_spandex";

// Variant: a single sellable SKU within a product
export interface ProductVariant {
  sku: string;                       // e.g., "OG-MOTOLINE-LS-DRF-FULLTHROTTLE"
  designName: string;                // "FULL THROTTLE" — the named colorway/design
  colorPrimary?: string;             // hex or named color — e.g., "#000000"
  colorSecondary?: string;           // for two-tone variants e.g., "teal"
  fabricOption?: FabricType;         // when material is a variant (drifit vs running)
  priceOverride?: number;            // in PHP, only set if differs from product.basePrice
  isActive: boolean;
  imageUrl?: string;                 // variant-specific image if colors differ visually
}

// Color swatch for UI rendering (extends current ProductColor)
export interface ProductColor {
  name: string;                      // Display name — "Forest Green"
  value: string;                     // Tailwind class OR hex — "bg-offgrid-green" | "#0F2F2F"
  variantSku?: string;               // link to specific variant if applicable
}

// Main product interface (canonical)
export interface Product {
  id: string;                        // UUID or slug-based: "og-golf"
  slug: string;                      // URL-safe: "og-golf" — unique
  name: string;                      // Display: "OG GOLF"
  category: string;                  // "Golf" | "Pickleball" | "Running" | ...
  collectionIds?: string[];          // e.g., ["primal", "solar", "vibe"]
  basePrice: number;                 // PHP, in whole numbers
  image: string;                     // Hero product image path
  gallery?: string[];                // Additional product images
  colors: ProductColor[];            // For UI swatches
  sizes: SizeCode[];                 // Explicit array, not a range string
  sizeRange?: string;                // Human-readable "2XS–3XL" for display
  description: string;               // Long-form PDP copy
  shortDescription?: string;         // 1–2 sentence listing card copy
  material: string;                  // Display string: "92% Polyester, 8% Spandex"
  fabricType: FabricType;            // Normalized enum
  cut: GarmentCut;                   // Normalized enum
  fit?: string;                      // "Relaxed fit with dropped shoulders. Model is 5'10\" wearing size M."
  variants?: ProductVariant[];       // Full SKU matrix
  sold: number;                      // Fulfilled units — for social proof
  stock?: number;                    // Aggregate or display stock (optional — use variant-level if granular)
  tag?: string;                      // "Best Seller" | "New" | "Limited"
  status: "draft" | "active" | "archived";
  metaTitle?: string;                // For SEO — defaults to name + " | OFF GRID®"
  metaDescription?: string;          // For SEO
  createdAt: string;                 // ISO 8601
  updatedAt: string;                 // ISO 8601
}
```

### 10.2 Field Migration Map (sampledata.md → Canonical Schema)

| `sampledata.md` Field | Maps To | Migration Action |
|----------------------|---------|-----------------|
| Title line (e.g., `MOTOLINE`) | `Product.name` + `Product.slug` | Auto-generate slug: `motoline`; add `id` as UUID |
| `Size: 2XS-3XL` | `Product.sizes[]` + `Product.sizeRange` | Parse range → explicit array `["2XS","XS","S","M","L","XL","2XL","3XL"]`; normalize to `SizeCode` enum |
| `Color Options: FULL THROTTLE, ...` | `ProductVariant[]` (one variant per comma-value) | Each item becomes a `ProductVariant.designName`; extract colors where format is `color1-color2` |
| `Price: 650` | `Product.basePrice` | Add `currency: "PHP"` implicit |
| `Cut: longsleeve` | `Product.cut` | Normalize: `longsleeve` → `long_sleeve`, `shortsleeve` → `short_sleeve`, `sleeveless` → `sleeveless` |
| `Material: drifit` | `Product.fabricType` | `drifit` → `dri_fit`, `poloshirt` → `poly_blend`, `cotton` → `cotton`, `running` → `running_mesh` |
| `Material: drifit or running` | `ProductVariant.fabricOption` | Split into two variant groups — one per material option; let customer choose at cart |
| *(missing)* | `Product.image`, `Product.gallery` | Requires photography production; map to `/images/{slug}-hero.png` convention |
| *(missing)* | `Product.description`, `Product.metaTitle` | Content writing task — one description per product |
| *(missing)* | `Product.category` | Assign from taxonomy in §9.4 |
| *(missing)* | `Product.status` | Default new entries to `"draft"` until images and copy are complete |

### 10.3 SKU Naming Convention

```
OG-{PRODUCT_CODE}-{CUT_CODE}-{FABRIC_CODE}-{DESIGN_CODE}

Examples:
  OG-MOTOLINE-LS-DRF-FULLTHROTTLE
  OG-GOLF-SS-POLO-NAVYBLUE
  OG-RUNNING-SL-RUN-WHITENEONGREEN
  OG-PRIMAL-SS-DRF-TEALWHITE
```

| Code | Values |
|------|--------|
| `{CUT_CODE}` | `LS` (long sleeve), `SS` (short sleeve), `SL` (sleeveless), `PO` (polo) |
| `{FABRIC_CODE}` | `DRF` (drifit), `COT` (cotton), `RUN` (running mesh), `NYL` (nylon) |
| `{DESIGN_CODE}` | Slug of design name — uppercase, no spaces, hyphens removed |

---

## 11. Brand Compliance Gaps

Prioritized by severity and customer/business impact.

### Critical (Fix Before Launch)

| # | Gap | Source Evidence | Fix |
|---|-----|----------------|-----|
| 11.1 | ~~Nav/footer logo missing~~ | `brandAssets.ts` → white wordmark | Optional: black wordmark on light surfaces |
| 11.2 | ~~Core `/images/*` missing~~ | `public/images/` populated Jun 2026 | Confirm client license for `og photos/` derivatives |
| 11.3 | ~~`og:image` hero missing~~ | `public/images/hero_golf_course.png` exists | Verify image is on-brand before launch |
| 11.4 | ~~Hero Unsplash URL~~ | `Hero.tsx` uses gradient field | Resolved — no third-party hero photo |

### High (Address in Sprint 1)

| # | Gap | Fix |
|---|-----|-----|
| 11.5 | `sampledata.md` products not fully in `products.ts` | Migrate through canonical schema |
| 11.6 | Blue ink logo variants (Page 2) not in `public/OG logo/` | Export `#000AFF` wordmark + OG PNG/SVG |
| 11.7 | `stock` field unused | Wire low-stock UI or remove |
| 11.8 | `package.json` `"name": "react-example"` | Rename to `"offgrid-lifestyle"` |
| 11.17 | Page 6 tilted OG mark not exported | Export for favicon / apple-touch-icon alignment |

### Medium (Address in Sprint 2)

| # | Gap | Fix |
|---|-----|-----|
| 11.10 | `getProductById()` exported but unused | Wire to `ProductDetailPage` or remove the export until needed |
| 11.12 | `offgrid-gold` (now navy `#00068D`) used only on Events | Keep scoped; consider folding into `og-blue-900` |

### Low (Governance)

| # | Gap | Fix |
|---|-----|-----|
| 11.13 | No slug or SKU on any product — will break routing if PDP pages are added | Add `slug` field now, before routing expands |
| 11.14 | `sampledata.md` uses inconsistent size notation (`small-5XL` vs `2XS-3XL`) | Normalize all sizes to master `SizeCode` ladder during data migration |
| 11.15 | `Material: drifit or running` is not a valid schema value | Model as variant-level fabric option (see §10.2) |
| 11.16 | `companyprofile.md` mentions custom printing / team uniforms; storefront does not have a B2B ordering flow | Plan a separate B2B/custom order route or landing section |

---

## 12. Execution Roadmap

### Phase 1 — Brand Foundation (Week 1–2)

**Goal:** Make the site ship-ready with correct brand assets and no broken images.

| Task | Owner | Priority |
|------|-------|----------|
| ~~Wire main logo to canonical white wordmark~~ | Done via `src/lib/brandAssets.ts` | — |
| Add all `/images/*.png` product photos or generate placeholder images | Design/Dev | Critical |
| Add `/images/hero_golf_course.png` for OG meta image | Design | Critical |
| Replace Unsplash hero URL with owned/licensed asset | Design | ~~Critical~~ Resolved (gradient hero) |
| Update `package.json` name to `"offgrid-lifestyle"` | Dev | High |
| Export blue logo variants and add to `public/OG logo/OG logo/` | Design | High |
| Add `createdAt`, `updatedAt`, `slug`, `status` fields to `Product` interface | Dev | High |

### Phase 2 — Catalog Migration (Week 3–4)

**Goal:** Populate the real product catalog from `sampledata.md` through the canonical schema.

| Task | Owner | Priority |
|------|-------|----------|
| Normalize `sampledata.md` size ranges to `SizeCode[]` arrays | Dev/Data | High |
| Create `ProductVariant` entries for each color/design per product | Dev | High |
| Resolve `"drifit or running"` material ambiguity — convert to variant-level fabric option | Dev | High |
| Assign category/collection labels from taxonomy (§9.4) to all 16 products | Content | High |
| Write 1–2 sentence `shortDescription` per product for listing cards | Content | Medium |
| Write full `description`, `material`, and `fit` per product for PDP | Content | Medium |
| Generate SKU codes per canonical convention (§10.3) | Operations | Medium |

### Phase 3 — UI Polish & Brand Alignment (Week 5–6)

**Goal:** Align the digital UI with the brand system documented here.

| Task | Owner | Priority |
|------|-------|----------|
| ~~Retheme storefront to guide palette (White/Black/Blue) + Archivo/Space Mono fonts~~ | Done in `index.css` + components (v1.2) | — |
| Update `Navbar.tsx` logo to use canonical path with conditional dark/light variant | Dev | High |
| Wire `stock` field to low-stock indicator in `ProductModal` or remove it | Dev | Medium |
| Add `slug`-based routing for individual product pages (PDP) | Dev | Medium |
| Reconcile favicon color with brand decision — Electric Blue or Dark Green | Design/Dev | Medium |
| Add `metaTitle`/`metaDescription` per product for SEO | Content/Dev | Medium |
| Add B2B / Custom Order landing section or route | Dev/Design | Low |
| Document design token decisions in `index.css` comments | Dev | Low |

### Phase 4 — Governance (Ongoing)

| Task | Owner |
|------|-------|
| Review any new product names against voice/naming rules (§3.3) | Brand |
| Run color contrast checks on any new UI patterns against §5.5 | Dev/Design |
| Maintain this brand book with version number and date on every revision | Brand |
| Keep `sampledata.md` / `products.ts` in sync after every catalog update | Dev/Operations |
| Conduct a brand audit before every major merch drop | Brand |

---

## Appendix A — File Inventory

### Logo Assets

| File | Description |
|------|-------------|
| `public/OG logo/OG logo/Complete/Black No BG.png` | Full wordmark, black on transparent — for light backgrounds |
| `public/OG logo/OG logo/Complete/White No BG.png` | Full wordmark, white on transparent — for dark/photo backgrounds |
| `public/OG logo/OG logo/Short/Black No BG.png` | OG monogram, black on transparent — compact use |
| `public/OG logo/OG logo/Short/White No BG.png` | OG monogram, white on transparent — compact use on dark |
| `Offgrid - Branding Guide/Offgrid - Branding Guide-1.png` | Cover — Electric Blue field, OFF GRID® wordmark |
| `Offgrid - Branding Guide/Offgrid - Branding Guide-2.png` | Logo system — all 6 lockup variants + application samples |
| `Offgrid - Branding Guide/Offgrid - Branding Guide-3.png` | Color system — primary + secondary palette with hex |
| `Offgrid - Branding Guide/Offgrid - Branding Guide-4.png` | Imagery directive — GRITTY, IN MOTION, PRODUCT-FOCUSED |
| `Offgrid - Branding Guide/Offgrid - Branding Guide-5.png` | Brand application samples — ticker, campaign, merch drop |
| `Offgrid - Branding Guide/Offgrid - Branding Guide-6.png` | Dynamic OG mark — white uppercase **OG** on black, ~20–30° CCW rotation |
| `Offgrid - Branding Guide/OG Lifestyle Company Profile.pdf` | Extended company profile (product lines, portfolio — not a substitute for the 6-page guide) |

### Source Documents

| File | Description |
|------|-------------|
| `companyprofile.md` | Business overview, product lines, recent projects, portfolio references |
| `sampledata.md` | 16-product line sheet — source for catalog migration |
| `src/index.css` | Tailwind v4 theme — all color and typography tokens |
| `src/data/products.ts` | Current coded catalog — `Product` interface and 4 placeholder products |
| `src/App.tsx` | Route structure and page composition |
| `index.html` | HTML shell — SEO meta, OG tags, favicon, theme-color |

---

## Appendix B — Quick Reference Card

```
BRAND NAME     OFF GRID® (registered mark)
TAGLINE (guide) WHEN COMFORT MEETS MOVEMENT
TAGLINE (web)  Play Different. Live Off Grid.
PHILOSOPHY     PROGRESS > PERFECTION
ORIGIN         EST. MANILA, PH
DOMAIN         offgridlifestyle.ph

COLORS (Guide) White #FFFFFF · Black #000000 · Blue #000AFF
               Grays #F1F1F1 → #3A3939 · Blues #00068D #0008C3
COLORS (Web)   bg #F1F1F1 · text/buttons Black #000000 · accent Blue #000AFF
               (token names offgrid-green/cream/lime now map to guide colors)
A11Y RULE      Blue = fill w/ WHITE text or accent on light; never blue-on-black

FONTS (Guide)  Heavy geometric sans (display) · Monospace (metadata)
FONTS (Web)    Archivo (display) · Inter (UI) · Space Mono (labels) — see §6.2

LOGO FILES     Complete/White + Black · Short/White + Black (transparent PNG)
               Missing: blue ink variants, Page 6 tilted OG export

IMAGERY        Gritty · In Motion · Product-Focused
               Sample photos in guide are NOT licensed for reuse

GUIDE PAGES    Offgrid - Branding Guide-1.png … -6.png (Oct 2024)
```

---

*Brand Book v1.1 · OFF GRID® · offgridlifestyle.ph · Audited against `Offgrid - Branding Guide/` June 2026*
