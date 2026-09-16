import { readFile, writeFile, readdir } from 'node:fs/promises';
const redirects = JSON.parse(await readFile('content/redirects.json', 'utf8'));
await writeFile(
  'dist/_redirects',
  Object.entries(redirects)
    .flatMap(([from, to]) => [`${from} ${to} 301`, `${from}/ ${to} 301`])
    .join('\n') + '\n',
);
const origin = process.env.SITE_URL;
if (origin) {
  const walk = async (dir) =>
    (
      await Promise.all(
        (await readdir(dir, { withFileTypes: true })).map(async (f) =>
          f.isDirectory() ? walk(`${dir}/${f.name}`) : `${dir}/${f.name}`,
        ),
      )
    ).flat();
  const urls = (await walk('dist'))
    .filter((f) => f.endsWith('/index.html') && !f.includes('/search/'))
    .map((f) => new URL(f.replace(/^dist/, '').replace(/index.html$/, ''), origin).href);
  await writeFile(
    'dist/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`).join('')}</urlset>`,
  );
}
await writeFile(
  'dist/robots.txt',
  `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${new URL('/sitemap.xml', origin).href}\n` : ''}`,
);
await writeFile('dist/.nojekyll', '');
console.log(
  `Prepared ${Object.keys(redirects).length} permanent legacy redirects and static hosting files.`,
);
