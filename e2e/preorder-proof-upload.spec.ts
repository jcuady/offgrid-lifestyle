import { appendFileSync, mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// 1x1 PNG - a real image so the browser can decode the preview.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function watch(page: Page) {
  const bad: string[] = [];
  const rpc: number[] = [];
  const errors: string[] = [];
  page.on("response", (r) => {
    const u = r.url();
    if (u.includes("/storage/v1/") && r.status() >= 400) bad.push(`${r.status()} ${u}`);
    if (u.includes("/rpc/og_submit_order_payment")) rpc.push(r.status());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return { bad, rpc, errors };
}

async function reserve(page: Page, opts: { name: string; email?: string; method: "GCash QR" | "BDO QR" }) {
  await page.goto("/pre-order/social-club");
  const accept = page.getByRole("button", { name: /accept all/i });
  if (await accept.isVisible().catch(() => false)) await accept.click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByPlaceholder(/Your Full Name/i).fill(opts.name);
  await page.getByPlaceholder(/Mobile Number/i).fill("09171234567");
  if (opts.email) await page.getByPlaceholder(/Email Address/i).fill(opts.email);
  await page.getByRole("button", { name: new RegExp(opts.method, "i") }).click();
  await page.getByRole("button", { name: /Confirm Pre-Order/i }).click();
  await expect(page.getByText(/Pre-Order Confirmed/i)).toBeVisible({ timeout: 30_000 });
  const id = (await page.getByText(/PRE-2026-\d{4}/).first().innerText()).match(/PRE-2026-\d{4}/)![0];
  mkdirSync("test-results", { recursive: true });
  appendFileSync("test-results/preorder-proof-ids.txt", `${id}\n`);
  return id;
}

async function submitScreenshot(page: Page, ref?: string) {
  await page.locator("#payment-proof-file").setInputFiles({ name: "receipt.png", mimeType: "image/png", buffer: PNG });
  if (ref) await page.getByPlaceholder(/Ref\. No\./i).fill(ref);
  await page.getByRole("button", { name: /Submit Proof of Payment/i }).click();
  await expect(page.getByText(/Payment Proof Received!/i)).toBeVisible({ timeout: 30_000 });
  const img = page.locator('img[alt="Receipt preview"]');
  await expect(img).toBeVisible();
  expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
}

test.describe("Pre-order proof upload (real screenshot, real database)", () => {
  test("guest + GCash: screenshot and reference are stored, preview loads, no 4xx from storage", async ({ page }) => {
    const w = watch(page);
    const id = await reserve(page, { name: "E2E Guest Gcash", email: "e2e.guest.gcash@example.com", method: "GCash QR" });
    await submitScreenshot(page, "GCASH-E2E-1");
    expect(w.bad, `${id} storage errors`).toEqual([]);
    expect(w.rpc).toEqual([204]);
    expect(w.errors).toEqual([]);
  });

  test("guest + BDO: screenshot only, then switch to GCash persists", async ({ page }) => {
    const w = watch(page);
    await reserve(page, { name: "E2E Guest Bdo", email: "e2e.guest.bdo@example.com", method: "BDO QR" });
    await page.getByRole("button", { name: "GCash QR" }).click();
    await expect(page.getByAltText(/GCash QR/i)).toBeVisible();
    await submitScreenshot(page);
    expect(w.bad).toEqual([]);
    // method switch + proof = two RPC calls, both accepted
    expect(w.rpc).toEqual([204, 204]);
    expect(w.errors).toEqual([]);
  });

  test("signed-in customer + BDO: screenshot stored under own order", async ({ page }) => {
    await page.goto("/account/sign-in");
    await page.fill('input[autocomplete="email"]', "customer@offgrid.test");
    await page.fill('input[type="password"]', "offgrid123");
    await page.locator('input[type="password"]').press("Enter");
    await page.waitForURL((u) => !u.pathname.includes("sign-in"), { timeout: 30_000 });

    const w = watch(page);
    await reserve(page, { name: "E2E Customer Bdo", method: "BDO QR" });
    await submitScreenshot(page, "BDO-E2E-1");
    expect(w.bad).toEqual([]);
    expect(w.rpc).toEqual([204]);
    expect(w.errors).toEqual([]);
  });

  test("a rejected upload is reported to the user, never shown as received", async ({ page }) => {
    await reserve(page, { name: "E2E Guest Fail", email: "e2e.guest.fail@example.com", method: "GCash QR" });
    await page.route("**/storage/v1/object/payment-proofs/**", (route) =>
      route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "denied" }) }),
    );
    await page.locator("#payment-proof-file").setInputFiles({ name: "receipt.png", mimeType: "image/png", buffer: PNG });
    await page.getByRole("button", { name: /Submit Proof of Payment/i }).click();
    await expect(page.getByText(/Could not upload your screenshot/i)).toBeVisible();
    await expect(page.getByText(/Payment Proof Received!/i)).toHaveCount(0);
  });
});
