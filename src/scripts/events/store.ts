import { collection, getDocs } from 'firebase/firestore/lite';
import { db } from '../../lib/firebase-client';
import type { EventRecord } from '../../lib/events';

let cache: Promise<EventRecord[]> | null = null;

async function fetchEvents(): Promise<EventRecord[]> {
  const snapshot = await getDocs(collection(db, 'events'));
  return snapshot.docs.map((doc) => ({ ...(doc.data() as EventRecord), slug: doc.id }));
}

// A stalled connection to Firestore shouldn't leave every event list on the
// site stuck on its loading skeleton forever — fail into the empty state
// instead after a reasonable wait, and allow the next call to retry.
function withTimeout(promise: Promise<EventRecord[]>): Promise<EventRecord[]> {
  return Promise.race([
    promise,
    new Promise<EventRecord[]>((_, reject) =>
      setTimeout(() => reject(new Error('Timed out loading events.')), 8000),
    ),
  ]).catch((error) => {
    cache = null;
    throw error;
  });
}

// Cached for the page's lifetime — one read per page load, not a live
// subscription. refreshEvents() is called after the board member's own write
// so their view updates instantly; other visitors get it on their next load.
export function getEvents(): Promise<EventRecord[]> {
  if (!cache) cache = withTimeout(fetchEvents());
  return cache;
}

export function refreshEvents(): Promise<EventRecord[]> {
  cache = withTimeout(fetchEvents());
  return cache;
}
