import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';

const base = process.env.TEST_URL || 'http://127.0.0.1:4322';
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : 'chrome',
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await context.newPage();
const routes = [
  '/',
  '/join/',
  '/events/',
  '/prayer/',
  '/community/',
  '/resources/',
  '/resources/student-success/',
  '/resources/transportation/',
  '/resources/halal-food/',
  '/resources/books/',
  '/resources/lectures/',
  '/about/',
  '/get-involved/',
  '/ramadan/',
  '/donate/',
  '/contact/',
  '/search/',
];
const failures = [];
const runtime = [];
page.on('pageerror', (e) => runtime.push(e.message));
await mkdir('test-results', { recursive: true });
try {
  for (const width of [320, 390, 430, 768, 1024, 1099, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      if (response.status() !== 200) failures.push(`${route}: HTTP ${response.status()}`);
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
      }));
      if (dimensions.scroll > dimensions.width)
        failures.push(`${route} at ${width}: scrollWidth ${dimensions.scroll}`);
    }
    console.log(`Checked ${routes.length} routes at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  const heroTop = await page.locator('.hero-photo').evaluate((e) => e.getBoundingClientRect().top);
  assert.ok(heroTop < 844, 'hero photo starts in mobile first viewport');
  const open = page.getByRole('button', { name: 'Open navigation menu' });
  await open.click();
  assert.equal(await page.locator('#mobile-menu').evaluate((e) => e.open), true);
  assert.equal(await open.getAttribute('aria-expanded'), 'true');
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press('Tab');
    assert.ok(
      await page.evaluate(() => !!document.activeElement.closest('#mobile-menu')),
      'dialog traps focus',
    );
  }
  await page.keyboard.press('Escape');
  await page.waitForFunction(
    () => document.activeElement?.getAttribute('aria-label') === 'Open navigation menu',
  );
  assert.equal(await page.locator('#mobile-menu').evaluate((e) => e.open), false);
  assert.equal(
    await page.evaluate(() => document.activeElement.getAttribute('aria-label')),
    'Open navigation menu',
  );
  await open.click();
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await page.waitForFunction(() => getComputedStyle(document.body).overflow === 'visible');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'visible');
  await page.goto(base + '/join/');
  await page.getByText('Who can request the brothers’ or sisters’ group?', { exact: true }).click();
  assert.equal(await page.locator('details').first().getAttribute('open'), '');
  const joinText = await page.locator('main').innerText();
  assert.ok(
    joinText.indexOf('Register as an MSA member') <
      joinText.indexOf('Complete the group-access form'),
  );
  await page.goto(base + '/donate/');
  assert.equal(await page.locator('#poster-dialog img').getAttribute('src'), null);
  await page.getByRole('button', { name: 'Copy email' }).click();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    'sojeongpark83@gmail.com',
  );
  assert.match(await page.locator('#copy-status').innerText(), /copied/);
  await page.getByText('View the donation announcement', { exact: false }).click();
  assert.equal(await page.locator('#poster-dialog').evaluate((e) => e.open), true);
  assert.match(
    await page.locator('#poster-dialog img').getAttribute('src'),
    /community-donations.png$/,
  );
  await page.keyboard.press('Escape');
  await page.waitForFunction(() =>
    document.activeElement?.textContent?.includes('View the donation announcement'),
  );
  assert.match(
    await page.evaluate(() => document.activeElement.textContent),
    /View the donation announcement/,
  );
  await page.goto(base + '/prayer/');
  assert.match(await page.locator('main').innerText(), /1:05 PM/);
  assert.match(await page.locator('main').innerText(), /3:05 PM/);
  await page.getByText('Expand announcement', { exact: false }).click();
  await page.getByRole('button', { name: 'Close announcement' }).click();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    // Audit the settled view, not a partially transparent entrance frame.
    if (route === '/') {
      await page.waitForSelector('[data-motion-state="ready"]');
      await page.waitForFunction(() =>
        [...document.querySelectorAll('[data-hero-enter]')].every(
          (element) => Number(getComputedStyle(element).opacity) === 1,
        ),
      );
    }
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    failures.push(
      ...results.violations.map(
        (v) => `${route}: axe ${v.id} ${v.nodes.map((n) => n.target.join(',')).join('; ')}`,
      ),
    );
  }
  for (const route of ['/', '/join/', '/prayer/']) {
    await page.goto(base + route);
    await writeFile(
      `test-results/aria-${route.replaceAll('/', '') || 'home'}.txt`,
      await page.locator('body').ariaSnapshot(),
    );
  }
  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const np = await noJS.newPage();
  await np.goto(base);
  assert.ok(await np.getByRole('navigation', { name: 'Site navigation', exact: true }).isVisible());
  await np
    .getByRole('navigation', { name: 'Site navigation', exact: true })
    .getByRole('link', { name: 'Prayer', exact: true })
    .click();
  assert.match(await np.locator('main').innerText(), /1:05 PM/);
  await noJS.close();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base);
  assert.equal(
    await page
      .locator('.button')
      .first()
      .evaluate((e) => getComputedStyle(e).transitionDuration),
    '0s',
  );
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(base, { waitUntil: 'networkidle' });
    for (const img of await page.locator('[data-photo] img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((e) => e.decode());
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
    await page.screenshot({ path: `test-results/hero-${width}.png` });
    if (width === 390) {
      await page.goto(base + '/prayer/');
      await page.screenshot({ path: 'test-results/prayer-390.png', fullPage: true });
    }
  }
  const failedPhotoPage = await context.newPage();
  await failedPhotoPage.route('**/assets/campus-community*', (route) => route.abort());
  await failedPhotoPage.goto(base, { waitUntil: 'networkidle' });
  assert.ok(await failedPhotoPage.locator('.hero-photo .photo-fallback').isVisible());
  await failedPhotoPage.close();
  const redirects = JSON.parse(await readFile('content/redirects.json', 'utf8'));
  for (const [from, to] of Object.entries(redirects)) {
    const r = await fetch(base + from, { redirect: 'manual' });
    assert.equal(r.status, 301, from);
    assert.equal(r.headers.get('location'), to, from);
    const rt = await fetch(base + from + '/?from=old', { redirect: 'manual' });
    assert.equal(rt.status, 301, from + '/');
    assert.equal(rt.headers.get('location'), to + '?from=old');
  }
  assert.equal((await fetch(base + '/not-a-real-page')).status, 404);
  assert.deepEqual(runtime, [], 'no browser runtime errors');
  const report = {
    testedAt: new Date().toISOString(),
    browser: browser.version(),
    routes: routes.length,
    widths: [320, 390, 430, 768, 1024, 1099, 1100, 1440],
    heroPhotoTop390: heroTop,
    failures,
    runtime,
    notes: [
      'Chrome desktop engine only; no physical iPhone Safari or Android device.',
      'Accessibility-tree and keyboard review; no installed screen-reader application was exercised.',
    ],
  };
  await writeFile('test-results/browser-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  assert.deepEqual(failures, [], 'responsive and accessibility checks');
} finally {
  await browser.close();
}
