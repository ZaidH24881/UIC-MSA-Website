import { getEvents } from './store';
import { currentEvents } from '../../lib/events';

async function run() {
  const active = document.querySelector<HTMLElement>('[data-ramadan-active]');
  const inactive = document.querySelector<HTMLElement>('[data-ramadan-inactive]');
  if (!active || !inactive) return;
  let hasSeason = false;
  try {
    const events = await getEvents();
    hasSeason = currentEvents(events).some((event) => event.category === 'ramadan');
  } catch {
    hasSeason = false;
  }
  active.hidden = !hasSeason;
  inactive.hidden = hasSeason;
}

void run();
export {};
