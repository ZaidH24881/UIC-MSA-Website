import { getEvents } from './store';
import { dateLabel, timeLabel, type EventRecord } from '../../lib/events';

const dialog = document.querySelector<HTMLDialogElement>('#event-dialog');

if (dialog && typeof dialog.showModal === 'function') {
  const flyer = dialog.querySelector<HTMLImageElement>('[data-event-dialog-flyer]')!;
  const title = dialog.querySelector<HTMLElement>('[data-event-dialog-title]')!;
  const dateEl = dialog.querySelector<HTMLElement>('[data-event-dialog-date]')!;
  const timeEl = dialog.querySelector<HTMLElement>('[data-event-dialog-time]')!;
  const locationEl = dialog.querySelector<HTMLElement>('[data-event-dialog-location]')!;
  const audienceEl = dialog.querySelector<HTMLElement>('[data-event-dialog-audience]')!;
  const statusEl = dialog.querySelector<HTMLElement>('[data-event-dialog-status]')!;
  const descriptionEl = dialog.querySelector<HTMLElement>('[data-event-dialog-description]')!;
  const rsvpEl = dialog.querySelector<HTMLAnchorElement>('[data-event-dialog-rsvp]')!;
  let opener: HTMLElement | null = null;

  const open = (event: EventRecord) => {
    const past = new Date(event.end) <= new Date();
    if (event.flyer) {
      flyer.src = event.flyer;
      flyer.alt = `${event.title} flyer`;
      flyer.hidden = false;
    } else {
      flyer.hidden = true;
      flyer.removeAttribute('src');
    }
    title.textContent = event.title;
    dateEl.textContent = dateLabel(event.start);
    timeEl.textContent = `${timeLabel(event.start)} – ${timeLabel(event.end)}`;
    locationEl.textContent = event.location || 'Location to be confirmed';
    audienceEl.textContent = event.audience;
    if (event.status !== 'confirmed') {
      statusEl.textContent = `This event is ${event.status}.`;
      statusEl.hidden = false;
    } else {
      statusEl.hidden = true;
    }
    descriptionEl.textContent = past ? event.recap || event.description : event.description;
    if (!past && event.status === 'confirmed' && event.rsvpUrl) {
      rsvpEl.href = event.rsvpUrl;
      rsvpEl.textContent = `Register for ${event.title}`;
      rsvpEl.hidden = false;
    } else {
      rsvpEl.hidden = true;
    }
    dialog.showModal();
  };

  const openBySlug = async (slug: string) => {
    const events = await getEvents().catch(() => [] as EventRecord[]);
    const event = events.find((e) => e.slug === slug);
    if (event) open(event);
  };

  document.addEventListener('click', (clickEvent) => {
    const link = (clickEvent.target as HTMLElement).closest<HTMLAnchorElement>('[data-event-link]');
    if (!link) return;
    clickEvent.preventDefault();
    opener = link;
    void openBySlug(link.dataset.eventLink!);
  });

  dialog.querySelector('[data-close-event]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());

  const initialSlug = new URLSearchParams(location.search).get('event');
  if (initialSlug) void openBySlug(initialSlug);
}

export {};
