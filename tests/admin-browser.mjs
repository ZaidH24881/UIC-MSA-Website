import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile, unlink, mkdir } from 'node:fs/promises';
const port = 4323,
  base = `http://127.0.0.1:${port}`,
  file = `.local-admin/content-${port}.json`;
let backup;
try {
  backup = await readFile(file);
} catch {}
await mkdir('.local-admin', { recursive: true });
// Only this dedicated test port's data is reset, and restored in finally.
try {
  await unlink(file);
} catch {}
const server = spawn(process.execPath, ['scripts/serve.mjs'], {
  env: { ...process.env, PORT: String(port), ADMIN_DEMO: '1' },
  windowsHide: true,
  stdio: 'pipe',
});
let browser;
try {
  await new Promise((resolve, reject) => {
    server.stdout.once('data', resolve);
    server.once('error', reject);
    server.once('exit', (code) => reject(new Error(`Server exited ${code}`)));
  });
  browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }),
    page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const post = (path, body) =>
    context.request.post(base + '/__admin/' + path, { data: body, headers: { Origin: base } });
  assert.equal((await context.request.get(base + '/__admin/drafts')).status(), 401);
  assert.equal((await post('save', { record: {}, action: 'publish' })).status(), 401);
  assert.equal((await post('login', { password: 'wrong' })).status(), 401);
  assert.equal(
    (
      await context.request.post(base + '/__admin/login', {
        data: { password: 'password' },
        headers: { Origin: 'https://evil.example' },
      })
    ).status(),
    403,
  );
  await page.goto(base + '/admin/');
  await page.getByLabel('Preview password').fill('password');
  await page.locator('[data-login-button]').click();
  await page.locator('.admin-dashboard').waitFor({ state: 'visible' });
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations.map((v) => v.id),
    [],
  );
  await page.goto(base + '/admin/prayer/');
  await page.getByLabel('Friday location', { exact: true }).fill('SCE 302 — test');
  await page.getByLabel('Effective from (Chicago date)').fill('2026-01-01');
  await page.getByLabel('Effective through (Chicago date)').fill('2027-12-31');
  await page.locator('[data-save-draft]').click();
  await page.getByText('Draft saved. Public pages are unchanged.').waitFor();
  let published = await (await context.request.get(base + '/__admin/published')).json();
  assert.notEqual(published.find((r) => r.kind === 'prayer').data.location, 'SCE 302 — test');
  const old = (await (await context.request.get(base + '/__admin/drafts')).json()).find(
    (r) => r.kind === 'prayer',
  );
  await page.locator('[data-publish]').click();
  await page.getByText('Published. Visitors see this revision on their next page load.').waitFor();
  assert.equal(
    (await post('save', { record: old, action: 'publish' })).status(),
    400,
    'stale publication rejected',
  );
  await page.goto(base + '/prayer/');
  await page.getByRole('heading', { name: 'SCE 302 — test' }).waitFor();
  assert.equal(await page.locator('[data-prayer-poster]').isVisible(), false);
  await page.route('**/__admin/published', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
  });
  await page.goto(base + '/admin/events/');
  await page.locator('[data-admin-new]').click();
  await page.unroute('**/__admin/published');
  for (const [name, value] of Object.entries({
    id: 'board-test-event',
    title: 'Board test gathering',
    description: 'An editable community event.',
    start: '2027-01-15T17:00',
    end: '2027-01-15T18:00',
    location: 'Student Center',
    audience: 'All students',
  }))
    await page.locator(`[data-content-form] [name="${name}"]`).fill(value);
  await page.locator('[data-preview]').click();
  await page
    .locator('[data-preview-body]')
    .getByRole('heading', { name: 'Board test gathering' })
    .waitFor();
  await page.locator('[data-publish]').click();
  await page.getByText('Published. Visitors see this revision on their next page load.').waitFor();
  await page.goto(base + '/events/');
  await page.getByText('Board test gathering').first().waitFor();
  assert.equal(await page.locator('[data-events-admin]').count(), 0);
  await page.goto(base + '/admin/khutbahs/');
  for (const [name, value] of Object.entries({
    id: 'board-test-khutbah',
    title: 'Friday reflection',
    speaker: 'MSA guest',
    date: '2026-10-20',
    description: 'A community reflection.',
    url: 'https://soundcloud.com/msaatuic/friday-reflection',
  }))
    await page.locator(`[data-content-form] [name="${name}"]`).fill(value);
  await page.locator('[data-publish]').click();
  await page.getByText('Published. Visitors see this revision on their next page load.').waitFor();
  await page.goto(base + '/resources/lectures/');
  await page.getByRole('heading', { name: 'Friday reflection' }).waitFor();
  await page.goto(base + '/admin/donations/');
  await page.getByLabel('Recipient / handle').fill('demo-recipient@example.com');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.locator('[data-publish]').click();
  published = await (await context.request.get(base + '/__admin/published')).json();
  assert.notEqual(
    published.find((r) => r.kind === 'donations').data.recipient,
    'demo-recipient@example.com',
  );
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-publish]').click();
  await page.getByText('Published. Visitors see this revision on their next page load.').waitFor();
  await page.goto(base + '/donate/');
  await page.getByText('demo-recipient@example.com', { exact: true }).waitFor();
  assert.equal(await page.locator('[data-donation-poster]').isVisible(), false);
  await page.goto(base + '/admin/giving/');
  await page.getByLabel('Campaign heading').fill('Build a welcoming community');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-publish]').click();
  await page.getByText('Published. Visitors see this revision on their next page load.').waitFor();
  await page.goto(base + '/donate/');
  await page.getByRole('heading', { name: 'Build a welcoming community' }).waitFor();
  await page.goto(base + '/admin/khutbahs/');
  await page.getByLabel('Archive this entry (hide it from the website)').check();
  await page.locator('[data-publish]').click();
  await page.getByText('Published. Visitors see this revision on their next page load.').waitFor();
  await page.locator('summary').filter({ hasText: 'Revision history' }).click();
  await page.getByRole('button', { name: /Restore revision 1/ }).click();
  await page.locator('[data-publish]').click();
  await page.getByText('Published. Visitors see this revision on their next page load.').waitFor();
  assert.ok(
    (await (await context.request.get(base + '/__admin/history')).json()).filter(
      (r) => r.id === 'board-test-khutbah',
    ).length === 3,
  );
  await page.goto(base + '/admin/prayer/');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(
      (await new AxeBuilder({ page }).analyze()).violations.map((v) => v.id),
      [],
    );
    await page.screenshot({ path: `test-results/admin-prayer-${width}.png`, fullPage: true });
  }
  await page.locator('[data-admin-signout]').click();
  await page.getByLabel('Preview password').waitFor({ state: 'visible' });
  assert.equal((await context.request.get(base + '/__admin/history')).status(), 401);
  assert.deepEqual(errors, []);
  console.log(
    'Admin: login, draft privacy, publish, conflict rejection, events, khutbahs, donation confirmation, archive/restore, sign-out, responsive layout and axe passed.',
  );
} finally {
  await browser?.close();
  server.kill();
  await new Promise((resolve) => {
    if (server.exitCode !== null) resolve();
    else server.once('exit', resolve);
  });
  if (backup) await writeFile(file, backup);
  else
    try {
      await unlink(file);
    } catch {}
}
