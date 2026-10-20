import { schemas, blank, validate } from '../lib/admin-schema.mjs';
import { seedRecords } from '../lib/admin-seed';
import {
  session,
  login,
  logout,
  published,
  privateRecords,
  save,
  type RecordData,
} from './admin-client';
import { el, renderRecord } from './content-render';
import { getEvents } from './events/store';
import { chicagoLocalInputFromIso } from '../lib/events';
const root = document.querySelector<HTMLElement>('[data-admin-workspace]')!;
const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
const status = $('[data-admin-status]');
const kind = root.dataset.section!;
const schema = (schemas as Record<string, any>)[kind];
const form = $<HTMLFormElement>('[data-content-form]');
const selector = $<HTMLSelectElement>('[data-admin-record]');
let records: RecordData[] = [],
  drafts: RecordData[] = [],
  history: RecordData[] = [],
  current: RecordData;
let dirty = false,
  busy = false,
  canPublish = true;
const message = (s: string) => {
  status.textContent = s;
};
const report = (error: unknown) =>
  message(
    error instanceof Error
      ? error.message
      : 'Unable to complete this action. Your edits are preserved.',
  );
const same = (a: RecordData, b: RecordData) => a.kind === b.kind && a.id === b.id;
const control = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
function leave() {
  return !dirty || confirm('Leave without saving your current edits?');
}
window.addEventListener('beforeunload', (e) => {
  if (dirty) {
    e.preventDefault();
  }
});
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest('a[href]');
  if (a && dirty && !leave()) e.preventDefault();
});
async function loadData() {
  const [live, d, h] = await Promise.all([
    published(),
    privateRecords('drafts'),
    privateRecords('history'),
  ]);
  records = [...seedRecords] as RecordData[];
  if (kind === 'events') {
    for (const event of await getEvents())
      records.push({
        kind: 'events',
        id: event.slug,
        data: {
          ...blank('events'),
          ...Object.fromEntries(
            Object.keys(schemas.events).map((key) => [key, (event as any)[key] || '']),
          ),
          start: chicagoLocalInputFromIso(event.start),
          end: chicagoLocalInputFromIso(event.end),
        },
        revision: 0,
        schemaVersion: 1,
        archived: false,
        updatedAt: '',
        publishedAt: '',
        updatedBy: 'Existing event',
      });
  }
  for (const r of live) {
    records = records.filter((x) => !same(x, r));
    records.push(r);
  }
  drafts = d;
  history = h;
  if (selector) {
    selector.replaceChildren(new Option('Choose an entry…', ''));
    const combined = [...records];
    for (const r of drafts) {
      if (!combined.some((x) => same(x, r))) combined.push(r);
    }
    for (const r of combined.filter((x) => x.kind === kind)) {
      selector.add(
        new Option(
          `${r.data.title}${r.archived ? ' · archived' : ''}${drafts.some((x) => same(x, r)) ? ' · draft' : ''}`,
          r.id,
        ),
      );
    }
  }
}
function fresh() {
  const data = blank(kind);
  if (kind === 'events') {
    data.audience = 'All students';
    data.location = 'TBD';
  }
  return {
    kind,
    id: kind === 'prayer' ? 'current' : kind === 'giving' ? 'campaign' : '',
    data,
    revision: 0,
    schemaVersion: 1,
    archived: false,
    updatedAt: '',
    publishedAt: '',
    updatedBy: '',
  };
}
function display(record: RecordData) {
  current = structuredClone(record);
  form.reset();
  control('id').value = record.id;
  control('id').disabled = Boolean(
    record.id && (records.some((r) => same(r, record)) || drafts.some((r) => same(r, record))),
  );
  for (const [key, f] of Object.entries(schema) as [string, any][]) {
    if (f.type === 'image') {
      const img = $<HTMLImageElement>('[data-flyer-preview]');
      img.hidden = !record.data[key];
      if (record.data[key]) img.src = record.data[key];
      continue;
    }
    control(key).value = String(record.data[key] ?? '');
  }
  control('archived').checked = record.archived;
  selector.value = record.id;
  dirty = false;
  $('[data-revision]').textContent =
    `Revision ${record.revision} · ${record.updatedBy || 'New entry'}${record.updatedAt ? ' · ' + new Date(record.updatedAt).toLocaleString() : ''}`;
  $('[data-admin-preview]').hidden = true;
  const target = $('[data-history]');
  target.replaceChildren();
  const revisions = history.filter((r) => same(r, record)).sort((a, b) => b.revision - a.revision);
  if (!revisions.length) target.append(el('p', 'No published revisions yet.'));
  for (const old of revisions) {
    const b = el(
      'button',
      `Restore revision ${old.revision} · ${new Date(old.publishedAt).toLocaleString()} · ${old.updatedBy}`,
    ) as HTMLButtonElement;
    b.type = 'button';
    b.addEventListener('click', () => {
      if (!leave()) return;
      display({ ...current, data: structuredClone(old.data), archived: old.archived });
      dirty = true;
      message('Earlier content loaded. Preview and publish to restore it.');
    });
    target.append(b);
  }
}
function readForm() {
  if (!form.reportValidity()) throw new Error('Complete the highlighted fields.');
  const r = structuredClone(current);
  r.id = control('id').value.trim();
  r.archived = control('archived').checked;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id))
    throw new Error('Use a lowercase entry ID separated by hyphens.');
  if (!control('id').disabled && [...records, ...drafts].some((x) => same(x, r)))
    throw new Error('That entry ID already exists. Choose it from the entry list.');
  for (const [key, f] of Object.entries(schema) as [string, any][])
    if (f.type !== 'image')
      r.data[key] = f.type === 'number' ? Number(control(key).value) : control(key).value.trim();
  validate(kind, r.data);
  return r;
}
function preview(r: RecordData) {
  $('[data-preview-body]').replaceChildren(renderRecord(r));
  $('[data-admin-preview]').hidden = false;
}
async function persist(action: 'draft' | 'publish') {
  if (busy) return;
  try {
    const r = readForm();
    preview(r);
    if (action === 'publish' && !canPublish)
      throw new Error(
        'A treasurer or administrator must publish donation changes. You can save a draft.',
      );
    if (action === 'publish' && ['donations', 'giving'].includes(kind)) {
      const prior = records.find((x) => same(x, r));
      const description =
        kind === 'donations'
          ? `Previous recipient: ${prior?.data.recipient || '(new)'}\nPrevious URL: ${prior?.data.url || '(none)'}\n\nNew recipient: ${r.data.recipient}\nNew URL: ${r.data.url || '(none)'}\nArchived: ${r.archived}`
          : 'Publish the reviewed giving campaign text?';
      if (
        !confirm(
          `Review donation changes before publishing:\n\n${description}\n\nConfirm these details are authorized and correct.`,
        )
      )
        return;
    }
    busy = true;
    form.inert = true;
    selector.disabled = true;
    $<HTMLButtonElement>('[data-admin-new]').disabled = true;
    form.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = true));
    message(action === 'draft' ? 'Saving draft…' : 'Publishing…');
    const saved = await save(r, action);
    dirty = false;
    await loadData();
    display((action === 'draft' ? drafts : records).find((x) => same(x, saved)) || saved);
    message(
      action === 'draft'
        ? 'Draft saved. Public pages are unchanged.'
        : 'Published. Visitors see this revision on their next page load.',
    );
  } catch (error) {
    report(error);
  } finally {
    busy = false;
    form.inert = false;
    selector.disabled = false;
    $<HTMLButtonElement>('[data-admin-new]').disabled = false;
    form.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = false));
  }
}
function buildFields() {
  const target = $('[data-admin-fields]');
  for (const [key, f] of Object.entries(schema) as [string, any][]) {
    const wrap = el('div', '', 'admin-field'),
      label = el('label', f.label) as HTMLLabelElement;
    label.htmlFor = 'field-' + key;
    let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (f.choices) {
      input = document.createElement('select');
      for (const value of f.choices) input.add(new Option(value || 'None', value));
    } else if (f.type === 'textarea') input = document.createElement('textarea');
    else {
      input = document.createElement('input');
      input.type =
        f.type === 'image'
          ? 'file'
          : f.type === 'asset'
            ? 'text'
            : f.type === 'media'
              ? 'url'
              : f.type;
    }
    input.name = key;
    input.id = 'field-' + key;
    input.required = f.required;
    wrap.append(label, input);
    if (f.type === 'number') {
      (input as HTMLInputElement).min = '0';
      (input as HTMLInputElement).max = '9999';
      (input as HTMLInputElement).step = '1';
    }
    if (f.type === 'image') {
      const file = input as HTMLInputElement;
      file.accept = 'image/*';
      const img = document.createElement('img');
      img.dataset.flyerPreview = '';
      img.alt = 'Selected flyer preview';
      img.hidden = true;
      wrap.append(img);
      file.addEventListener('change', async () => {
        try {
          const selected = file.files?.[0];
          if (!selected) return;
          if (selected.size > 15000000) throw new Error('Choose an image under 15 MB.');
          const bitmap = await createImageBitmap(selected);
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, 1000 / bitmap.width);
          canvas.width = Math.round(bitmap.width * scale);
          canvas.height = Math.round(bitmap.height * scale);
          canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          bitmap.close();
          let quality = 0.8,
            value = canvas.toDataURL('image/jpeg', quality);
          while (value.length > 900000 && quality > 0.15) {
            quality -= 0.1;
            value = canvas.toDataURL('image/jpeg', quality);
          }
          if (value.length > 900000) throw new Error('Choose a smaller flyer image.');
          current.data.flyer = value;
          img.src = value;
          img.hidden = false;
          dirty = true;
        } catch (error) {
          report(error);
        }
      });
      const remove = el('button', 'Remove flyer', 'text-link') as HTMLButtonElement;
      remove.type = 'button';
      remove.addEventListener('click', () => {
        current.data.flyer = '';
        img.hidden = true;
        file.value = '';
        dirty = true;
      });
      wrap.append(remove);
    }
    target.append(wrap);
  }
  form.addEventListener('input', () => {
    dirty = true;
    message('Unsaved changes');
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    void persist('publish');
  });
  $('[data-save-draft]').addEventListener('click', () => void persist('draft'));
  $('[data-preview]').addEventListener('click', () => {
    try {
      preview(readForm());
      $('[data-admin-preview]').scrollIntoView({ block: 'nearest' });
    } catch (error) {
      report(error);
    }
  });
  selector.addEventListener('change', () => {
    if (!leave()) {
      selector.value = current.id;
      return;
    }
    const record =
      drafts.find((r) => r.kind === kind && r.id === selector.value) ||
      records.find((r) => r.kind === kind && r.id === selector.value);
    display(record || fresh());
    message('');
  });
  $('[data-admin-new]').addEventListener('click', () => {
    if (leave()) {
      display(fresh());
      message('');
    }
  });
  if (['prayer', 'giving'].includes(kind)) $('[data-admin-new]').hidden = true;
}
async function initialize() {
  try {
    const s = await session();
    $('[data-admin-mode]').textContent = s.demo
      ? 'Local preview workspace · edits stay on this computer and never change the live website.'
      : s.configured
        ? 'Board workspace · published updates appear across the website.'
        : 'Board workspace needs Firebase configuration before production sign-in is available.';
    $('[data-password-field]').hidden = !s.demo;
    $<HTMLInputElement>('#board-password').required = s.demo;
    $('[data-login-description]').textContent = s.demo
      ? 'Use the preview password to explore the board tools.'
      : 'Sign in with your approved board Google account.';
    $('[data-admin-login]').hidden = Boolean(s.user);
    $('[data-admin-authorized]').hidden = !s.editor;
    if (!s.user) return;
    if (!s.editor) {
      message(
        'This account is not approved for board editing. Sign out and use an approved board account.',
      );
      $('[data-admin-authorized]').hidden = false;
      $('[data-admin-authorized] .admin-shell').hidden = true;
      return;
    }
    $('[data-admin-identity]').textContent = `Signed in as ${s.user}`;
    canPublish = !['donations', 'giving'].includes(kind) || s.treasurer;
    await loadData();
    if (schema) {
      const first = drafts.find((r) => r.kind === kind) || records.find((r) => r.kind === kind);
      display(first || fresh());
      if (!canPublish)
        message(
          'You can save drafts here. A treasurer or administrator must publish financial changes.',
        );
    }
    $('.admin-shell').hidden = false;
  } catch (error) {
    report(error);
  }
}
if (schema) buildFields();
$<HTMLFormElement>('[data-login-form]').addEventListener('submit', async (e) => {
  e.preventDefault();
  const b = $<HTMLButtonElement>('[data-login-button]');
  b.disabled = true;
  try {
    await login($<HTMLInputElement>('#board-password').value);
    $<HTMLInputElement>('#board-password').value = '';
    message('');
    await initialize();
  } catch (error) {
    report(error);
  } finally {
    b.disabled = false;
  }
});
$('[data-admin-signout]').addEventListener('click', async () => {
  if (!leave()) return;
  try {
    await logout();
    dirty = false;
    location.assign('/admin/');
  } catch (error) {
    report(error);
  }
});
void initialize();
