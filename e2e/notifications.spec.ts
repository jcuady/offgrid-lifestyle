import { expect, test } from "@playwright/test";

test.describe("public shell", () => {
  test("homepage loads with navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OFF GRID/i);
    await expect(page.locator("header")).toBeVisible();
  });

  test("about page is reachable from marketing nav", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /about/i }).first().click();
    await expect(page).toHaveURL(/\/about/);
  });

  test("portal login screen loads for staff deep links", async ({ page }) => {
    await page.goto("/portal/orders/TEST-ORDER");
    await expect(page).toHaveURL(/\/portal\/login/);
  });
});

test.describe("notification UI smoke", () => {
  test("cookie banner can be accepted before push prompt", async ({ page }) => {
    await page.goto("/");
    const accept = page.getByRole("button", { name: /accept all/i });
    if (await accept.isVisible().catch(() => false)) {
      await accept.click();
    }
    // Push prompt may appear after consent; ensure page remains interactive.
    await expect(page.locator("header")).toBeVisible();
  });
});
