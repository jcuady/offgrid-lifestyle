import { expect, test } from "@playwright/test";

test.describe("Pre-Order Exclusive QR Payment Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss any cookie / consent banner if present
    await page.goto("/pre-order/social-club");
    const accept = page.getByRole("button", { name: /accept all/i });
    if (await accept.isVisible().catch(() => false)) {
      await accept.click();
    }
  });

  test("pre-order page offers GCash and BDO QR, with PayMongo completely removed", async ({ page }) => {
    await expect(page).toHaveURL(/\/pre-order\/social-club/);
    await expect(page.getByText(/THE SOCIAL CLUB COLLECTION/i).first()).toBeVisible();

    // Verify GCash QR option is present
    const gcashOption = page.getByRole("button", { name: /GCash QR/i });
    await expect(gcashOption).toBeVisible();

    // Verify BDO QR option is present
    const bdoOption = page.getByRole("button", { name: /BDO QR/i });
    await expect(bdoOption).toBeVisible();

    // Verify PayMongo is strictly absent from pre-orders
    await expect(page.getByText(/PayMongo/i)).not.toBeVisible();
  });

  test("reserves pre-order with GCash QR and submits proof of payment", async ({ page }) => {
    // Select size L (default is L or click M)
    await page.getByRole("button", { name: "M", exact: true }).click();

    // Fill contact details
    await page.getByPlaceholder(/Your Full Name/i).fill("Maria Santos");
    await page.getByPlaceholder(/Mobile Number/i).fill("09171234567");
    await page.getByPlaceholder(/Email Address/i).fill("maria.santos@example.com");

    // Select GCash QR
    await page.getByRole("button", { name: /GCash QR/i }).click();

    // Submit pre-order reservation
    await page.getByRole("button", { name: /Confirm Pre-Order/i }).click();

    // Expect Pre-Order Confirmed screen with PRE- order ID
    await expect(page.getByText(/Pre-Order Confirmed/i)).toBeVisible();
    await expect(page.getByText(/PRE-2026-/i).first()).toBeVisible();

    // Expect GCash QR details to be rendered
    await expect(page.getByAltText(/GCash QR/i)).toBeVisible();
    await expect(page.getByText(/0917 147 0418/i)).toBeVisible();
    await expect(page.getByText(/DO\*\*\*\*C KE\*\*\*\*H D\./i)).toBeVisible();

    // Verify Download QR link is present
    await expect(page.getByRole("link", { name: /Download \/ Save QR/i })).toBeVisible();

    // Submit payment reference
    const refInput = page.getByPlaceholder(/GCash Ref\. No\./i);
    await expect(refInput).toBeVisible();
    await refInput.fill("GCASH-99881122");

    await page.getByRole("button", { name: /Submit Proof of Payment/i }).click();

    // Expect transition to visual submitted state
    await expect(page.getByText(/Payment Proof Received!/i)).toBeVisible();
    await expect(page.getByText(/Pending Verification/i)).toBeVisible();
    await expect(page.getByText(/GCASH-99881122/i)).toBeVisible();
  });

  test("reserves pre-order with BDO QR and switches payment channels on confirmation", async ({ page }) => {
    // Fill contact details
    await page.getByPlaceholder(/Your Full Name/i).fill("Carlos Dalisay");
    await page.getByPlaceholder(/Mobile Number/i).fill("09187654321");
    await page.getByPlaceholder(/Email Address/i).fill("carlos.dalisay@example.com");

    // Select BDO QR
    await page.getByRole("button", { name: /BDO QR/i }).click();

    // Submit pre-order reservation
    await page.getByRole("button", { name: /Confirm Pre-Order/i }).click();

    // Expect Pre-Order Confirmed screen
    await expect(page.getByText(/Pre-Order Confirmed/i)).toBeVisible();
    await expect(page.getByText(/PRE-2026-/i).first()).toBeVisible();

    // Expect BDO QR and Account details
    await expect(page.getByAltText(/BDO QR/i)).toBeVisible();
    await expect(page.getByText(/011340033559/i).first()).toBeVisible();
    await expect(page.getByText(/OGLifestylePH/i).first()).toBeVisible();

    // Switch to GCash QR via tab
    await page.getByRole("button", { name: "GCash QR" }).click();
    await expect(page.getByAltText(/GCash QR/i)).toBeVisible();
    await expect(page.getByText(/0917 147 0418/i).first()).toBeVisible();

    // Switch back to BDO QR
    await page.getByRole("button", { name: "BDO QR" }).click();
    await expect(page.getByAltText(/BDO QR/i)).toBeVisible();
    await expect(page.getByText(/011340033559/i).first()).toBeVisible();
  });

  test("regression check: standard retail shop preserves standard checkout flow", async ({ page }) => {
    // Navigate to shop
    await page.goto("/shop");
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.locator("header")).toBeVisible();

    // Verify cart preview dropdown opens
    await page.getByRole("button", { name: "Cart" }).click();
    await expect(page.getByText(/Cart Preview/i)).toBeVisible();
  });
});
