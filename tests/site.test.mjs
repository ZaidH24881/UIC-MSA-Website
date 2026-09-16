import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const pages = [
  'index.html',
  ...[
    'about',
    'events',
    'prayer',
    'resources',
    'join',
    'donate',
    'contact',
    'community',
    'get-involved',
    'ramadan',
    'search',
    'resources/student-success',
    'resources/transportation',
    'resources/halal-food',
    'resources/books',
    'resources/lectures',
  ].map((p) => p + '/index.html'),
  '404.html',
];
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('all primary destinations deliver complete, accessible HTML', () => {
  for (const file of pages) {
    assert.ok(existsSync(path.join(root, file)), `${file} must exist`);
    const html = read(file);
    assert.match(html, /<html lang="en">/);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${file}: one page heading`);
    assert.match(html, /<main id="main"/);
    assert.match(html, /name="description" content="[^"]+"/);
    assert.match(html, /Skip to content/);
    for (const img of html.matchAll(/<img\b[^>]*>/g))
      assert.match(img[0], /alt="[^"]*"/, `${file}: image text alternative`);
  }
});

test('the connection process and payment identifiers match supplied instructions', () => {
  const join = read('join/index.html');
  const registration = join.indexOf('https://uic.campusgroups.com/msa/club_signup');
  const form = join.indexOf('https://cglink.me/2gA/s94866');
  assert.ok(registration >= 0 && form > registration, 'registration precedes the group-chat form');
  assert.match(join, /https:\/\/chat.whatsapp.com\/CiVJsIGeJBnEqopCHOceMv\?mode=ems_wa_c/);
  const donate = read('donate/index.html');
  for (const recipient of [
    'sojeongpark83@gmail.com',
    '@sojeong_07',
    'https://paypal.me/sjpark83',
    '2488434318',
  ])
    assert.ok(donate.includes(recipient), recipient);
  assert.match(read('index.html'), /5,000\+/);
});

test('the supplied prayer announcement supersedes old fixed-room and summer schedules', () => {
  for (const file of ['index.html', 'prayer/index.html']) {
    const html = read(file);
    assert.match(html, /1:05/);
    assert.match(html, /3:05/);
    assert.match(html, /[Ll]ocation announced weekly/);
    assert.doesNotMatch(html, /1:00\s?PM|SCE 301/);
  }
});

test('every local link, asset and fragment resolves, including migrated URLs', () => {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
  for (const file of walk(root).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = raw.replaceAll('&amp;', '&');
      if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
      const [pathname, hash] = url.split('#');
      const target = pathname
        ? path.resolve(
            pathname.startsWith('/') ? root : path.dirname(file),
            '.' + (pathname.startsWith('/') ? pathname : '/' + pathname),
          )
        : file;
      const resolved =
        target.endsWith(path.sep) || !path.extname(target)
          ? path.join(target, 'index.html')
          : target;
      assert.ok(existsSync(resolved), `${path.relative(root, file)}: missing ${url}`);
      if (hash)
        assert.ok(
          readFileSync(resolved, 'utf8').includes(`id="${hash}"`),
          `${url}: missing fragment`,
        );
    }
  }
});
