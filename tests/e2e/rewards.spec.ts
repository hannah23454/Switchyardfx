import { test, expect, type Page } from '@playwright/test';

// The rewards feature is a localStorage-only prototype: a fresh browser context starts from the
// seeded demo data, so each test is isolated without a backend.
async function gotoRewards(page: Page) {
  await page.goto('/rewards', { waitUntil: 'commit' });
  await expect(page.getByTestId('rewards-heading')).toBeVisible({ timeout: 15_000 });
}

test.describe('SwitchYard Rewards', () => {
  test('registration needs staff approval before sign-in unlocks the member dashboard', async ({ page }) => {
    await gotoRewards(page);
    const email = `tester+${Date.now()}@example.com.au`;
    const password = 'secret123';

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
    await page.getByTestId('rewards-admin-toggle').click();
    await page.getByTestId('rewards-admin-email').fill('admin@switchyardfx.com.au');
    await page.getByTestId('rewards-admin-password').fill('switchyard');
    await page.getByTestId('rewards-admin-submit').click();
    await expect(page.getByTestId('rewards-admin-heading')).toBeVisible();
    const registration = page.getByTestId('rewards-admin-registration').filter({ hasText: email });
    await registration.getByTestId('rewards-approve-user').click();
    await expect(page.getByTestId('rewards-admin-registration').filter({ hasText: email })).toHaveCount(0);
    await page.getByTestId('rewards-admin-signout').click();

    // The approved member can now sign in and see the points tally.
    await page.getByTestId('rewards-signin-email').fill(email);
    await page.getByTestId('rewards-signin-password').fill(password);
    await page.getByTestId('rewards-signin-submit').click();
    await expect(page.getByTestId('rewards-dashboard-heading')).toBeVisible();
    await expect(page.getByTestId('rewards-points-accrued')).toContainText('12,500');
    await expect(page.getByTestId('rewards-points-vested')).toContainText('12,500');

    // Redeem a reward and upload a points voucher.
    await page.getByTestId('rewards-request-submit').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
    await page.getByTestId('rewards-upload-file').setInputFiles({ name: 'activity-oct.pdf', mimeType: 'application/pdf', buffer: Buffer.from('voucher') });
    await page.getByTestId('rewards-upload-points').fill('3000');
    await page.getByTestId('rewards-upload-submit').click();
    await expect(page.getByText(/uploaded/i)).toBeVisible();
  });
});
