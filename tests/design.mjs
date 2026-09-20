import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' });
const base = process.env.TEST_URL || 'http://127.0.0.1:4322';
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(base);
  const frame = page.locator('[data-cinema]');
  const scale = () => frame.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
  const before = await scale();
  await page.mouse.wheel(0, 500);
  await page.waitForFunction((initial) => {
    const el = document.querySelector('[data-cinema]');
    return Number(el.style.getPropertyValue('--cinema-scale')) > initial;
  }, before);
  assert.ok((await scale()) > before, 'photo expands with natural scrolling');
  const gallery = page.locator('[data-moments]');
  await gallery.getByRole('button', { name: 'Friendship', exact: true }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await gallery.locator('[data-moment]:visible').count(), 1);
  assert.equal(
    await gallery
      .getByRole('button', { name: 'Friendship', exact: true })
      .getAttribute('aria-pressed'),
    'true',
  );
  assert.ok(await gallery.locator('.photo-brothers-group').isVisible());
  assert.match(await gallery.getByRole('status').innerText(), /photo 2 of 3/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector('[data-cinema]')).transform === 'none',
  );
  await gallery.getByRole('button', { name: 'Connection', exact: true }).click();
  assert.ok(await gallery.locator('.photo-sisters-group').isVisible());
  assert.equal(
    await gallery
      .locator('[data-moment]:visible')
      .evaluate((e) => getComputedStyle(e).animationName),
    'none',
  );
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto(base);
  assert.ok(await noJS.locator('[data-moment]').first().isVisible());
  assert.equal(await noJS.locator('.moment-controls').isVisible(), false);
  console.log(
    'Passed: scroll expansion, keyboard photo selection, announced selection, live reduced-motion change, and no-JavaScript fallback.',
  );
} finally {
  await browser.close();
}
