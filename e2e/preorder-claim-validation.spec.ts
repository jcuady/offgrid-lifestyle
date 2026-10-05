import { expect, test } from "@playwright/test";

test.describe("Pre-Order In-Person Claim & Admin Validation Flow", () => {
  test("end-to-end: customer places preorder -> sees claim pass -> staff verifies & hands over -> receipt marks redeemed", async ({
    page,
  }) => {
    // 1. Customer visits pre-order page
    await page.goto("/pre-order/social-club");

    const accept = page.getByRole("button", { name: /accept all/i });
    if (await accept.isVisible().catch(() => false)) {
      await accept.click();
    }

    await expect(page.getByText(/THE SOCIAL CLUB COLLECTION/i).first()).toBeVisible();

    // Select Size XL
    await page.getByRole("button", { name: "XL", exact: true }).click();

    // Fill in customer details with dedicated e2e test email
    const testEmail = `e2e-claim-test-${Date.now()}@example.com`;
    const customerName = "Juan Claim Tester";
    await page.getByPlaceholder(/Your Full Name/i).fill(customerName);
    await page.getByPlaceholder(/Mobile Number/i).fill("09170001111");
    await page.getByPlaceholder(/Email Address/i).fill(testEmail);

    // Select BDO QR
    await page.getByRole("button", { name: /BDO QR/i }).click();

    // Submit reservation
    await page.getByRole("button", { name: /Confirm Pre-Order/i }).click();

    // Verify confirmation
    await expect(page.getByText(/Pre-Order Confirmed/i)).toBeVisible();
    const orderIdElement = page.getByText(/PRE-2026-/i).first();
    await expect(orderIdElement).toBeVisible();
    const orderIdText = (await orderIdElement.textContent()) || "";
    const orderIdMatch = orderIdText.match(/PRE-2026-[A-Z0-9]+/);
    expect(orderIdMatch).not.toBeNull();
    const orderId = orderIdMatch![0];

    // Optional: submit a payment ref
    const refInput = page.getByPlaceholder(/Ref\. No\./i);
    await refInput.fill("BDO-CLAIM-TEST-12345");
    await page.getByRole("button", { name: /Submit Proof of Payment/i }).click();
    await expect(page.getByText(/Payment Proof Received!/i)).toBeVisible();

    // 2. Customer navigates to Order Status / Digital Claim Pass
    await page.goto(`/order-status?id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(testEmail)}`);
    await expect(page.getByText(orderId).first()).toBeVisible();

    // Verify Digital Claim Pass is rendered
    await expect(page.getByText(/Pre-Order Claim Pass/i)).toBeVisible();
    await expect(page.getByText(/Staff Scan to Validate/i)).toBeVisible();
    await expect(page.getByText(/Ready for Pickup/i)).toBeVisible();
    await expect(page.getByText(/Pickup Partner Venue/i)).toBeVisible();

    // 3. Staff logs in to Operations Portal
    await page.goto("/portal/login");
    await page.getByPlaceholder(/your\.email@example\.com/i).fill("staff@offgrid.test");
    await page.getByPlaceholder(/Your password/i).fill("offgrid123");
    await page.getByRole("button", { name: /Sign in to portal/i }).click();
    await expect(page).toHaveURL(/\/portal\/staff/);

    // Staff opens order via QR validation link
    await page.goto(`/portal/ops/orders/${encodeURIComponent(orderId)}`);

    // Verify in-person claiming details
    await expect(page.getByText(/In-Person Claiming Details/i)).toBeVisible();
    await expect(page.getByText(/Waiting for Pickup/i)).toBeVisible();

    // Trigger Handover Modal
    const handoverBtn = page.getByRole("button", { name: /Verify & Hand Over Items/i });
    await expect(handoverBtn).toBeVisible();
    await handoverBtn.click();

    // Verify Handover Checklist Modal
    await expect(page.getByText(/Pre-Order Claim Verification/i)).toBeVisible();
    await expect(page.getByText("Handover Checklist", { exact: true })).toBeVisible();
    await expect(page.getByText(/Size: XL/i)).toBeVisible();

    // Fill in Handover details
    const claimantField = page.getByPlaceholder(/Authorized representative/i);
    await claimantField.fill("Juan Claim Tester (Self)");

    const notesField = page.getByPlaceholder(/Student ID verified/i);
    await notesField.fill("Student ID verified at UP Diliman booth");

    // Click Confirm Handover & Claim
    const confirmClaimBtn = page.getByRole("button", { name: /Confirm Handover & Claim/i });
    await expect(confirmClaimBtn).toBeEnabled();
    await confirmClaimBtn.click();

    // 4. Verify Ops Portal updates to Claimed
    await expect(page.getByText(/Claimed/i).first()).toBeVisible();
    await expect(page.getByText(/Juan Claim Tester \(Self\)/i).first()).toBeVisible();
    await expect(page.getByText(/Student ID verified at UP Diliman booth/i).first()).toBeVisible();

    // 5. Customer views receipt again -> updates to Claimed & Redeemed
    await page.goto(`/order-status?id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(testEmail)}`);
    await expect(page.getByText(/Pre-Order Claimed & Redeemed/i)).toBeVisible();
    await expect(page.getByText(/Redeemed/i).first()).toBeVisible();
    await expect(page.getByText(/Juan Claim Tester \(Self\)/i).first()).toBeVisible();
    await expect(page.getByText(/Student ID verified at UP Diliman booth/i).first()).toBeVisible();
  });
});
