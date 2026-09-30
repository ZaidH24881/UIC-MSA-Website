import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' });
const base = process.env.TEST_URL || 'http://127.0.0.1:4322';
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base);
  await expect(page.locator('[data-motion-state]')).toHaveAttribute('data-motion-state', 'ready');
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  assert.deepEqual(
    (await page.locator('#mobile-menu nav a').allTextContents()).map((text) => text.trim()),
    [
      'Prayer',
      'Join MSA',
      'Resources',
      'Events',
      'Community',
      'About',
      'Get involved',
      'Ramadan',
      'Donate',
      'Contact',
    ],
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('.cinema-hero .eyebrow')).toHaveText(
    'Muslim Student Association at UIC',
  );
  const glint = page.locator('[data-glint]').first();
  const initial = await glint.evaluate((e) => getComputedStyle(e).backgroundPosition);
  await page.mouse.wheel(0, 200);
  await expect
    .poll(() => glint.evaluate((e) => getComputedStyle(e).backgroundPosition))
    .not.toBe(initial);
  await expect(page.locator('.resource-grid .resource-link')).toHaveCount(6);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide')));
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.evaluate(() =>
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
  );
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto(base);
  await expect(noJS.locator('.resource-grid .resource-link')).toHaveCount(6);
  for (const width of [390, 1100, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + '/donate/');
    const arrows = await page
      .locator('.donation-links svg')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().x));
    assert.equal(arrows.length, 2);
    assert.ok(Math.abs(arrows[0] - arrows[1]) < 1, 'donation-link arrows share a column');
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  assert.deepEqual(errors, []);
  console.log(
    'Passed: desktop pinning, headline glint, quick links, reduced motion, mobile overflow, lifecycle cleanup and no-JavaScript fallback.',
  );
} finally {
  await browser.close();
}
