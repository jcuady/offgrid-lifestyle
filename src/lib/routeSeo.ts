/**
 * Static route SEO — one primary keyword owner per URL (cannibalization-safe).
 * Product detail pages set SEO dynamically in ProductDetailPage.
 */
import { isAuthScreen, isCustomerAccountPath, isPortalPath } from "@/src/lib/authRoutes";
import type { PageSeoInput } from "@/src/lib/siteSeo";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/src/lib/siteSeo";

const BRAND = "OFF GRID® Lifestyle";

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
  "/og-signatures": {
    title: `OG Signatures — Pickleball, Golf & Running Collections | ${BRAND}`,
    description:
      "Explore OG Signatures: court-ready pickleball, fairway golf, running, and everyday wear designed for Filipino athletes who play different.",
    path: "/og-signatures",
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
      "Free production-ready Illustrator templates for custom tops, polos, and team uniforms. CMYK-ready for Off Grid manufacturing.",
    path: "/custom/templates",
  },
  "/events": {
    title: `Community Events & Sportswear Philippines | ${BRAND}`,
    description:
      "Discfest, Mixed Masters, Pickle Project, and more — see where OFF GRID Lifestyle shows up in the Filipino sports community.",
    path: "/events",
  },
  "/testimonials": {
    title: `Customer Reviews & Team Testimonials | ${BRAND}`,
    description:
      "Real feedback from pickleball teams, golf crews, and lifestyle athletes across the Philippines who wear OFF GRID.",
    path: "/testimonials",
  },
  "/about": {
    title: `About Us — Filipino Sportswear Brand Manila | ${BRAND}`,
    description:
      "Where comfort meets movement. Learn how OFF GRID Lifestyle builds premium Filipino sportswear for courts, courses, and life off the grid.",
    path: "/about",
  },
  "/contact": {
    title: `Contact OFF GRID Lifestyle — Manila, Philippines | ${BRAND}`,
    description:
      "Reach the OFF GRID team for custom orders, partnerships, and product questions. Based in Manila, PH — ships nationwide.",
    path: "/contact",
  },
  "/legal/terms": {
    title: `Terms & Conditions | ${BRAND}`,
    description: "Terms and conditions for shopping and custom orders at OFF GRID Lifestyle Philippines.",
    path: "/legal/terms",
  },
  "/legal/privacy": {
    title: `Privacy Policy | ${BRAND}`,
    description: "How OFF GRID Lifestyle collects, uses, and protects your personal information.",
    path: "/legal/privacy",
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
        "Sizing charts, lead times, team deals, and FAQs for custom OFF GRID teamwear production.",
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
