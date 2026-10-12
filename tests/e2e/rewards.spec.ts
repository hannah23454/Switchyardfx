import { test, expect, type Page } from '@playwright/test';

// Runs in either data mode. Mock mode (the dev default) uses the browser-only demo store and its
// demo staff login; against the real backend (VITE_DATA_MODE=api), set REWARDS_ADMIN_EMAIL and
// REWARDS_ADMIN_PASSWORD to the backend's staff credentials. Each test registers a fresh member.
const ADMIN_EMAIL = (process.env.REWARDS_ADMIN_EMAIL ?? 'admin@switchyardfx.com.au').split(',')[0].trim();
const ADMIN_PASSWORD = process.env.REWARDS_ADMIN_PASSWORD ?? 'switchyard';

async function gotoRewards(page: Page) {
  await page.goto('/rewards', { waitUntil: 'commit' });
  await expect(page.getByTestId('rewards-heading')).toBeVisible({ timeout: 15_000 });
}

async function staffSignIn(page: Page) {
  await page.getByTestId('rewards-admin-toggle').click();
  await page.getByTestId('rewards-admin-email').fill(ADMIN_EMAIL);
  await page.getByTestId('rewards-admin-password').fill(ADMIN_PASSWORD);
  await page.getByTestId('rewards-admin-submit').click();
  await expect(page.getByTestId('rewards-admin-heading')).toBeVisible();
}

async function memberSignIn(page: Page, email: string, password: string) {
  await page.getByTestId('rewards-signin-email').fill(email);
  await page.getByTestId('rewards-signin-password').fill(password);
  await page.getByTestId('rewards-signin-submit').click();
  await expect(page.getByTestId('rewards-dashboard-heading')).toBeVisible();
}

test.describe('SwitchYard Rewards', () => {
  test('registration, staff approval, voucher validation and a reward request', async ({ page }) => {
    await gotoRewards(page);
    const email = `tester+${Date.now()}${Math.floor(Math.random() * 1000)}@example.com.au`;
    const password = 'secret-pass-1';
    const fileName = `activity-${Date.now()}.pdf`;

    // A new member applies — the account starts pending SwitchYard approval.
    await page.getByTestId('rewards-tab-register').click();
    await page.getByTestId('rewards-register-name').fill('Test Tester');
    await page.getByTestId('rewards-register-company').fill('Test Co Pty Ltd');
    await page.getByTestId('rewards-register-email').fill(email);
    await page.getByTestId('rewards-register-password').fill(password);
    await page.getByTestId('rewards-register-submit').click();
    await expect(page.getByText(/pending SwitchYard approval/i)).toBeVisible();

    // Sign-in is refused while the account is pending.
    await page.getByTestId('rewards-tab-signin').click();
    await page.getByTestId('rewards-signin-email').fill(email);
    await page.getByTestId('rewards-signin-password').fill(password);
    await page.getByTestId('rewards-signin-submit').click();
    await expect(page.getByText(/still pending/i)).toBeVisible();

    // A staff member signs in and approves the registration.
    await staffSignIn(page);
    const registration = page.getByTestId('rewards-admin-registration').filter({ hasText: email });
    await registration.getByTestId('rewards-approve-user').click();
    await expect(page.getByTestId('rewards-admin-registration').filter({ hasText: email })).toHaveCount(0);
    await page.getByTestId('rewards-admin-signout').click();

    // The approved member signs in to an empty tally and uploads a points voucher.
    await memberSignIn(page, email, password);
    await expect(page.getByTestId('rewards-points-accrued')).toContainText('0');
    await page.getByTestId('rewards-upload-file').setInputFiles({ name: fileName, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n% voucher\n') });
    await page.getByTestId('rewards-upload-points').fill('3000');
    await page.getByTestId('rewards-upload-submit').click();
    await expect(page.getByText(/uploaded/i).first()).toBeVisible();
    await expect(page.getByTestId('rewards-activity-voucher').filter({ hasText: fileName })).toContainText('pending');
    await page.getByTestId('rewards-signout').click();

    // Staff validate the voucher, which credits the points.
    await staffSignIn(page);
    await page.getByTestId('rewards-admin-voucher').filter({ hasText: fileName }).getByTestId('rewards-approve-voucher').click();
    await expect(page.getByTestId('rewards-admin-account').filter({ hasText: email })).toContainText('3,000');
    await page.getByTestId('rewards-admin-signout').click();

    // The member now has 3,000 vested points and requests a reward, which holds its points.
    await memberSignIn(page, email, password);
    await expect(page.getByTestId('rewards-points-accrued')).toContainText('3,000');
    await expect(page.getByTestId('rewards-points-vested')).toContainText('3,000');
    await page.getByTestId('rewards-request-submit').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
    await expect(page.getByTestId('rewards-points-vested')).toContainText('500');
  });
});
