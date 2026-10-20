// Local-only adapter. Never included in the Cloudflare worker or static output.
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { validate } from '../src/lib/admin-schema.mjs';
const sessions = new Map();
let queue = Promise.resolve();
const file = '.local-admin/content-' + (process.env.PORT || '4322') + '.json';
async function read() {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return {
      published: JSON.parse(await readFile('dist/admin-seed.json', 'utf8')),
      drafts: [],
      history: [],
    };
  }
}
export async function demoRequest(req, res, url) {
  if (!url.pathname.startsWith('/__admin/')) return false;
  const send = (status, value) => {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(JSON.stringify(value));
  };
  if (process.env.ADMIN_DEMO !== '1') {
    send(404, { error: 'Preview editing is disabled.' });
    return true;
  }
  const expected = `http://127.0.0.1:${process.env.PORT || 4322}`;
  if (
    req.headers.host !== new URL(expected).host ||
    (req.headers.origin && req.headers.origin !== expected)
  ) {
    send(403, { error: 'Same-origin requests only.' });
    return true;
  }
  if (
    req.method !== 'GET' &&
    (req.method !== 'POST' ||
      req.headers.origin !== expected ||
      req.headers['content-type'] !== 'application/json')
  ) {
    send(403, { error: 'Invalid request origin or content type.' });
    return true;
  }
  const token = req.headers.cookie?.match(/(?:^|; )msa_demo=([a-f0-9]+)/)?.[1];
  const signedIn = sessions.has(token) && sessions.get(token) > Date.now();
  const action = url.pathname.slice('/__admin/'.length);
  const identity = {
    user: signedIn ? 'Local board demo' : null,
    editor: signedIn,
    treasurer: signedIn,
    demo: true,
    configured: true,
  };
  if (req.method === 'GET') {
    if (action === 'session') send(200, identity);
    else if (['published', 'drafts', 'history'].includes(action)) {
      if (action !== 'published' && !signedIn) send(401, { error: 'Sign in first.' });
      else {
        try {
          send(200, (await read())[action]);
        } catch {
          send(500, { error: 'Unable to read local content.' });
        }
      }
    } else send(404, { error: 'Not found.' });
    return true;
  }
  try {
    let text = '';
    for await (const chunk of req) {
      text += chunk;
      if (Buffer.byteLength(text) > 1100000) throw new Error('Request too large.');
    }
    const body = JSON.parse(text);
    if (action === 'login') {
      if (body.password !== 'password') {
        send(401, { error: 'Incorrect password.' });
        return true;
      }
      const next = randomBytes(32).toString('hex');
      sessions.set(next, Date.now() + 8 * 60 * 60 * 1000);
      res.setHeader(
        'Set-Cookie',
        `msa_demo=${next}; HttpOnly; SameSite=Strict; Path=/__admin/; Max-Age=28800`,
      );
      send(200, { ...identity, user: 'Local board demo', editor: true, treasurer: true });
      return true;
    }
    if (action === 'logout') {
      sessions.delete(token);
      res.setHeader(
        'Set-Cookie',
        'msa_demo=; HttpOnly; SameSite=Strict; Path=/__admin/; Max-Age=0',
      );
      send(200, {});
      return true;
    }
    if (!signedIn) {
      send(401, { error: 'Sign in first.' });
      return true;
    }
    if (action !== 'save' || !['draft', 'publish'].includes(body.action))
      throw new Error('Unknown action.');
    const r = body.record;
    validate(r.kind, r.data);
    if (
      !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id) ||
      r.id.length > 100 ||
      !Number.isInteger(r.revision) ||
      typeof r.archived !== 'boolean'
    )
      throw new Error('Invalid record.');
    const task = queue.then(async () => {
      const state = await read();
      const same = (item) => item.kind === r.kind && item.id === r.id;
      const current = state.published.find(same);
      if ((current?.revision || 0) !== r.revision)
        throw new Error('A newer revision was published. Reload before saving.');
      const priorDraft = state.drafts.find(same);
      if (priorDraft && priorDraft.updatedAt !== r.updatedAt)
        throw new Error('A newer draft exists. Reload before saving.');
      const now = new Date().toISOString();
      const next = {
        kind: r.kind,
        id: r.id,
        data: r.data,
        revision: r.revision + (body.action === 'publish' ? 1 : 0),
        schemaVersion: 1,
        archived: r.archived,
        updatedBy: 'Local board demo',
        updatedAt: now,
        publishedAt: body.action === 'publish' ? now : current?.publishedAt || '',
      };
      state.drafts = state.drafts.filter((item) => !same(item));
      if (body.action === 'draft') state.drafts.push(next);
      else {
        state.published = state.published.filter((item) => !same(item));
        state.published.push(next);
        state.history.push(next);
      }
      await mkdir('.local-admin', { recursive: true });
      await writeFile(file + '.tmp', JSON.stringify(state, null, 2));
      await rename(file + '.tmp', file);
      return next;
    });
    queue = task.catch(() => {});
    send(200, await task);
  } catch (error) {
    send(400, { error: error.message || 'Could not save. Your edits are preserved.' });
  }
  return true;
}
