import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
const root = path.resolve('dist');
const redirects = JSON.parse(await readFile('content/redirects.json', 'utf8'));
const port = Number(process.env.PORT || 4322);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const legacy = pathname.replace(/\/$/, '');
    if (redirects[legacy]) {
      res.writeHead(301, { Location: redirects[legacy] + url.search });
      res.end();
      return;
    }
    let filename = path.resolve(root, '.' + pathname);
    if (filename !== root && !filename.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    try {
      if ((await stat(filename)).isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(301, { Location: pathname + '/' + url.search });
          res.end();
          return;
        }
        filename = path.join(filename, 'index.html');
      }
    } catch {
      /* handled by file read below */
    }
    let status = 200,
      body;
    try {
      body = await readFile(filename);
    } catch {
      status = 404;
      filename = path.join(root, '404.html');
      body = await readFile(filename);
    }
    res.writeHead(status, {
      'Content-Type': mime[path.extname(filename)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(400);
    res.end('Bad request');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Production preview: http://127.0.0.1:${port}`));
