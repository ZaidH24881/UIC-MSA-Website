// One-time migration: copy src/data/events.json into Firestore, one document
// per event (doc ID = slug). Run this once, locally, after Firebase Console
// setup (see docs/board-events-setup.md) and before removing events.json.
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/migrate-events-to-firestore.mjs
//
// service-account.json comes from Firebase Console -> Project settings ->
// Service accounts -> Generate new private key. Never commit this file
// (it's covered by .gitignore's `service-account*.json` entry).
import { readFile } from 'node:fs/promises';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const events = JSON.parse(await readFile('src/data/events.json', 'utf8')).events;

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

for (const event of events) {
  await db.collection('events').doc(event.slug).set(event);
  console.log(`Migrated: ${event.slug}`);
}

console.log(`Done. Migrated ${events.length} event(s) to Firestore.`);
