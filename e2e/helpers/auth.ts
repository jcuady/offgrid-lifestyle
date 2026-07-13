import { expect, type Page } from "@playwright/test";

const COOKIE_CONSENT_KEY = "og-cookie-consent";

/** Prevent delayed cookie banner from intercepting form clicks during E2E. */
export async function seedCookieConsent(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    localStorage.setItem(key, "essential-only");
  }, COOKIE_CONSENT_KEY);
}

/** Dismiss marketing cookie banner when present. */
export async function dismissCookieBanner(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.setItem(key, "essential-only");
  }, COOKIE_CONSENT_KEY);

  const dialog = page.getByRole("dialog", { name: /cookie consent/i });
  if (await dialog.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /essential only/i }).click();
    return;
  }

  const accept = page.getByRole("button", { name: /accept all/i });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
  }
}

const IGNORED_CONSOLE_PATTERNS = [
  /favicon/i,
  /manifest/i,
  /service worker/i,
  /Download the React DevTools/i,
  /Failed to load resource.*404/i,
  /Failed to load resource.*429/i,
];

/** Attach listener; call assertNoErrors() after interactions. */
export function trackConsoleErrors(page: Page): { assertNoErrors: () => void } {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!IGNORED_CONSOLE_PATTERNS.some((re) => re.test(text))) {
        errors.push(text);
      }
    }
  });
  page.on("pageerror", (err) => {
    errors.push(err.message);
  });
  return {
    assertNoErrors: () => {
      if (errors.length > 0) {
        throw new Error(`Console errors:\n${errors.join("\n")}`);
      }
    },
  };
}

export async function gotoSignUp(page: Page): Promise<void> {
  await seedCookieConsent(page);
  await page.goto("/account/sign-up");
  await dismissCookieBanner(page);
}

/** Fill sign-up fields using stable placeholder selectors. */
export async function fillSignUpForm(
  page: Page,
  data: { name: string; phone: string; email: string; password: string; confirmPassword?: string },
): Promise<void> {
  const nameInput = page.getByPlaceholder("Your full name");
  await nameInput.fill(data.name);
  await expect(nameInput).toHaveValue(data.name);

  const phoneInput = page.getByPlaceholder("+63 917 000 0000");
  await phoneInput.fill(data.phone);
  const expectedPhone = data.phone.replace(/\D/g, "").length > 0 ? undefined : "";
  if (expectedPhone !== undefined) {
    await expect(phoneInput).not.toHaveValue("");
  }

  const emailInput = page.getByPlaceholder("your.email@example.com");
  await emailInput.fill(data.email);
  await expect(emailInput).toHaveValue(data.email);

  const passwordInput = page.getByPlaceholder("At least 8 characters");
  await passwordInput.fill(data.password);
  await expect(passwordInput).toHaveValue(data.password);

  const confirmInput = page.getByPlaceholder("Re-enter password");
  const confirmPassword = data.confirmPassword ?? data.password;
  await confirmInput.fill(confirmPassword);
  await expect(confirmInput).toHaveValue(confirmPassword);
}

/** Submit sign-up form. */
export async function submitSignUpForm(page: Page): Promise<void> {
  await dismissCookieBanner(page);
  await page.locator("form").evaluate((form) => {
    form.noValidate = true;
    form.requestSubmit();
  });
}
