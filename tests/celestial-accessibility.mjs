import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext();
const page = await context.newPage();
const failures = [];
for (const width of [390, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of [
    '/',
    '/join/',
    '/events/',
    '/community/',
    '/resources/',
    '/prayer/',
    '/donate/',
  ]) {
    await page.goto('http://127.0.0.1:4322' + route);
    await page.waitForTimeout(1600);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    failures.push(
      ...result.violations.map((v) => ({
        width,
        route,
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    );
  }
}
await browser.close();
console.log(JSON.stringify(failures));
assert.deepEqual(failures, []);
