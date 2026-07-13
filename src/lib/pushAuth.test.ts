import { describe, expect, it } from "vitest";
import {
  RECENT_GUEST_ORDER_MS,
  canDispatchOperationalPush,
  isRecentGuestOrder,
  operationalPushUrl,
  portalOrderDetailPath,
} from "./pushAuth";

const NOW = new Date("2026-06-30T12:00:00.000Z").getTime();
const RECENT_CREATED = new Date(NOW - 2 * 60 * 1000).toISOString();
const STALE_CREATED = new Date(NOW - RECENT_GUEST_ORDER_MS - 1000).toISOString();

describe("pushAuth", () => {
  describe("isRecentGuestOrder", () => {
    it("allows guest orders within the time window", () => {
      expect(isRecentGuestOrder(null, RECENT_CREATED, NOW)).toBe(true);
    });

    it("rejects guest orders older than the window", () => {
      expect(isRecentGuestOrder(null, STALE_CREATED, NOW)).toBe(false);
    });

    it("rejects orders with a customer id", () => {
      expect(isRecentGuestOrder("cust-1", RECENT_CREATED, NOW)).toBe(false);
    });
  });

  describe("canDispatchOperationalPush", () => {
    it("allows staff and admin", () => {
      expect(
        canDispatchOperationalPush({
          orderCustomerId: "other",
          orderCreatedAt: STALE_CREATED,
          alertType: "new_retail_order",
          callerPortalId: "staff-1",
          callerRole: "staff",
          nowMs: NOW,
        }),
      ).toBe(true);
    });

    it("allows recent guest checkout without a signed-in portal user", () => {
      expect(
        canDispatchOperationalPush({
          orderCustomerId: null,
          orderCreatedAt: RECENT_CREATED,
          alertType: "new_retail_order",
          callerPortalId: null,
          callerRole: null,
          nowMs: NOW,
        }),
      ).toBe(true);
    });

    it("allows customers uploading payment proof for their order", () => {
      expect(
        canDispatchOperationalPush({
          orderCustomerId: "cust-1",
          orderCreatedAt: STALE_CREATED,
          alertType: "payment_proof",
          callerPortalId: "cust-1",
          callerRole: "customer",
          nowMs: NOW,
        }),
      ).toBe(true);
    });

    it("denies customers fabricating new-order alerts for their own order", () => {
      expect(
        canDispatchOperationalPush({
          orderCustomerId: "cust-1",
          orderCreatedAt: RECENT_CREATED,
          alertType: "new_retail_order",
          callerPortalId: "cust-1",
          callerRole: "customer",
          nowMs: NOW,
        }),
      ).toBe(false);
    });

    it("denies recent guests fabricating payment_proof alerts", () => {
      expect(
        canDispatchOperationalPush({
          orderCustomerId: null,
          orderCreatedAt: RECENT_CREATED,
          alertType: "payment_proof",
          callerPortalId: null,
          callerRole: null,
          nowMs: NOW,
        }),
      ).toBe(false);
    });

    it("denies unrelated customers", () => {
      expect(
        canDispatchOperationalPush({
          orderCustomerId: "cust-1",
          orderCreatedAt: RECENT_CREATED,
          alertType: "new_retail_order",
          callerPortalId: "cust-2",
          callerRole: "customer",
          nowMs: NOW,
        }),
      ).toBe(false);
    });

    it("denies stale guest orders", () => {
      expect(
        canDispatchOperationalPush({
          orderCustomerId: null,
          orderCreatedAt: STALE_CREATED,
          alertType: "new_retail_order",
          callerPortalId: null,
          callerRole: null,
          nowMs: NOW,
        }),
      ).toBe(false);
    });
  });

  describe("portalOrderDetailPath", () => {
    it("routes each role to the correct operations path", () => {
      expect(portalOrderDetailPath("OG-1", "admin")).toBe("/portal/admin/orders/OG-1");
      expect(portalOrderDetailPath("OG-1", "staff")).toBe("/portal/staff/orders/OG-1");
      expect(portalOrderDetailPath("OG-1", "customer")).toBe("/portal/orders/OG-1");
      expect(portalOrderDetailPath("OG-1", null)).toBe("/portal/orders/OG-1");
    });
  });

  describe("operationalPushUrl", () => {
    it("uses the neutral redirect path for staff push deep links", () => {
      expect(operationalPushUrl("OG-99")).toBe("/portal/orders/OG-99");
    });
  });
});
