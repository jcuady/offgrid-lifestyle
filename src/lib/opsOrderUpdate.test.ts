import { describe, expect, it, vi, beforeEach } from "vitest";
import type { CustomOrderDraft } from "@/src/types/commerce";
import {
  CUSTOM_ORDER_SUBMIT_PHASES,
  mergeCustomOrderDraftWithFiles,
} from "@/src/lib/customOrderSubmit";

const updateOrderField = vi.fn();
const notifyCustomerOrderEvent = vi.fn();

vi.mock("@/src/services/orderService", () => ({
  supabaseOrderService: {
    updateOrderField: (...args: unknown[]) => updateOrderField(...args),
  },
}));

vi.mock("@/src/lib/customerNotifications", () => ({
  notifyCustomerOrderEvent: (...args: unknown[]) => notifyCustomerOrderEvent(...args),
}));

describe("opsOrderUpdate", () => {
  beforeEach(() => {
    updateOrderField.mockReset();
    notifyCustomerOrderEvent.mockReset();
    updateOrderField.mockResolvedValue(undefined);
  });

  it("documents insert-before-upload submit phases", () => {
    expect(CUSTOM_ORDER_SUBMIT_PHASES).toEqual(["insert_order", "upload_files", "patch_urls"]);
  });

  it("merges uploaded file metadata into the custom order draft", () => {
    const draft: CustomOrderDraft = {
      id: null,
      contactName: "Test User",
      contactEmail: "test@example.com",
      contactPhone: "+639171234567",
      teamOrOrg: "Team A",
      category: "apparel",
      headwearType: null,
      cut: "short_sleeve",
      material: "dri_fit",
      printMethod: "sublimation",
      quantity: 10,
      designFileName: "design.ai",
      designFileKey: "pending:design",
      designFileUrl: null,
      orderSheetFileName: "sheet.xlsx",
      orderSheetFileKey: "pending:sheet",
      orderSheetFileUrl: null,
      designNotes: "",
      shippingInfo: null,
      status: "draft",
      estimatedTotal: null,
      depositRequired: null,
      createdAt: null,
      updatedAt: null,
    };

    const merged = mergeCustomOrderDraftWithFiles(
      draft,
      "CO-2026-1001",
      {
        fullName: "Test User",
        email: "test@example.com",
        phone: "+639171234567",
        address: "123 Main",
        barangay: "Brgy 1",
        city: "Manila",
        province: "Metro Manila",
        region: "NCR",
        zip: "1000",
        latitude: null,
        longitude: null,
        regionCode: "NCR",
        provinceCode: "NCR",
        cityCode: "MNL",
        barangayCode: "BGY1",
      },
      {
        designFileKey: "order:CO-2026-1001:design",
        orderSheetFileKey: "order:CO-2026-1001:sheet",
        designFileUrl: "custom-order-files://CO-2026-1001/design.png",
        orderSheetFileUrl: "custom-order-files://CO-2026-1001/sheet.xlsx",
      },
    );

    expect(merged.id).toBe("CO-2026-1001");
    expect(merged.status).toBe("pending_deposit");
    expect(merged.designFileUrl).toContain("CO-2026-1001");
    expect(merged.orderSheetFileUrl).toContain("CO-2026-1001");
  });

  it("notifies customer after durable status write (admin or staff)", async () => {
    const { persistOrderStatusUpdate } = await import("@/src/lib/opsOrderUpdate");
    const applyStore = vi.fn();
    await persistOrderStatusUpdate({
      orderId: "OG-1",
      previousStatus: "confirmed",
      next: "shipped",
      customerId: "cust-1",
      applyStore,
    });
    expect(updateOrderField).toHaveBeenCalledWith("OG-1", { status: "shipped" });
    expect(notifyCustomerOrderEvent).toHaveBeenCalledWith("cust-1", "OG-1", "shipped");
    expect(applyStore).toHaveBeenCalledWith("shipped");
  });

  it("does not notify when durable status write fails", async () => {
    const { persistOrderStatusUpdate } = await import("@/src/lib/opsOrderUpdate");
    updateOrderField.mockRejectedValueOnce(new Error("db down"));
    const applyStore = vi.fn();
    await expect(
      persistOrderStatusUpdate({
        orderId: "OG-1",
        previousStatus: "confirmed",
        next: "shipped",
        customerId: "cust-1",
        applyStore,
      }),
    ).rejects.toThrow("db down");
    expect(notifyCustomerOrderEvent).not.toHaveBeenCalled();
    expect(applyStore).toHaveBeenLastCalledWith("confirmed");
  });

  it("notifies payment + auto-confirm when payment settles pending_deposit", async () => {
    const { persistOrderPaymentUpdate } = await import("@/src/lib/opsOrderUpdate");
    const applyStore = vi.fn();
    const applyFulfillmentStore = vi.fn();
    await persistOrderPaymentUpdate({
      orderId: "OG-1",
      previousStatus: "unpaid",
      next: "fully_paid",
      customerId: "cust-1",
      previousFulfillmentStatus: "pending_deposit",
      applyStore,
      applyFulfillmentStore,
    });
    expect(applyFulfillmentStore).toHaveBeenCalledWith("confirmed");
    expect(notifyCustomerOrderEvent).toHaveBeenCalledWith("cust-1", "OG-1", "payment_confirmed");
    expect(notifyCustomerOrderEvent).toHaveBeenCalledWith("cust-1", "OG-1", "order_confirmed");
  });
});
