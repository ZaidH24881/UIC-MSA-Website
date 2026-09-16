// Browser-only stress content never enters the production data or static build.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' });
const page = await browser.newPage();
const base = process.env.TEST_URL || 'http://127.0.0.1:4322';
const checks = [];
await mkdir('test-results', { recursive: true });
try {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/events/');
    await page.locator('.empty-events').evaluate((element) => {
      const grid = document.createElement('div');
      grid.className = 'event-grid';
      for (let i = 0; i < 3; i++) {
        const article = document.createElement('article');
        article.className = 'event-card';
        const title = document.createElement('h3');
        title.textContent =
          'A long community event title with space for students, alumni, visiting speakers, and their families';
        const text = document.createElement('p');
        text.textContent =
          'Location to be confirmed. This deliberately long browser-only layout example checks how event cards wrap without a photograph.';
        article.append(title, text);
        grid.append(article);
      }
      element.replaceWith(grid);
    });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    for (const heading of await page.locator('.event-card h3').all()) {
      const bounds = await heading.evaluate((e) => ({
        scrollWidth: e.scrollWidth,
        width: e.clientWidth,
        scrollHeight: e.scrollHeight,
        height: e.clientHeight,
        overflow: getComputedStyle(e).overflow,
      }));
      assert.ok(
        bounds.scrollWidth <= bounds.width &&
          (bounds.scrollHeight <= bounds.height || bounds.overflow === 'visible'),
        JSON.stringify({ width, ...bounds }),
      );
    }
    checks.push(`Long event titles and three cards without photos fit at ${width}px`);
  }
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + '/community/');
    for (const figure of await page.locator('[data-photo]').all()) {
      const img = figure.locator('img');
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((e) => e.decode());
      const name = await figure.getAttribute('class');
      await figure.screenshot({ path: `test-results/crop-${name.split(' ')[1]}-${width}.png` });
    }
    checks.push(`All four community photo crops captured at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/join/', '/prayer/', '/donate/']) {
    await page.goto(base + route);
    for (const button of await page.locator('.button, button').all()) {
      if (!(await button.isVisible())) continue;
      const size = await button.boundingBox();
      assert.ok(
        size.height >= 44 && size.width >= 44,
        `${route}: touch target ${await button.innerText()}`,
      );
    }
  }
  checks.push('Visible primary buttons and controls are at least 44 × 44px on mobile');
  const report = { testedAt: new Date().toISOString(), checks, failures: [] };
  await writeFile('test-results/layout-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
