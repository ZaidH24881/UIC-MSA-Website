import type { EventRecord } from '../../lib/events';
import { configured, demoMode, published } from '../admin-client';
import { eventRecord } from '../../lib/admin-schema.mjs';
let cache: Promise<EventRecord[]> | null = null;
async function fetchEvents(): Promise<EventRecord[]> {
  let base: EventRecord[] = [];
  if (await demoMode()) {
    const seed = await import('../../data/events.json');
    base = seed.default.events as EventRecord[];
  } else if (configured) {
    const { db } = await import('../../lib/firebase-client');
    const { collection, getDocs } = await import('firebase/firestore/lite');
    base = (await getDocs(collection(db, 'events'))).docs.map(
      (d) => ({ ...d.data(), slug: d.id }) as EventRecord,
    );
  }
  // Preserve the existing event collection during the migration. CMS records override by slug.
  const edits = await published();
  for (const r of edits.filter((r) => r.kind === 'events')) {
    base = base.filter((e) => e.slug !== r.id);
    if (!r.archived) base.push(eventRecord(r) as EventRecord);
  }
  return base;
}
function load() {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    fetchEvents(),
    new Promise<EventRecord[]>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Timed out loading events.')), 8000);
    }),
  ])
    .finally(() => clearTimeout(timer))
    .catch((error) => {
      cache = null;
      throw error;
    });
}
export function getEvents() {
  return (cache ||= load());
}
export function refreshEvents() {
  return (cache = load());
}
