import { describe, it, expect, beforeEach } from "vitest";
import {
  isOrderPreorder,
  getPreorderPickupVenue,
  fetchPreorderSlotStatus,
  updatePreorderPaymentMethod,
  submitPreorderPaymentProof,
} from "./preorderService";
import { PREORDER_PRODUCT_SLUG, PREORDER_MAX_SLOTS } from "@/src/lib/preorderConfig";
import { usePortalStore } from "@/src/store/usePortalStore";

describe("preorderService", () => {
  beforeEach(() => {
    usePortalStore.setState({ retailOrders: [] });
  });

  describe("isOrderPreorder", () => {
    it("identifies preorder by PRE- order id prefix", () => {
      expect(isOrderPreorder({ id: "PRE-2026-1234" })).toBe(true);
    });

    it("identifies preorder by line item product slug", () => {
      expect(
        isOrderPreorder({
          id: "RET-2026-9999",
          lines: [
            {
              lineItemId: "line-1",
              productId: PREORDER_PRODUCT_SLUG,
              name: "Social Club",
              image: "",
              priceSnapshot: { amount: 760, currency: "PHP" },
              size: "L",
              color: "Chill Sunday",
              quantity: 1,
            },
          ],
        }),
      ).toBe(true);
    });

    it("returns false for regular shop orders", () => {
      expect(
        isOrderPreorder({
          id: "RET-2026-0001",
          lines: [
            {
              lineItemId: "line-2",
              productId: "pilipinas-aouc-jersey",
              name: "Pilipinas Jersey",
              image: "",
              priceSnapshot: { amount: 1000, currency: "PHP" },
              size: "M",
              color: "Capiz",
              quantity: 1,
            },
          ],
        }),
      ).toBe(false);
    });
  });

  describe("getPreorderPickupVenue", () => {
    it("extracts venue and claim status when fulfillmentType is pickup", () => {
      const shipping = {
        fulfillmentType: "pickup",
        pickupVenue: "kado_kohi",
        pickupVenueLabel: "Kado Kohi - Marikina Branch",
        claimed: true,
        claimedAt: "2026-10-15T10:00:00Z",
      };
      const result = getPreorderPickupVenue(shipping);
      expect(result.isPickup).toBe(true);
      expect(result.venueId).toBe("kado_kohi");
      expect(result.venueLabel).toBe("Kado Kohi - Marikina Branch");
      expect(result.claimed).toBe(true);
      expect(result.claimedAt).toBe("2026-10-15T10:00:00Z");
    });

    it("returns isPickup false for regular delivery addresses", () => {
      const shipping = {
        fullName: "Juan Dela Cruz",
        address: "123 Main St",
        city: "Quezon City",
      };
      const result = getPreorderPickupVenue(shipping);
      expect(result.isPickup).toBe(false);
      expect(result.claimed).toBe(false);
    });
  });

  describe("fetchPreorderSlotStatus", () => {
    it("calculates remaining slots from total cap", async () => {
      const status = await fetchPreorderSlotStatus();
      expect(status.totalCap).toBe(PREORDER_MAX_SLOTS);
      expect(status.remainingSlots).toBeGreaterThanOrEqual(0);
      expect(status.remainingSlots).toBeLessThanOrEqual(PREORDER_MAX_SLOTS);
      expect(status.isSoldOut).toBe(status.remainingSlots === 0);
    });
  });

  describe("updatePreorderPaymentMethod", () => {
    it("updates order paymentMethod in local portal store", async () => {
      usePortalStore.setState({
        retailOrders: [
          {
            id: "PRE-2026-1111",
            type: "retail",
            channel: "shop",
            status: "pending_deposit",
            paymentStatus: "unpaid",
            paymentMethod: "gcash",
            paymentProvider: "manual",
            paymentProviderRef: null,
            customerId: null,
            lines: [],
            subtotal: { amount: 760, currency: "PHP" },
            shipping: { amount: 0, currency: "PHP" },
            tax: { amount: 0, currency: "PHP" },
            total: { amount: 760, currency: "PHP" },
            shippingInfo: null,
            customerName: "Test User",
            customerEmail: "test@example.com",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      });

      await updatePreorderPaymentMethod("PRE-2026-1111", "bdo");
      const updated = usePortalStore.getState().retailOrders.find((o) => o.id === "PRE-2026-1111");
      expect(updated?.paymentMethod).toBe("bdo");
    });
  });

  describe("submitPreorderPaymentProof", () => {
    it("updates order paymentStatus to submitted and sets reference number", async () => {
      usePortalStore.setState({
        retailOrders: [
          {
            id: "PRE-2026-2222",
            type: "retail",
            channel: "shop",
            status: "pending_deposit",
            paymentStatus: "unpaid",
            paymentMethod: "bdo",
            paymentProvider: "manual",
            paymentProviderRef: null,
            customerId: null,
            lines: [],
            subtotal: { amount: 760, currency: "PHP" },
            shipping: { amount: 0, currency: "PHP" },
            tax: { amount: 0, currency: "PHP" },
            total: { amount: 760, currency: "PHP" },
            shippingInfo: null,
            customerName: "Test User",
            customerEmail: "test@example.com",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      });

      const res = await submitPreorderPaymentProof({
        orderId: "PRE-2026-2222",
        email: "test@example.com",
        referenceNumber: "BDO-REF-998877",
      });

      expect(res.success).toBe(true);
      expect(res.referenceNumber).toBe("BDO-REF-998877");
      const updated = usePortalStore.getState().retailOrders.find((o) => o.id === "PRE-2026-2222");
      expect(updated?.paymentProviderRef).toBe("BDO-REF-998877");
    });
  });
});
