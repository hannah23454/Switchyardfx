import { test, expect } from '@playwright/test';

// Home-page FX ticker: the marquee board under the hero. Dev runs in mock mode, which mirrors
// the labelled API fallback (INDICATIVE badge, eight AUD pairs), so the provenance contract —
// the strip telling users when it is NOT real-time — is what we pin here.
test.describe('FX ticker', () => {
  test('renders the AUD board with an honest provenance badge', async ({ page }) => {
    await page.goto('/');

    const section = page.getByTestId('market-ticker-section');
    await expect(section).toBeVisible();
    await expect(section.getByText('Live FX rates')).toBeVisible();

    // Mock mode mirrors the server fallback: INDICATIVE, never dressed up as live.
    await expect(page.getByTestId('market-ticker-badge')).toHaveText('INDICATIVE');
    await expect(page.getByTestId('market-ticker-subtext')).toContainText('indicative');

    // The marquee renders the board twice (a seamless -50% loop), so 8 pairs = 16 rate cells.
    await expect(page.getByTestId(/^ticker-quote-rate-/)).toHaveCount(16);
    for (const pair of ['AUD/USD', 'AUD/EUR', 'AUD/GBP', 'AUD/JPY', 'AUD/NZD', 'AUD/CAD', 'AUD/CHF', 'AUD/CNY']) {
      await expect(page.getByTestId(`ticker-quote-${pair.replace('/', '-')}`).first()).toBeVisible();
    }

    await expect(page.getByTestId('ticker-quote-rate-AUD-USD').first()).toHaveText('0.6512');
    await expect(page.getByTestId('ticker-quote-change-AUD-USD').first()).toContainText('+0.48%');
    await expect(page.getByTestId('ticker-quote-change-AUD-EUR').first()).toContainText('-0.27%');

    // An unanimated sr-only list keeps every row screen-reader readable.
    const staticList = page.getByTestId('market-ticker-static');
    await expect(staticList.getByText('AUD/USD')).toBeVisible();
  });

  // Touch devices have no "hover", so the pause is a desktop-only affordance.
  test('pauses the marquee while hovered', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    await page.goto('/');
    await expect(page.getByTestId('market-ticker-badge')).toHaveText('INDICATIVE');

    // Hover the static viewport (the sliding track never "stabilises" for Playwright), which
    // triggers the same `.ticker-viewport:hover .ticker-track` pause rule.
    await page.locator('.ticker-viewport').hover();
    const playState = await page.evaluate(() => window.getComputedStyle(document.querySelector('.ticker-track')).animationPlayState);
    expect(playState).toBe('paused');
  });

  test('stops animating and wraps instead under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByTestId('market-ticker-badge')).toHaveText('INDICATIVE');

    const style = await page.evaluate(() => {
      const el = document.querySelector('.ticker-track');
      const computed = window.getComputedStyle(el);
      return { animationName: computed.animationName, flexWrap: computed.flexWrap };
    });
    expect(style.animationName).toBe('none');
    expect(style.flexWrap).toBe('wrap');
  });
});