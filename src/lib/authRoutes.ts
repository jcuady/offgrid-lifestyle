import type { UserRole } from "@/src/store/usePortalStore";

/** Storefront customer authentication. */
export const CUSTOMER_SIGN_IN_PATH = "/account/sign-in";
export const CUSTOMER_SIGN_UP_PATH = "/account/sign-up";

/** Admin / staff operations portal. */
export const PORTAL_LOGIN_PATH = "/portal/login";

/** Legacy unified login — redirects to customer sign-in. */
export const LEGACY_LOGIN_PATH = "/login";

const AUTH_SCREEN_PREFIXES = [
  CUSTOMER_SIGN_IN_PATH,
  CUSTOMER_SIGN_UP_PATH,
  PORTAL_LOGIN_PATH,
  LEGACY_LOGIN_PATH,
] as const;

export function isAuthScreen(pathname: string): boolean {
  return AUTH_SCREEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isPortalPath(pathname: string): boolean {
  return pathname.startsWith("/portal");
}

export function isCustomerAccountPath(pathname: string): boolean {
  return pathname.startsWith("/account");
}

/** Login screen for a single role. */
export function getLoginPathForRole(role: UserRole): string {
  return role === "customer" ? CUSTOMER_SIGN_IN_PATH : PORTAL_LOGIN_PATH;
}

/** Login screen when a route allows multiple roles (e.g. mixed guard). */
export function getLoginPathForRoles(roles: UserRole[]): string {
  const onlyCustomer = roles.length > 0 && roles.every((r) => r === "customer");
  if (onlyCustomer) return CUSTOMER_SIGN_IN_PATH;
  const hasPortalRole = roles.some((r) => r === "admin" || r === "staff");
  if (hasPortalRole) return PORTAL_LOGIN_PATH;
  return CUSTOMER_SIGN_IN_PATH;
}
