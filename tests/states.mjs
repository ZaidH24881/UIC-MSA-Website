// Build synthetic state examples in an isolated, ignored directory. Production records remain untouched.
import { cp, mkdir, mkdtemp, readFile, writeFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

await mkdir('test-results', { recursive: true });
const root = await mkdtemp(resolve('test-results/state-fixture-'));
for (const entry of ['src', 'public', 'astro.config.mjs', 'tsconfig.json']) {
  await cp(entry, join(root, entry), { recursive: true });
}
const now = Date.now();
const hour = 3600000;
const record = (slug, start, end, status, category = 'community') => ({
  slug,
  title: `Browser test ${slug}`,
  description: 'Isolated state fixture; never published.',
  start: new Date(start).toISOString(),
  end: new Date(end).toISOString(),
  timezone: 'America/Chicago',
  status,
  category,
  location: null,
  audience: 'Test audience',
  rsvpUrl: 'https://example.com/fixture-registration',
});
await writeFile(
  join(root, 'src/data/events.json'),
  JSON.stringify({
    events: [
      record('ongoing', now - hour, now + 12 * hour, 'confirmed'),
      record('cancelled-iftar', now + 24 * hour, now + 26 * hour, 'cancelled', 'ramadan'),
      record('past', now - 48 * hour, now - 47 * hour, 'confirmed'),
    ],
  }),
);
const siteFile = join(root, 'src/data/site.ts');
let content = await readFile(siteFile, 'utf8');
content = content
  .replace('enabled: true', 'enabled: false')
  .replace("status: 'unconfirmed',", "status: 'closed',")
  .replace(
    'opportunities: [],',
    "opportunities: [{ title: 'Closed fixture opening', description: 'Test', status: 'open', url: 'https://example.com/closed-application', deadline: null }],",
  )
  .replace('weeklyLocation: null,', "weeklyLocation: 'Fixture weekly room',")
  .replace(
    'daily: { verified: false, location: null, hours: null, directions: null },',
    "daily: { verified: true, location: 'Fixture daily room', hours: 'Fixture hours', directions: 'Fixture directions' },",
  );
await writeFile(siteFile, content);
execFileSync(
  process.execPath,
  [resolve('node_modules/astro/bin/astro.mjs'), 'build', '--root', root],
  { stdio: 'pipe', timeout: 120000 },
);
const html = (route) => readFile(join(root, 'dist', route, 'index.html'), 'utf8');
const eventList = await html('events');
assert.match(eventList, /Browser test ongoing/);
assert.match(eventList, /In progress/);
assert.match(eventList, /Past gatherings/);
assert.match(await html('ramadan'), /Browser test cancelled-iftar/);
assert.match(await html('ramadan'), /cancelled/);
assert.doesNotMatch(
  await html('events/cancelled-iftar'),
  /href="https:\/\/example.com\/fixture-registration"/,
);
assert.doesNotMatch(
  await html('events/past'),
  /href="https:\/\/example.com\/fixture-registration"/,
);
const giving = await html('donate');
assert.match(giving, /Online giving details are not currently available/);
assert.doesNotMatch(giving, /sojeong|sjpark83|2488434318|community-donations\.png/);
await assert.rejects(access(join(root, 'dist/assets/community-donations.png')));
assert.doesNotMatch(await html('get-involved'), /href="https:\/\/example.com\/closed-application"/);
for (const route of ['', 'prayer']) {
  assert.match(await html(route), /Fixture daily room/);
  assert.match(await html(route), /Fixture weekly room/);
}
const report = {
  testedAt: new Date().toISOString(),
  checks: [
    'Ongoing event remains visible; ended event has a recap section',
    'Only cancelled Ramadan occurrence remains visible',
    'Cancelled and past detail pages suppress RSVP',
    'Giving disabled: contact fallback, no recipient details or poster in generated output',
    'Closed committee collection suppresses an open item application',
    'Verified daily and weekly prayer rooms appear in homepage and detail page',
  ],
  failures: [],
};
await writeFile('test-results/states-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
