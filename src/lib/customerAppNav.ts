import { isAuthScreen, isPortalPath } from "@/src/lib/authRoutes";

export type CustomerAppSection = "shop" | "custom" | "orders" | "profile";

export const CUSTOMER_APP_NAV: {
  id: CustomerAppSection;
  label: string;
  shortLabel: string;
  to: string;
}[] = [
  { id: "shop", label: "Online shop", shortLabel: "Shop", to: "/account/shop" },
  { id: "custom", label: "Custom orders", shortLabel: "Custom", to: "/account/custom" },
  { id: "orders", label: "My orders", shortLabel: "Orders", to: "/account/orders" },
  { id: "profile", label: "Account details", shortLabel: "Profile", to: "/account/profile" },
];

/** Active dock tab for an account path. Storefront paths return null. */
export function resolveCustomerAppSection(pathname: string): CustomerAppSection | null {
  if (pathname === "/account" || pathname === "/account/") return "orders";
  if (pathname === "/account/shop" || pathname.startsWith("/account/shop/")) return "shop";
  if (pathname === "/account/custom" || pathname.startsWith("/account/custom/")) return "custom";
  if (pathname === "/account/orders" || pathname.startsWith("/account/orders/")) return "orders";
  if (pathname === "/account/profile" || pathname.startsWith("/account/profile/")) return "profile";
  return null;
}

/**
 * App chrome owns the header/footer on portal, auth, and signed-in account pages.
 * Marketing storefront keeps Navbar + Footer.
 */
export function hidesStorefrontChrome(pathname: string): boolean {
  return isPortalPath(pathname) || isAuthScreen(pathname) || resolveCustomerAppSection(pathname) !== null;
}

/** Dock highlight when a signed-in customer is on storefront shop/custom. */
export function resolveCustomerAppDockSection(pathname: string): CustomerAppSection | null {
  const account = resolveCustomerAppSection(pathname);
  if (account) return account;
  if (pathname === "/shop" || pathname.startsWith("/shop/")) return "shop";
  if (pathname === "/custom" || pathname.startsWith("/custom/")) return "custom";
  return null;
}

export function showsCustomerStorefrontDock(pathname: string, role: string | null | undefined): boolean {
  if (role !== "customer") return false;
  if (resolveCustomerAppSection(pathname)) return false;
  return resolveCustomerAppDockSection(pathname) !== null;
}
