import { describe, it, expect, beforeEach } from "vitest";
import {
  isOrderPreorder,
  getPreorderPickupVenue,
  fetchPreorderSlotStatus,
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
    it("extracts venue, claim status, claimant name, and notes when fulfillmentType is pickup", () => {
      const shipping = {
        fulfillmentType: "pickup",
        pickupVenue: "kado_kohi",
        pickupVenueLabel: "Kado Kohi - Marikina Branch",
        claimed: true,
        claimedAt: "2026-10-15T10:00:00Z",
        claimedBy: "Staff Maria",
        claimantName: "Pedro Penduko (Brother)",
        claimNotes: "Student ID verified",
      };
      const result = getPreorderPickupVenue(shipping);
      expect(result.isPickup).toBe(true);
      expect(result.venueId).toBe("kado_kohi");
      expect(result.venueLabel).toBe("Kado Kohi - Marikina Branch");
      expect(result.claimed).toBe(true);
      expect(result.claimedAt).toBe("2026-10-15T10:00:00Z");
      expect(result.claimedBy).toBe("Staff Maria");
      expect(result.claimantName).toBe("Pedro Penduko (Brother)");
      expect(result.claimNotes).toBe("Student ID verified");
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
});
