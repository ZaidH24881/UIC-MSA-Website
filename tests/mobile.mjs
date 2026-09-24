import { chromium, webkit, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.TEST_URL || 'http://127.0.0.1:4322';
const profiles = [
  { name: 'small-phone', width: 320, height: 568 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'large-phone', width: 430, height: 932 },
  { name: 'phone-landscape', width: 844, height: 390 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'tablet-landscape', width: 1180, height: 820 },
];
const checks = [];
await mkdir('test-results', { recursive: true });
for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch(
    engine === 'chromium' && !process.env.CI ? { channel: 'chrome' } : {},
  );
  try {
    for (const profile of profiles) {
      const context = await browser.newContext({
        viewport: { width: profile.width, height: profile.height },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      const fits = async () =>
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${engine}/${profile.name}: no horizontal overflow`,
        );
      await page.goto(base);
      await expect(page.locator('[data-motion-state]')).toHaveAttribute(
        'data-motion-state',
        'ready',
      );
      await expect(page.locator('html')).not.toHaveClass(/lenis/);
      await expect(page.locator('.pin-spacer')).toHaveCount(0);
      await expect(page.locator('[data-deck-card][inert]')).toHaveCount(0);
      await fits();
      const menu = page.getByRole('button', { name: 'Open navigation menu' });
      await menu.tap();
      await expect(page.locator('#mobile-menu')).toBeVisible();
      await page
        .locator('#mobile-menu')
        .getByRole('link', { name: 'Contact', exact: true })
        .scrollIntoViewIfNeeded();
      if (profile.name === 'phone') {
        // Rotate while a long menu is open: the close control must stay reachable.
        await page.setViewportSize({ width: 844, height: 390 });
      }
      await expect(page.getByRole('button', { name: 'Close navigation' })).toBeInViewport();
      await page.getByRole('button', { name: 'Close navigation' }).tap();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('body')).not.toHaveClass(/menu-is-open/);
      if (profile.name === 'phone') {
        await page.setViewportSize({ width: profile.width, height: profile.height });
      }
      await page.getByRole('button', { name: 'Connection', exact: true }).tap();
      const photo = await page.locator('#community-card-2 .photo').boundingBox();
      const note = await page.locator('[data-community-note]').boundingBox();
      const sticky = await page
        .locator('[data-community-note]')
        .evaluate((e) => getComputedStyle(e).position === 'sticky');
      if (sticky)
        assert.ok(
          photo.y >= note.y + note.height,
          `${engine}/${profile.name}: selected photo clears the sticky heading`,
        );
      if (profile.name === 'phone')
        await page.screenshot({ path: `test-results/mobile-${engine}-community.png` });
      await page.locator('.resource-bento a').first().tap();
      await expect(page).toHaveURL(/\/prayer\/$/);
      await fits();
      await page.goto(base + '/donate/');
      await fits();
      await page.getByRole('link', { name: 'View the donation announcement' }).tap();
      await expect(page.getByRole('dialog', { name: 'MSA announcement' })).toBeVisible();
      await page.getByRole('button', { name: 'Close announcement' }).tap();
      await expect(page.locator('body')).not.toHaveClass(/menu-is-open/);
      for (const route of ['/join/', '/events/', '/resources/', '/search/']) {
        await page.goto(base + route);
        await fits();
      }
      await page.goto(base);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('.pin-spacer')).toHaveCount(0);
      await expect(page.locator('[data-marquee-clone]')).toHaveCount(0);
      assert.deepEqual(errors, [], `${engine}/${profile.name}: runtime errors`);
      checks.push(
        `${engine}: ${profile.name} (${profile.width} × ${profile.height}), touch navigation, photo selection, resource link, donation dialog, reduced motion and page overflow`,
      );
      console.log(checks.at(-1));
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(
  'test-results/mobile-report.json',
  JSON.stringify(
    {
      testedAt: new Date().toISOString(),
      checks,
      notes: [
        'Emulated touch viewports in Chromium and WebKit; not physical iOS or Android devices.',
      ],
    },
    null,
    2,
  ),
);
