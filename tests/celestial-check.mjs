import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/resources/', '/donate/', '/about/', '/join/']) {
      await page.goto('http://127.0.0.1:4322' + route);
      await page.waitForTimeout(900);
      assert.equal(await page.locator('[data-motion-toggle]').count(), 0);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} overflow at ${width}`,
      );
      if (route === '/resources/') {
        const cards = await page
          .locator('.resource-directory .resource-link')
          .evaluateAll((es) =>
            es.map((e) => ({
              x: e.getBoundingClientRect().x,
              y: e.getBoundingClientRect().y,
              w: e.getBoundingClientRect().width,
              h: e.getBoundingClientRect().height,
            })),
          );
        assert.ok(
          cards.every((c) => Math.abs(c.w - cards[0].w) < 1),
          'consistent resource card widths',
        );
        if (width >= 768)
          assert.ok(Math.abs(cards[0].y - cards[1].y) < 1, 'resource row alignment');
      }
      if (route === '/donate/') {
        assert.match(await page.locator('.charity-quote').innerText(), /Sahih Muslim 2588/);
        assert.equal(await page.locator('.charity-quote a').count(), 0);
      }
      if ([390, 1440].includes(width) && ['/', '/resources/', '/donate/'].includes(route)) {
        await page.screenshot({
          path: `test-results/revised-${route.replaceAll('/', '') || 'home'}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  await page.goto('http://127.0.0.1:4322/');
  await page.mouse.move(350, 300);
  await page.waitForFunction(() =>
    document.querySelector('.star-cursor')?.classList.contains('is-visible'),
  );
  assert.equal(
    await page.locator('.star-cursor').evaluate((e) => getComputedStyle(e).pointerEvents),
    'none',
  );
  await page.screenshot({ path: 'test-results/cursor-star.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-motion-paused'));
  assert.equal(
    await page.locator('.star-cursor').evaluate((e) => getComputedStyle(e).display),
    'none',
  );
  assert.equal(
    await page
      .locator('.sky-comet')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
    'none',
  );
  const touch = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const tp = await touch.newPage();
  await tp.goto('http://127.0.0.1:4322/');
  assert.equal(
    await tp.locator('.star-cursor').evaluate((e) => getComputedStyle(e).display),
    'none',
  );
  console.log(
    'Responsive layouts, Resources alignment, Donate reference, cursor decoration, reduced motion, and touch behavior pass.',
  );
} finally {
  await browser.close();
}
