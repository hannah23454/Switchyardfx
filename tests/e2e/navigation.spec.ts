import { test, expect, type Page } from '@playwright/test';

// The header order is Home | Services | Solutions | Resources | About | Contact, and every
// item must land on a real route (no broken links). `marker` is a page element that proves
// the destination actually rendered.
const NAV: [slug: string, path: string, marker: string][] = [
  ['home', '/', 'hero-heading'],
  ['services', '/services', 'services-hero'],
  ['solutions', '/solutions', 'solutions-page-heading'],
  ['resources', '/resources', 'resources-heading'],
  ['about', '/about', 'page-hero-heading'],
  ['contact', '/contact', 'contact-heading'],
];

const EXPECTED = ['Home', 'Services', 'Solutions', 'Resources', 'About', 'Contact'];
const urlFor = (path: string) => new RegExp(path === '/' ? '/$' : path.replace(/\//g, '\\/') + '$');

// Wait until the shell has mounted and the opening splash has cleared the nav.
async function ready(page: Page) {
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.getByTestId('site-header')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('hero-heading')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('landing-intro')).toHaveCount(0, { timeout: 15_000 });
}

test.describe('Header navigation', () => {
  test('desktop nav lists the exact order and routes correctly', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    await ready(page);

    const nav = page.locator('nav[aria-label="Primary navigation"] a');
    await expect(nav).toHaveCount(EXPECTED.length, { timeout: 15_000 });
    expect((await nav.allTextContents()).map((label) => label.trim())).toEqual(EXPECTED);

    for (const [slug, path, marker] of NAV) {
      const link = page.getByTestId(`header-nav-${slug}`);
      await expect(link).toHaveAttribute('href', path);
      await link.click();
      await expect(page).toHaveURL(urlFor(path));
      await expect(page.getByTestId(marker)).toBeVisible({ timeout: 15_000 });
    }
  });

  test('mobile menu lists the exact order and routes correctly', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await ready(page);

    await page.getByTestId('mobile-menu-open-button').click();
    const nav = page.locator('[data-testid="mobile-menu"] nav a:not([data-testid="mobile-nav-login"])');
    await expect(nav).toHaveCount(EXPECTED.length, { timeout: 15_000 });
    expect((await nav.allTextContents()).map((label) => label.trim())).toEqual(EXPECTED);
    await page.getByTestId('mobile-menu-close-button').click();
    await expect(page.getByTestId('mobile-menu')).toHaveCount(0);

    // Visit Services..Contact then Home last, so every click changes the pathname and the
    // route-change effect closes the drawer (clicking the current route would leave it open).
    const order = [...NAV.slice(1), NAV[0]];
    for (const [slug, path, marker] of order) {
      await page.getByTestId('mobile-menu-open-button').click();
      const link = page.getByTestId(`mobile-nav-${slug}`);
      await expect(link).toHaveAttribute('href', path);
      await link.click();
      await expect(page).toHaveURL(urlFor(path));
      await expect(page.getByTestId(marker)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId('mobile-menu')).toHaveCount(0, { timeout: 5_000 });
    }
  });
});
