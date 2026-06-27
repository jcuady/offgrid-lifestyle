import type { NavigateFunction } from "react-router-dom";
import type { CustomSectionSlug } from "@/src/store/useSiteContentStore";

/** Internal routes admins can assign to CMS buttons. */
export const CMS_ROUTE_OPTIONS: { value: string; label: string; group: string }[] = [
  { value: "/custom/order", label: "Place custom order", group: "Custom" },
  { value: "/custom/templates", label: "Templates library", group: "Custom" },
  { value: "/custom#ordering-guide", label: "Ordering guide (scroll)", group: "Custom" },
  { value: "/custom", label: "Custom hub (top)", group: "Custom" },
  { value: "/shop", label: "Shop", group: "Store" },
  { value: "/collections", label: "Collections", group: "Store" },
  { value: "/events", label: "Events", group: "Site" },
  { value: "/testimonials", label: "Testimonials", group: "Site" },
  { value: "/account/sign-in", label: "Customer sign in", group: "Account" },
  { value: "/account/sign-up", label: "Create account", group: "Account" },
  { value: "/portal/login", label: "Team portal login", group: "Account" },
  { value: "/custom#how-to-order", label: "Guide: How to order", group: "Guide panels" },
  { value: "/custom#product-catalog", label: "Guide: Product catalog", group: "Guide panels" },
  { value: "/custom#team-deals", label: "Guide: Team deals", group: "Guide panels" },
  { value: "/custom#sizing-chart", label: "Guide: Sizing chart", group: "Guide panels" },
  { value: "/custom#free-jersey-promo", label: "Guide: Free jersey promo", group: "Guide panels" },
  { value: "/custom#faqs", label: "Guide: FAQs", group: "Guide panels" },
  { value: "/custom#lead-times", label: "Guide: Lead times", group: "Guide panels" },
];

const ALLOWED_HREFS = new Set(CMS_ROUTE_OPTIONS.map((o) => o.value));

/** Legacy hash aliases still accepted from older content. */
const HREF_ALIASES: Record<string, string> = {
  "/custom#order-flow": "/custom/order",
  "/custom#templates": "/custom/templates",
};

export function isAllowedCmsHref(href: string): boolean {
  const normalized = normalizeCmsHref(href);
  return ALLOWED_HREFS.has(normalized);
}

export function normalizeCmsHref(href: string): string {
  const trimmed = href.trim();
  return HREF_ALIASES[trimmed] ?? trimmed;
}

export function sanitizeCmsHref(href: string, fallback: string): string {
  const normalized = normalizeCmsHref(href);
  return isAllowedCmsHref(normalized) ? normalized : fallback;
}

export function cmsHrefForGuideSlug(slug: CustomSectionSlug): string {
  return `/custom#${slug}`;
}

/** Navigate to an admin-configured internal route. */
export function followCmsCta(navigate: NavigateFunction, href: string) {
  const target = normalizeCmsHref(href);

  if (target === "/custom/order") {
    navigate("/custom/order");
    return;
  }
  if (target === "/custom/templates") {
    navigate("/custom/templates");
    return;
  }
  if (target === "/custom#ordering-guide") {
    navigate({ pathname: "/custom", hash: "ordering-guide" });
    return;
  }

  const guideHash = /^\/custom#([\w-]+)$/.exec(target);
  if (guideHash) {
    navigate({ pathname: "/custom", hash: guideHash[1] });
    return;
  }

  navigate(target);
}
