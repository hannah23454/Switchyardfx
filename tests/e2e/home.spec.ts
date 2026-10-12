import { test, expect } from '@playwright/test';

// Opening experience: the S/Y splash should be readable, then wipe away, and show only
// once per browser session.
test.describe('Opening experience', () => {
  test('splash holds, then wipes away once per session', async ({ page }) => {
    // 'commit' so we observe the splash before the full load event (fonts + the external
    // chat widget can finish well after the splash is gone on a cold dev server).
    await page.goto('/', { waitUntil: 'commit' });

    const intro = page.getByTestId('landing-intro');
    await expect(intro).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('landing-intro-brand')).toHaveText('SwitchYard');
    await expect(page.getByTestId('landing-intro-tagline')).toHaveText('Clarity in motion');

    await expect(intro).toBeHidden({ timeout: 6000 });
    expect(await page.evaluate(() => sessionStorage.getItem('switchyard-intro-seen'))).toBe('true');

    await page.reload({ waitUntil: 'commit' });
    await expect(page.getByTestId('hero-heading')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('landing-intro')).toHaveCount(0);
  });
});

// Home page: hero copy, the static FX connectivity visual (replacing the live market
// command centre) and the tightened section stack should all render.
test.describe('Home page', () => {
  test('hero, connectivity visual and sections render', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('hero-heading')).toContainText('Manage FX risk');
    await expect(page.getByTestId('hero-description')).toContainText('Tailored corporate FX solutions');
    await expect(page.getByTestId('hero-book-consult-button')).toBeVisible();

    // Renamed from "15-Min Setup" to "15-Min Consultation".
    await expect(page.getByTestId('hero-point-15-min-consultation')).toBeVisible();
    await expect(page.getByTestId('hero-point-15-min-setup')).toHaveCount(0);

    const card = page.getByTestId('hero-connectivity-card');
    await expect(card).toBeVisible();
    await expect(page.getByTestId('hero-connectivity-badge')).toContainText('AUD BASE');
    await expect(page.getByTestId('hero-solution-forwards')).toBeVisible();
    await expect(page.getByTestId('hero-solution-options')).toBeVisible();
    await expect(page.getByTestId('hero-solution-payments')).toBeVisible();
    await expect(page.getByTestId('hero-solution-treasury')).toBeVisible();
    await expect(page.getByTestId('hero-connectivity-caption')).toContainText('settlement');

    for (const id of [
      'market-ticker-section',
      'cfo-outcomes-section',
      'global-reach-section',
      'solutions-section',
      'lending-section',
      'how-we-work-section',
      'guide-section',
      'exposure-scenarios-section',
      'animated-metrics-section',
      'faq-section',
    ]) {
      await expect(page.getByTestId(id)).toHaveCount(1);
    }

    // Updated CFO-outcomes wording (exact) and the metrics band (35+ / 24/7 / 5 / 15 min).
    await expect(page.getByTestId('cfo-outcomes-section')).toContainText('Every recommendation considers margins, cashflow, forecasts & sales, supplier terms, business goals and reporting outcomes you need.');
    const metrics = page.getByTestId('animated-metrics-section');
    await metrics.scrollIntoViewIfNeeded();
    await expect(page.getByTestId('metric-1')).toContainText('35+');
    await expect(page.getByTestId('metric-1')).toContainText('Years of Experience');
    await expect(page.getByTestId('metric-2')).toContainText('24/7');
    await expect(page.getByTestId('metric-3')).toContainText('Core Services');
    await expect(page.getByTestId('metric-4')).toContainText('15 min');
    await expect(page.getByTestId('metric-4')).toContainText('Consultation');
  });

  test('global reach sits below the metrics band with the new copy', async ({ page }) => {
    await page.goto('/');

    const metrics = page.getByTestId('animated-metrics-section');
    const reach = page.getByTestId('global-reach-section');
    await metrics.scrollIntoViewIfNeeded();
    await reach.scrollIntoViewIfNeeded();

    await expect(page.getByTestId('global-reach-heading')).toContainText('Solutions Enabling Global Trade');
    await expect(page.getByTestId('global-reach-description')).toContainText(
      'From international payments to hedging and funding, SwitchYard FX brings greater clarity, control and efficiency to your global FX requirements.',
    );

    // Four exact service areas replacing the old rates/quotes and "12 currencies" coverage copy.
    await expect(page.getByTestId('global-service-title-1')).toHaveText('International Payments');
    await expect(page.getByTestId('global-service-title-2')).toHaveText('Collections & Receivables');
    await expect(page.getByTestId('global-service-title-3')).toHaveText('Hedging & Risk Management');
    await expect(page.getByTestId('global-service-title-4')).toHaveText('Trade Finance & Funding');
    await expect(reach).not.toContainText('12 currencies');

    await expect(page.getByTestId('global-reach-compliance')).toContainText('sanctioned jurisdictions are excluded');

    // The globe shows most of the world's flags with dotted corridors, and no sanctioned ones.
    const globe = page.getByTestId('global-reach-globe');
    await expect(globe).toBeVisible();
    const flagCount = await globe.locator('[data-flag]').count();
    expect(flagCount).toBeGreaterThanOrEqual(150);
    for (const code of ['RU', 'BY', 'IR', 'KP', 'SY', 'CU', 'VE', 'MM', 'AF']) {
      await expect(globe.locator(`[data-flag="${code}"]`)).toHaveCount(0);
    }
    await expect(globe.locator('[data-flag="AU"]')).toHaveCount(1);
    await expect(globe.locator('svg polyline').first()).toBeAttached();

    // Global Reach is moved to sit directly beneath the statistics bar.
    const metricsBox = await metrics.boundingBox();
    const reachBox = await reach.boundingBox();
    const solutionsBox = await page.getByTestId('solutions-section').boundingBox();
    expect(metricsBox).not.toBeNull();
    expect(reachBox).not.toBeNull();
    expect(solutionsBox).not.toBeNull();
    expect(reachBox!.y).toBeGreaterThanOrEqual(metricsBox!.y + metricsBox!.height - 2);
    expect(reachBox!.y).toBeLessThan(solutionsBox!.y);
  });

  test('strategy selector updates the panel for all three approaches', async ({ page, isMobile }) => {
    await page.goto('/');
    const section = page.getByTestId('exposure-scenarios-section');
    await section.scrollIntoViewIfNeeded();

    // Advisory content is merged in; the old image/heading are gone.
    await expect(section).toContainText('Advisory, not guesswork');
    await expect(section).toContainText('See how different hedge settings change the conversation.');
    await expect(section).toContainText('Switch between indicative approaches to compare Conservative, Balanced & Dynamic solutions.');
    await expect(page.getByTestId('advisory-book-button')).toBeVisible();

    const expectations = [
      { tab: 'conservative', label: 'Conservative approach', certainty: 'HIGH', flexibility: 'MODERATE', product: 'Participating Forwards' },
      { tab: 'balanced', label: 'Balanced approach', certainty: 'MODERATE', flexibility: 'HIGH', product: "Capped FEC's" },
      { tab: 'dynamic', label: 'Dynamic approach', certainty: 'MODERATE', flexibility: 'MAXIMUM', product: "Leveraged KIKO's" },
    ];

    for (const { tab, label, certainty, flexibility, product } of expectations) {
      const button = page.getByTestId(`scenario-${tab}-tab`);
      await button.click();
      await expect(button).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('scenario-label')).toHaveText(label);
      await expect(page.getByTestId('scenario-certainty')).toHaveText(certainty);
      await expect(page.getByTestId('scenario-flexibility')).toHaveText(flexibility);
      await expect(page.getByTestId('scenario-products')).toContainText(product);
    }

    // Keyboard: arrow keys move selection through the roving tabindex.
    await page.getByTestId('scenario-conservative-tab').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('scenario-balanced-tab')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('scenario-dynamic-tab')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('scenario-conservative-tab')).toHaveAttribute('aria-selected', 'true');

    // Indicative-strategy disclaimer, not personalised advice.
    await expect(page.getByTestId('scenario-disclaimer')).toContainText('not personal financial advice');

    if (isMobile) return;
    // Panel stays within the viewport after switching.
    const card = page.getByTestId('scenario-result-card');
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
  });
});
