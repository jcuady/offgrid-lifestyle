/**
 * Static route SEO — one primary keyword owner per URL (cannibalization-safe).
 * Product detail pages set SEO dynamically in ProductDetailPage.
 */
import { isAuthScreen, isCustomerAccountPath, isPortalPath } from "@/src/lib/authRoutes";
import type { PageSeoInput } from "@/src/lib/siteSeo";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/src/lib/siteSeo";

const BRAND = "OFFGRID® Lifestyle";

/** Exact-path SEO entries. */
const STATIC_ROUTE_SEO: Record<string, PageSeoInput> = {
  "/": {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  },
  "/shop": {
    title: `Shop Filipino Sportswear & Athletic Wear | ${BRAND}`,
    description:
      "Browse premium pickleball, golf, running, and lifestyle apparel. Crowd favorites, new drops, and OG Signatures — ships nationwide in the Philippines.",
    path: "/shop",
  },
  "/collections": {
    title: `Shop By Collection — Discfest, Solar, Primal & OG Vibe | ${BRAND}`,
    description:
      "Explore OFFGRID collections: Discfest, Solar, Primal, and OG Vibe. Filipino sportswear with a distinct point of view for play and everyday movement.",
    path: "/collections",
  },
  "/custom": {
    title: `Custom Teamwear & Uniform Orders Philippines | ${BRAND}`,
    description:
      "Design custom team jerseys, polos, and athletic wear with free design support. Minimum 10 pieces, Illustrator templates, and nationwide delivery.",
    path: "/custom",
  },
  "/custom/order": {
    title: `Place a Custom Team Order | ${BRAND}`,
    description:
      "Submit your custom team kit order — specs, artwork, sizing, and delivery details in one guided flow.",
    path: "/custom/order",
  },
  "/custom/templates": {
    title: `Download Jersey & Apparel Templates | ${BRAND}`,
    description:
      "Free production-ready Illustrator templates for custom tops, polos, and team uniforms. CMYK-ready for OFFGRID manufacturing.",
    path: "/custom/templates",
  },
  "/community": {
    title: `Events and Sports Community Philippines | ${BRAND}`,
    description:
      "Discfest, Mixed Masters, Pickle Project, and more — discover OFFGRID events and sports across the Filipino athletic community.",
    path: "/community",
  },
  "/testimonials": {
    title: `Customer Reviews & Team Testimonials | ${BRAND}`,
    description:
      "Real feedback from pickleball teams, golf crews, and lifestyle athletes across the Philippines who wear OFFGRID.",
    path: "/testimonials",
  },
  "/about": {
    title: `About Us — Filipino Sportswear Brand Marikina | ${BRAND}`,
    description:
      "Where comfort meets movement. Learn how OFFGRID Lifestyle builds premium Filipino sportswear for courts, courses, and life off the grid.",
    path: "/about",
  },
  "/contact": {
    title: `Contact OFFGRID Lifestyle — Marikina, Metro Manila | ${BRAND}`,
    description:
      "Reach the OFFGRID team for custom orders, partnerships, and product questions. Visit us at 5 Mt Everest, Marikina, 1800 Metro Manila — ships nationwide.",
    path: "/contact",
  },
  "/faq": {
    title: `FAQ — Shipping, Custom Orders & Sizing | ${BRAND}`,
    description:
      "Answers on lead times, sizing, custom teamwear minimums, payments, and nationwide shipping for OFFGRID Lifestyle Philippines.",
    path: "/faq",
  },
  "/legal/terms": {
    title: `Terms & Conditions | ${BRAND}`,
    description: "Terms and conditions for shopping and custom orders at OFFGRID Lifestyle Philippines.",
    path: "/legal/terms",
  },
  "/legal/privacy": {
    title: `Privacy Policy | ${BRAND}`,
    description: "How OFFGRID Lifestyle collects, uses, and protects your personal information.",
    path: "/legal/privacy",
  },
  "/checkout/paymongo/complete": {
    title: `Payment confirmation | ${BRAND}`,
    description: "Confirm your PayMongo QR Ph payment for OFFGRID Lifestyle orders.",
    path: "/checkout/paymongo/complete",
    noindex: true,
  },
  "/checkout/paymongo/retry": {
    title: `Retry payment | ${BRAND}`,
    description: "Retry PayMongo QR Ph checkout for your OFFGRID Lifestyle order.",
    path: "/checkout/paymongo/retry",
    noindex: true,
  },
};

const PRIVATE_ROUTE_SEO: PageSeoInput = {
  title: BRAND,
  description: SITE_DESCRIPTION,
  noindex: true,
};

export function resolveRouteSeo(pathname: string): PageSeoInput | null {
  if (isPortalPath(pathname) || isCustomerAccountPath(pathname) || isAuthScreen(pathname)) {
    return { ...PRIVATE_ROUTE_SEO, path: pathname };
  }

  if (/^\/shop\/[^/]+$/.test(pathname)) {
    return null;
  }

  if (pathname.startsWith("/custom/") && !STATIC_ROUTE_SEO[pathname]) {
    return {
      title: `Custom Ordering Guide | ${BRAND}`,
      description:
        "Sizing charts, lead times, team deals, and FAQs for custom OFFGRID teamwear production.",
      path: pathname,
    };
  }

  return STATIC_ROUTE_SEO[pathname] ?? {
    title: `Page Not Found | ${BRAND}`,
    description: SITE_DESCRIPTION,
    path: pathname,
    noindex: true,
  };
}
