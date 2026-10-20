import { published, type RecordData } from './admin-client';
import { seedRecords } from '../lib/admin-seed';
import { validate } from '../lib/admin-schema.mjs';
import { el, renderRecord } from './content-render';
const relevant = ['/prayer/', '/donate/', '/resources/lectures/'].includes(location.pathname);
const givingGrid = document.querySelector<HTMLElement>('.method-grid');
const loading = el('p', 'Checking current giving details…', 'fine-print');
if (givingGrid) {
  givingGrid.hidden = true;
  givingGrid.before(loading);
}
async function hydrate() {
  let timer: ReturnType<typeof setTimeout>;
  const live = await Promise.race([
    published(),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Content request timed out.')), 8000);
    }),
  ]).finally(() => clearTimeout(timer));
  for (const record of live) validate(record.kind, record.data);
  const records: RecordData[] = [
    ...seedRecords.filter((r) => !live.some((x) => x.kind === r.kind && x.id === r.id)),
    ...live,
  ];
  if (location.pathname === '/prayer/') {
    const current = live.find((r) => r.kind === 'prayer' && r.id === 'current' && r.revision > 0);
    if (current) {
      const target = document.querySelector('[data-prayer-content]')!;
      target.replaceChildren(
        current.archived
          ? el('p', 'Prayer details are being updated. Contact MSA before visiting.', 'notice')
          : renderRecord(current),
      );
      document
        .querySelectorAll<HTMLElement>('[data-prayer-poster]')
        .forEach((e) => (e.hidden = true));
    }
  }
  if (location.pathname === '/donate/') {
    const campaign = live.find((r) => r.kind === 'giving' && r.id === 'campaign');
    if (campaign) {
      document.querySelector<HTMLElement>('.giving-story')!.hidden = campaign.archived;
      document.querySelector<HTMLElement>('.giving-options > p:not(.eyebrow)')!.hidden =
        campaign.archived;
      document.querySelector('#giving-story-title')!.textContent = campaign.data.title;
      document.querySelector('.giving-story-copy > p:not(.eyebrow)')!.textContent =
        campaign.data.description;
      document.querySelector('.giving-options > p:not(.eyebrow)')!.textContent =
        campaign.data.purpose;
    }
    if (live.some((r) => r.kind === 'donations' && r.revision > 0)) {
      const methods = records
        .filter((r) => r.kind === 'donations' && !r.archived)
        .sort((a, b) => a.data.order - b.data.order);
      const grid = document.querySelector('.method-grid') || el('div', '', 'method-grid');
      if (!grid.isConnected)
        document.querySelector('[data-donation-methods]')!.replaceChildren(grid);
      grid.replaceChildren(...methods.map(renderRecord));
      if (!methods.length)
        grid.append(
          el(
            'p',
            'Online giving is currently unavailable. Contact uicmsa@gmail.com about supporting MSA.',
            'notice',
          ),
        );
      document
        .querySelectorAll<HTMLElement>('[data-donation-poster]')
        .forEach((e) => (e.hidden = true));
      const supplied = document.querySelector('[data-donation-date]');
      if (supplied)
        supplied.textContent =
          'Recipient details maintained by the MSA board. Confirm the recipient before sending.';
    }
  }
  if (location.pathname === '/resources/lectures/') {
    const recordings = records
      .filter((r) => r.kind === 'khutbahs' && !r.archived)
      .sort((a, b) => a.data.order - b.data.order);
    const grid = document.querySelector('.video-grid')!;
    grid.prepend(...recordings.map(renderRecord));
  }
}
if (relevant)
  void hydrate()
    .catch(() => {
      const parent = document.querySelector('.page-content');
      if (parent) {
        const note = el(
          'p',
          location.pathname === '/prayer/'
            ? 'Live updates are unavailable. The schedule below was supplied September 11, 2026; confirm current times and room with MSA.'
            : location.pathname === '/donate/'
              ? 'Live recipient updates are unavailable. Confirm payment details with MSA before sending.'
              : 'New recordings could not be loaded. Previously published recordings remain below.',
          'notice',
        );
        parent.prepend(note);
      }
      // Financial destinations must not silently fall back when newer data cannot be checked.
      if (location.pathname === '/donate/')
        document.querySelectorAll<HTMLElement>('.method-grid').forEach((e) => {
          e.replaceChildren(el('p', 'Please contact uicmsa@gmail.com for current giving details.'));
        });
    })
    .finally(() => {
      loading.remove();
      if (givingGrid) givingGrid.hidden = false;
    });
