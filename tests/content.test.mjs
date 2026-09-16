import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  upcomingEvents,
  currentEvents,
  activeNotices,
  timeLabel,
  dateLabel,
} from '../src/lib/events.ts';

test('ongoing events remain visible until their end, including cancellations', () => {
  const now = new Date('2027-01-16T08:00:00Z');
  const records = [
    {
      slug: 'overnight',
      start: '2027-01-15T18:00:00-06:00',
      end: '2027-01-16T10:00:00-06:00',
      status: 'confirmed',
    },
    {
      slug: 'cancelled-iftar',
      start: '2027-01-17T18:00:00-06:00',
      end: '2027-01-17T20:00:00-06:00',
      status: 'cancelled',
    },
    {
      slug: 'ended',
      start: '2027-01-15T12:00:00Z',
      end: '2027-01-16T08:00:00Z',
      status: 'confirmed',
    },
  ];
  assert.deepEqual(
    currentEvents(records, now).map((e) => e.slug),
    ['overnight', 'cancelled-iftar'],
  );
});

test('campus dates handle Chicago daylight-saving transitions', () => {
  assert.match(timeLabel('2026-11-01T06:30:00Z'), /1:30 AM CDT/);
  assert.match(timeLabel('2026-11-01T07:30:00Z'), /1:30 AM CST/);
  assert.match(dateLabel('2026-09-12T01:00:00Z'), /September 11, 2026/);
});

test('upcoming ordering and expired notices update with the build clock', () => {
  const now = new Date('2026-09-11T12:00:00Z');
  const records = [
    { slug: 'later', start: '2026-09-14T18:00:00Z', end: '2026-09-14T19:00:00Z' },
    { slug: 'past', start: '2026-09-10T18:00:00Z', end: '2026-09-10T19:00:00Z' },
    { slug: 'next', start: '2026-09-12T18:00:00Z', end: '2026-09-12T19:00:00Z' },
  ];
  assert.deepEqual(
    upcomingEvents(records, now).map((e) => e.slug),
    ['next', 'later'],
  );
  const notices = [
    { title: 'expired', startsAt: '2026-09-10T12:00:00Z', expiresAt: '2026-09-11T12:00:00Z' },
    { title: 'visible', startsAt: '2026-09-11T11:00:00Z', expiresAt: '2026-09-12T12:00:00Z' },
    { title: 'future', startsAt: '2026-10-11T12:00:00Z', expiresAt: '2026-11-11T12:00:00Z' },
  ];
  assert.deepEqual(
    activeNotices(notices, now).map((n) => n.title),
    ['visible'],
  );
});

test('production events have real, unambiguous logistical records', () => {
  const records = JSON.parse(readFileSync('src/data/events.json', 'utf8')).events;
  const slugs = new Set();
  for (const event of records) {
    assert.match(event.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!slugs.has(event.slug));
    slugs.add(event.slug);
    assert.ok(event.title && event.description && event.audience);
    assert.equal(event.timezone, 'America/Chicago');
    for (const time of [event.start, event.end])
      assert.match(time, /T\d\d:\d\d(?::\d\d)?(?:Z|[+-]\d\d:\d\d)$/);
    assert.ok(
      Number.isFinite(Date.parse(event.start)) && Date.parse(event.end) > Date.parse(event.start),
    );
    assert.ok(['confirmed', 'cancelled', 'postponed'].includes(event.status));
    if (event.rsvpUrl) assert.equal(new URL(event.rsvpUrl).protocol, 'https:');
    assert.doesNotMatch(event.title, /fixture|test event|sample event/i);
  }
});
