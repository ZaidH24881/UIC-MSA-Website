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
  await expect(page.locator('.pin-spacer')).toHaveCount(2);
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await expect(page.locator('.cinema-hero .eyebrow')).toHaveText(
    'Muslim Student Association at UIC',
  );
  const glint = page.locator('[data-glint]').first();
  const initial = await glint.evaluate((e) => getComputedStyle(e).backgroundPosition);
  await page.mouse.wheel(0, 200);
  await expect
    .poll(() => glint.evaluate((e) => getComputedStyle(e).backgroundPosition))
    .not.toBe(initial);
  const deck = page.locator('[data-deck]');
  for (const name of ['Friendship', 'Connection']) {
    const button = deck.getByRole('button', { name, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    const note = await deck.locator('[data-community-note]').boundingBox();
    assert.ok(
      note && note.y >= 70 && note.y + note.height < 1000,
      'connection statement stays in view during the shuffle',
    );
  }
  await expect(deck.locator('[data-deck-card]:not([inert])')).toHaveCount(1);
  assert.ok(
    (await deck
      .locator('[data-deck-card]')
      .first()
      .evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a)) < 0.98,
  );
  await expect(page.locator('#join-progress, [data-marquee-pause]')).toHaveCount(0);
  await expect(page.locator('.join-journey .steps li')).toHaveCount(3);
  await expect(page.locator('.resource-art')).toHaveCount(6);
  const marquee = page.locator('[data-marquee-track]');
  await page.locator('[data-marquee]').scrollIntoViewIfNeeded();
  // The marquee must settle when scrolling stops, instead of autoplaying forever.
  await expect.poll(() => marquee.evaluate((e) => getComputedStyle(e).transform)).not.toBe('none');
  await page.waitForTimeout(900);
  const position = await marquee.evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(300);
  assert.equal(await marquee.evaluate((e) => getComputedStyle(e).transform), position);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(deck.locator('[inert]')).toHaveCount(0);
  await expect(page.locator('[data-marquee-clone]')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.pin-spacer')).toHaveCount(2);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide')));
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.evaluate(() =>
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
  );
  await expect(page.locator('.pin-spacer')).toHaveCount(2);
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto(base);
  await expect(noJS.locator('[data-deck-card]')).toHaveCount(3);
  await expect(noJS.locator('.deck-controls')).toBeHidden();
  await expect(noJS.locator('.join-scrub-controls')).toBeHidden();
  assert.deepEqual(errors, []);
  console.log(
    'Passed: desktop pinning, keyboard deck controls, scaling, headline glint, persistent community statement, illustrated resources, scroll-linked marquee, reduced motion, mobile overflow, lifecycle cleanup and no-JavaScript fallback.',
  );
} finally {
  await browser.close();
}
