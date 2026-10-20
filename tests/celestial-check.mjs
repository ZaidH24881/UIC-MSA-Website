import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://127.0.0.1:4322/');
await page.waitForSelector('[data-motion-state="ready"]');
await page.waitForTimeout(1600);
assert.equal(await page.locator('.sky-star').count(), 54);
await page.screenshot({ path: 'test-results/celestial-desktop.png', fullPage: true });
const button = page.locator('[data-motion-toggle]');
await button.click();
assert.equal(await button.getAttribute('aria-pressed'), 'true');
assert.equal(
  await page
    .locator('.sky-star')
    .first()
    .evaluate((e) => getComputedStyle(e).animationPlayState),
  'paused',
);
await page.reload();
assert.equal(await button.getAttribute('aria-pressed'), 'true');
await button.click();
await page.waitForSelector('[data-motion-state="ready"]');
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.waitForFunction(
  () => document.querySelector('[data-motion-toggle]').getAttribute('aria-pressed') === 'true',
);
assert.equal(await button.getAttribute('aria-pressed'), 'true');
assert.equal(
  await page
    .locator('.sky-star')
    .first()
    .evaluate((e) => getComputedStyle(e).animationName),
  'none',
);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'test-results/celestial-mobile.png', fullPage: true });
await browser.close();
console.log(
  'Star field, pause/resume, persisted preference, reduced motion, desktop and mobile screenshots passed.',
);
