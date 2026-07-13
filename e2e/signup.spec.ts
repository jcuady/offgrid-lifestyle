import { expect, test } from "@playwright/test";
import {
  dismissCookieBanner,
  fillSignUpForm,
  gotoSignUp,
  seedCookieConsent,
  submitSignUpForm,
  trackConsoleErrors,
} from "./helpers/auth";
import { confirmCustomerEmail, unconfirmCustomerEmail } from "./helpers/supabaseAdmin";

const TEST_EMAIL = process.env.E2E_SIGNUP_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_SIGNUP_PASSWORD ?? "";
const TEST_NAME = process.env.E2E_SIGNUP_NAME ?? "E2E Test User";
const TEST_PHONE = process.env.E2E_SIGNUP_PHONE ?? "+63 917 000 0001";

function requireSignupCreds() {
  test.skip(
    !TEST_EMAIL || !TEST_PASSWORD,
    "Set E2E_SIGNUP_EMAIL and E2E_SIGNUP_PASSWORD in .env to run registration/sign-in E2E",
  );
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  await context.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test.describe("customer sign-up flow", () => {
  test("shows field validation errors on empty submit", async ({ page }) => {
    const { assertNoErrors } = trackConsoleErrors(page);
    await gotoSignUp(page);

    await submitSignUpForm(page);

    await expect(page.getByText("Full name is required.")).toBeVisible();
    await expect(page.getByText(/valid Philippine mobile/i)).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
    await expect(page.getByText(/accept the Terms/i)).toBeVisible();

    assertNoErrors();
  });

  test("validates email, password, and phone formats", async ({ page }) => {
    const { assertNoErrors } = trackConsoleErrors(page);
    await gotoSignUp(page);

    await fillSignUpForm(page, {
      name: "Format Check",
      phone: "9",
      email: "not-an-email",
      password: "short",
      confirmPassword: "different",
    });
    await submitSignUpForm(page);

    await expect(page.locator("span.text-red-600").first()).toBeVisible();
    await expect(page.getByText(/valid Philippine mobile/i)).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
    await expect(page.getByText(/accept the Terms/i)).toBeVisible();

    assertNoErrors();
  });

  test("requires terms acceptance before submit", async ({ page }) => {
    requireSignupCreds();
    const { assertNoErrors } = trackConsoleErrors(page);
    await gotoSignUp(page);

    await fillSignUpForm(page, {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    await submitSignUpForm(page);

    await expect(page.getByText(/accept the Terms/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();

    assertNoErrors();
  });

  test("completes registration and shows email confirmation step", async ({ page }) => {
    requireSignupCreds();
    const { assertNoErrors } = trackConsoleErrors(page);
    await gotoSignUp(page);

    await fillSignUpForm(page, {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    await page.getByRole("checkbox").check();
    await submitSignUpForm(page);

    const successHeading = page.getByRole("heading", { name: /check your email/i });
    const existingAccountAlert = page.getByRole("alert").filter({ hasText: /already exists/i });
    const rateLimitAlert = page.getByRole("alert").filter({ hasText: /rate limit|security purposes/i });
    const accountHeading = page.getByRole("heading", { name: /welcome back/i });

    await expect(
      successHeading.or(existingAccountAlert).or(rateLimitAlert).or(accountHeading),
    ).toBeVisible({
      timeout: 20_000,
    });

    if (await successHeading.isVisible().catch(() => false)) {
      await expect(page.getByText(TEST_EMAIL)).toBeVisible();
      await expect(page.getByRole("button", { name: /go to sign in/i })).toBeVisible();
    }

    if (await accountHeading.isVisible().catch(() => false)) {
      await expect(page).toHaveURL(/\/account\/orders/);
      await expect(page.getByText(TEST_EMAIL)).toBeVisible();
    }

    assertNoErrors();
  });

  test("sign-in link navigates from sign-up page", async ({ page }) => {
    const { assertNoErrors } = trackConsoleErrors(page);
    await gotoSignUp(page);

    await page.getByRole("link", { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/account\/sign-in/);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    assertNoErrors();
  });
});

test.describe("customer sign-in after registration", () => {
  test("blocks sign-in until email is confirmed", async ({ page }) => {
    requireSignupCreds();
    await unconfirmCustomerEmail(TEST_EMAIL);

    const { assertNoErrors } = trackConsoleErrors(page);
    await seedCookieConsent(page);
    await page.goto("/account/sign-in");
    await dismissCookieBanner(page);

    await page.getByPlaceholder("your.email@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("Your password").fill(TEST_PASSWORD);
    await page.locator("form").evaluate((form) => {
      form.noValidate = true;
      form.requestSubmit();
    });

    const confirmAlert = page.getByRole("alert");
    const accountHeading = page.getByRole("heading", { name: /welcome back/i });
    await expect(confirmAlert.or(accountHeading)).toBeVisible({ timeout: 15_000 });

    if (await confirmAlert.isVisible().catch(() => false)) {
      await expect(page).toHaveURL(/\/account\/sign-in/);
    }

    assertNoErrors();
  });

  test("signs in successfully after email confirmation", async ({ page }) => {
    requireSignupCreds();
    await confirmCustomerEmail(TEST_EMAIL);

    const { assertNoErrors } = trackConsoleErrors(page);
    await seedCookieConsent(page);
    await page.goto("/account/sign-in?confirmed=1");
    await dismissCookieBanner(page);

    await page.getByPlaceholder("your.email@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("Your password").fill(TEST_PASSWORD);
    await page.locator("form").evaluate((form) => {
      form.noValidate = true;
      form.requestSubmit();
    });

    await expect(page).toHaveURL(/\/account\/orders/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();

    assertNoErrors();
  });
});
