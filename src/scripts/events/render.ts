import { dateLabel, shortDateLabel, timeLabel, type EventRecord } from '../../lib/events';

export function eventHref(event: EventRecord): string {
  return `/events/?event=${event.slug}`;
}

function statusLabel(status: string): HTMLElement {
  const el = document.createElement('span');
  el.className = 'status-label';
  el.textContent = status;
  return el;
}

function inProgress(event: EventRecord, past: boolean): boolean {
  return event.status === 'confirmed' && !past && Date.now() >= new Date(event.start).getTime();
}

// Full card, used on /events/ and /ramadan/ (the `.event-grid`/`.event-card` shape).
export function renderEventCard(event: EventRecord, { past = false } = {}): HTMLElement {
  const card = document.createElement('article');
  card.className = 'event-card';
  card.id = `event-${event.slug}`;

  if (event.photo) {
    const img = document.createElement('img');
    img.className = 'event-photo';
    img.src = event.photo;
    img.alt = event.photoAlt || '';
    img.width = 600;
    img.height = 400;
    img.loading = 'lazy';
    card.appendChild(img);
  }

  const date = document.createElement('p');
  date.className = 'event-date';
  date.textContent = dateLabel(event.start);
  card.appendChild(date);

  const h3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = eventHref(event);
  titleLink.dataset.eventLink = event.slug;
  titleLink.textContent = event.title;
  h3.appendChild(titleLink);
  card.appendChild(h3);

  const meta = document.createElement('p');
  meta.textContent = `${timeLabel(event.start)} · ${event.location || 'Location to be confirmed'}`;
  card.appendChild(meta);

  if (event.status !== 'confirmed') card.appendChild(statusLabel(event.status));
  else if (inProgress(event, past)) {
    const label = document.createElement('p');
    label.className = 'event-date';
    label.textContent = 'In progress';
    card.appendChild(label);
  }

  const desc = document.createElement('p');
  desc.textContent = past ? event.recap || event.description : event.description;
  card.appendChild(desc);

  const detailLink = document.createElement('a');
  detailLink.className = 'text-link';
  detailLink.href = eventHref(event);
  detailLink.dataset.eventLink = event.slug;
  detailLink.textContent = past ? 'View recap' : 'Event details';
  card.appendChild(detailLink);

  return card;
}

// Compact row with its own date column, used by EventList's compact mode
// (homepage "Upcoming" panel, events-index sidebar default agenda).
export function renderCompactItem(event: EventRecord, { past = false } = {}): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'event-agenda-item';

  const date = document.createElement('span');
  date.className = 'event-agenda-date';
  date.textContent = shortDateLabel(event.start);
  item.appendChild(date);

  const link = document.createElement('a');
  link.className = 'event-agenda-title';
  link.href = eventHref(event);
  link.dataset.eventLink = event.slug;
  link.textContent = event.title;
  item.appendChild(link);

  const meta = document.createElement('span');
  meta.className = 'event-agenda-meta';
  meta.textContent = `${timeLabel(event.start)} · ${event.location || 'Location to be confirmed'}`;
  item.appendChild(meta);

  if (event.status !== 'confirmed') item.appendChild(statusLabel(event.status));
  else if (inProgress(event, past)) {
    const label = document.createElement('span');
    label.className = 'event-date';
    label.textContent = 'In progress';
    item.appendChild(label);
  }

  return item;
}

// Plain agenda row (no date column — the selected day already gives the date),
// used by the calendar's day-agenda list.
export function renderAgendaItem(event: EventRecord): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'event-agenda-item';

  const link = document.createElement('a');
  link.className = 'event-agenda-title';
  link.href = eventHref(event);
  link.dataset.eventLink = event.slug;
  link.textContent = event.title;
  item.appendChild(link);

  const meta = document.createElement('span');
  meta.className = 'event-agenda-meta';
  meta.textContent = `${timeLabel(event.start)} · ${event.location || 'Location to be confirmed'}`;
  item.appendChild(meta);

  if (event.status !== 'confirmed') item.appendChild(statusLabel(event.status));

  return item;
}
