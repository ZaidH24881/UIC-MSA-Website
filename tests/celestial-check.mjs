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
        const cards = await page.locator('.resource-directory .resource-link').evaluateAll((es) =>
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
  assert.equal(await page.locator('.star-cursor, .sky-star, .sky-comet').count(), 0);
  assert.ok((await page.locator('.sky-moon').count()) > 0);
  for (const selector of ['body', '.desktop-nav a', '.button']) {
    assert.match(
      await page
        .locator(selector)
        .first()
        .evaluate((e) => getComputedStyle(e).cursor),
      /data:image\/svg\+xml/,
    );
  }
  await page.goto('http://127.0.0.1:4322/resources/');
  const activeLink = page.locator('.desktop-nav a[aria-current="page"]');
  assert.equal(await activeLink.evaluate((e) => getComputedStyle(e).textDecorationLine), 'none');
  assert.equal(
    await activeLink.evaluate((e) => getComputedStyle(e, '::after').backgroundColor),
    'rgb(164, 124, 55)',
  );
  const inactive = page.locator('.desktop-nav a[href="/events/"]');
  assert.equal(
    await inactive.evaluate((e) => getComputedStyle(e, '::after').transform),
    'matrix(0, 0, 0, 1, 0, 0)',
  );
  await inactive.hover();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('.desktop-nav a[href="/events/"]'), '::after')
        .transform === 'matrix(1, 0, 0, 1, 0, 0)',
  );
  assert.equal(await page.locator('.cursor-spark').count(), 24);
  await page.mouse.move(350, 300);
  assert.equal(await page.locator('.moon-mote').count(), 10);
  assert.equal(
    await page
      .locator('.moon-mote')
      .first()
      .evaluate((e) => getComputedStyle(e).pointerEvents),
    'none',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-motion-paused'));
  assert.equal(
    await page
      .locator('.moon-mote')
      .first()
      .evaluate((e) => getComputedStyle(e).display),
    'none',
  );
  assert.equal(
    await page
      .locator('.sky-moon')
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
    await tp
      .locator('.moon-mote')
      .first()
      .evaluate((e) => getComputedStyle(e).display),
    'none',
  );
  console.log(
    'Responsive layouts, Resources alignment, Donate reference, cursor decoration, reduced motion, and touch behavior pass.',
  );
} finally {
  await browser.close();
}
