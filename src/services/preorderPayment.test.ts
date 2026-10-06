import { beforeEach, describe, expect, it, vi } from "vitest";

const upload = vi.fn();
const rpc = vi.fn();

vi.mock("@/src/lib/supabase", () => ({
  supabase: {
    storage: { from: () => ({ upload }) },
    rpc: (...args: unknown[]) => rpc(...args),
  },
}));
vi.mock("@/src/lib/notifications", () => ({ notifyStaffOrderEvent: vi.fn() }));
vi.mock("@/src/services/emailService", () => ({ sendOrderReceiptEmail: vi.fn() }));

import { submitPreorderPaymentProof, updatePreorderPaymentMethod } from "./preorderService";
import { usePortalStore } from "@/src/store/usePortalStore";

const ORDER_ID = "PRE-2026-7005";

function seedOrder(paymentMethod: "gcash" | "bdo" = "gcash") {
  usePortalStore.setState({
    retailOrders: [
      {
        id: ORDER_ID,
        type: "retail",
        channel: "shop",
        status: "pending_deposit",
        paymentStatus: "unpaid",
        paymentMethod,
        paymentProvider: "manual",
        paymentProviderRef: null,
        customerId: null,
        lines: [],
        subtotal: { amount: 760, currency: "PHP" },
        shipping: { amount: 0, currency: "PHP" },
        tax: { amount: 0, currency: "PHP" },
        total: { amount: 760, currency: "PHP" },
        shippingInfo: null,
        customerName: "Joax",
        customerEmail: "joax@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  });
}

const png = () => new File([new Uint8Array([1, 2, 3])], "receipt.PNG", { type: "image/png" });

describe("submitPreorderPaymentProof", () => {
  beforeEach(() => {
    upload.mockReset();
    rpc.mockReset();
    seedOrder();
  });

  it("stores a bucket-qualified reference (not a raw path) through the RPC", async () => {
    upload.mockResolvedValue({ data: { path: `${ORDER_ID}/1-proof.png` }, error: null });
    rpc.mockResolvedValue({ error: null });

    const res = await submitPreorderPaymentProof({
      orderId: ORDER_ID,
      email: "joax@example.com",
      file: png(),
      referenceNumber: " 123 ",
    });

    expect(res.proofUrl).toBe(`payment-proofs:${ORDER_ID}/1-proof.png`);
    expect(rpc).toHaveBeenCalledWith("og_submit_order_payment", {
      p_order_id: ORDER_ID,
      p_email: "joax@example.com",
      p_payment_method: null,
      p_proof_ref: `payment-proofs:${ORDER_ID}/1-proof.png`,
      p_reference: "123",
    });
    // never overwrite an existing proof, and the extension is normalised
    const [path, , opts] = upload.mock.calls[0];
    expect(path).toMatch(new RegExp(`^${ORDER_ID}/\\d+-proof\\.png$`));
    expect(opts).toMatchObject({ upsert: false });
  });

  it("fails loudly when the upload is rejected instead of reporting success", async () => {
    upload.mockResolvedValue({ data: null, error: { message: "new row violates row-level security policy" } });

    await expect(
      submitPreorderPaymentProof({ orderId: ORDER_ID, email: "joax@example.com", file: png() }),
    ).rejects.toThrow(/upload/i);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("fails loudly when the order cannot be updated", async () => {
    rpc.mockResolvedValue({ error: { message: "Order not found or access denied" } });

    await expect(
      submitPreorderPaymentProof({ orderId: ORDER_ID, email: "joax@example.com", referenceNumber: "ABC" }),
    ).rejects.toThrow(/access denied/i);
    expect(usePortalStore.getState().retailOrders[0].paymentProviderRef).toBeNull();
  });

  it("accepts a reference number without a screenshot", async () => {
    rpc.mockResolvedValue({ error: null });

    const res = await submitPreorderPaymentProof({
      orderId: ORDER_ID,
      email: "joax@example.com",
      referenceNumber: "BDO-REF-998877",
    });

    expect(upload).not.toHaveBeenCalled();
    expect(res).toMatchObject({ success: true, proofUrl: null, referenceNumber: "BDO-REF-998877" });
    expect(usePortalStore.getState().retailOrders[0].paymentProviderRef).toBe("BDO-REF-998877");
  });
});

describe("updatePreorderPaymentMethod", () => {
  beforeEach(() => {
    rpc.mockReset();
    seedOrder("gcash");
  });

  it("persists the switch through the RPC and mirrors it locally", async () => {
    rpc.mockResolvedValue({ error: null });

    await updatePreorderPaymentMethod(ORDER_ID, "bdo");

    expect(rpc).toHaveBeenCalledWith("og_submit_order_payment", {
      p_order_id: ORDER_ID,
      p_email: "joax@example.com",
      p_payment_method: "bdo",
      p_proof_ref: null,
      p_reference: null,
    });
    expect(usePortalStore.getState().retailOrders[0].paymentMethod).toBe("bdo");
  });

  it("keeps the old method and throws when the database refuses", async () => {
    rpc.mockResolvedValue({ error: { message: "Order not found or access denied" } });

    await expect(updatePreorderPaymentMethod(ORDER_ID, "bdo")).rejects.toThrow(/access denied/i);
    expect(usePortalStore.getState().retailOrders[0].paymentMethod).toBe("gcash");
  });
});
