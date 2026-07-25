/**
 * Navbar stacking — mobile account/cart scrim must stay BELOW the header.
 * If scrimZ >= headerZ, Profile/Orders taps hit the scrim and never navigate
 * (regression: header account dropdown on mobile).
 */
export const NAVBAR_HEADER_Z = 50;
export const NAVBAR_SCRIM_Z = 40;
export const NAVBAR_MOBILE_DRAWER_Z = 40;

export function canClickAccountMenuThroughScrim(
  scrimZ: number = NAVBAR_SCRIM_Z,
  headerZ: number = NAVBAR_HEADER_Z,
): boolean {
  return scrimZ < headerZ;
}

/** Customer header-account destinations (signed-in). */
export const CUSTOMER_ACCOUNT_MENU_PATHS = {
  orders: "/account/orders",
  profile: "/account/profile",
  customOrder: "/custom",
} as const;
