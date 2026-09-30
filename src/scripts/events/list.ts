import { getEvents } from './store';
import { currentEvents, type EventRecord } from '../../lib/events';
import { renderEventCard, renderCompactItem } from './render';

function selectEvents(
  records: EventRecord[],
  { category, limit, past }: { category: string; limit: number | null; past: boolean },
): EventRecord[] {
  const filtered = records
    .filter((event) => !category || event.category === category)
    .filter((event) => !limit || event.status === 'confirmed');
  const ordered = past
    ? filtered
        .filter((event) => new Date(event.end) <= new Date())
        .sort((a, b) => +new Date(b.start) - +new Date(a.start))
    : currentEvents(filtered);
  return limit ? ordered.slice(0, limit) : ordered;
}

async function hydrate(root: HTMLElement) {
  const compact = root.dataset.mode === 'compact';
  const limit = root.dataset.limit ? Number(root.dataset.limit) : null;
  const category = root.dataset.category || '';
  const past = root.dataset.past === 'true';
  const target = root.querySelector<HTMLElement>('[data-event-list-target]');
  const empty = root.querySelector<HTMLElement>('[data-event-list-empty]');
  const heading = root.querySelector<HTMLElement>('[data-event-list-heading]');
  if (!target) return;

  let events: EventRecord[] = [];
  try {
    events = selectEvents(await getEvents(), { category, limit, past });
  } catch {
    // Fall through to the empty state below.
  }

  target.removeAttribute('aria-busy');
  target.innerHTML = '';
  if (heading) heading.hidden = !(past && events.length > 0);

  if (events.length === 0) {
    target.hidden = true;
    if (empty) empty.hidden = past;
    return;
  }
  target.hidden = false;
  if (empty) empty.hidden = true;
  if (!compact) target.classList.toggle('single-event', events.length === 1);

  for (const event of events) {
    target.appendChild(compact ? renderCompactItem(event, { past }) : renderEventCard(event, { past }));
  }
}

document.querySelectorAll<HTMLElement>('[data-event-list]').forEach((root) => void hydrate(root));

export {};
