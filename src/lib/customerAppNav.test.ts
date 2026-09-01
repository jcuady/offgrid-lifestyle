import { describe, expect, it } from "vitest";
import {
  CUSTOMER_APP_NAV,
  hidesStorefrontChrome,
  resolveCustomerAppDockSection,
  resolveCustomerAppSection,
  showsCustomerStorefrontDock,
} from "./customerAppNav";
import { AUTH_SESSION_PERSIST } from "./authPersist";

describe("customerAppNav", () => {
  it("exposes Shop, Custom, Orders, and Profile as the customer app tabs", () => {
    expect(CUSTOMER_APP_NAV.map((item) => item.id)).toEqual([
      "shop",
      "custom",
      "orders",
      "profile",
    ]);
    expect(CUSTOMER_APP_NAV.map((item) => item.to)).toEqual([
      "/account/shop",
      "/account/custom",
      "/account/orders",
      "/account/profile",
    ]);
  });

  it("resolves the active tab from account paths including order detail", () => {
    expect(resolveCustomerAppSection("/account/shop")).toBe("shop");
    expect(resolveCustomerAppSection("/account/custom")).toBe("custom");
    expect(resolveCustomerAppSection("/account/orders")).toBe("orders");
    expect(resolveCustomerAppSection("/account/orders/OG-2026-2827")).toBe("orders");
    expect(resolveCustomerAppSection("/account/profile")).toBe("profile");
    expect(resolveCustomerAppSection("/account")).toBe("orders");
    expect(resolveCustomerAppSection("/shop")).toBe(null);
  });

  it("hides storefront chrome on customer app pages but not auth or marketing", () => {
    expect(hidesStorefrontChrome("/account/shop")).toBe(true);
    expect(hidesStorefrontChrome("/account/custom")).toBe(true);
    expect(hidesStorefrontChrome("/account/orders")).toBe(true);
    expect(hidesStorefrontChrome("/account/profile")).toBe(true);
    expect(hidesStorefrontChrome("/account/orders/abc")).toBe(true);
    expect(hidesStorefrontChrome("/account/sign-in")).toBe(true);
    expect(hidesStorefrontChrome("/portal/admin")).toBe(true);
    expect(hidesStorefrontChrome("/shop")).toBe(false);
    expect(hidesStorefrontChrome("/")).toBe(false);
  });

  it("keeps the dock on storefront shop and custom for signed-in customers only", () => {
    expect(resolveCustomerAppDockSection("/shop/og-solar-shortsleeve")).toBe("shop");
    expect(resolveCustomerAppDockSection("/custom/order")).toBe("custom");
    expect(showsCustomerStorefrontDock("/custom/order", "customer")).toBe(true);
    expect(showsCustomerStorefrontDock("/account/orders", "customer")).toBe(false);
    expect(showsCustomerStorefrontDock("/shop", "admin")).toBe(false);
    expect(showsCustomerStorefrontDock("/", "customer")).toBe(false);
  });
});

describe("auth session persist", () => {
  it("keeps the GoTrue session across reloads", () => {
    expect(AUTH_SESSION_PERSIST.persistSession).toBe(true);
    expect(AUTH_SESSION_PERSIST.autoRefreshToken).toBe(true);
  });
});
