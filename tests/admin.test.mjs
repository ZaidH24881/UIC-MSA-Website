import test from 'node:test';
import assert from 'node:assert/strict';
import { blank, validate, chicagoInstant, validUrl } from '../src/lib/admin-schema.mjs';
test('Chicago wall times handle daylight saving and reject ambiguous/nonexistent times', () => {
  assert.equal(chicagoInstant('2026-07-10T13:05'), '2026-07-10T18:05:00.000Z');
  assert.equal(chicagoInstant('2026-01-10T13:05'), '2026-01-10T19:05:00.000Z');
  assert.throws(() => chicagoInstant('2026-03-08T02:30'));
  assert.throws(() => chicagoInstant('2026-11-01T01:30'));
  assert.throws(() => chicagoInstant('2026-02-30T13:05'));
});
test('Content validates required fields, URLs, schema and event order', () => {
  const d = {
    ...blank('events'),
    title: 'Gathering',
    description: 'Community gathering',
    start: '2026-10-30T13:00',
    end: '2026-10-30T14:00',
    location: 'SCE',
    audience: 'All students',
  };
  assert.doesNotThrow(() => validate('events', d));
  assert.throws(() => validate('events', { ...d, end: d.start }));
  assert.throws(() => validate('events', { ...d, rsvpUrl: 'javascript:alert(1)' }));
  assert.throws(() => validate('events', { ...d, title: '' }));
  assert.throws(() => validate('events', { ...d, extra: 'unexpected' }));
  assert.throws(() => validate('events', { ...d, flyer: 'data:image/svg+xml,<svg/>' }));
  assert.equal(validUrl('https://youtube.com.evil.example/watch?v=example', true), false);
  assert.equal(validUrl('https://user:pass@example.com'), false);
});
test('Prayer dates and bounded field sizes are enforced', () => {
  const d = {
    ...blank('prayer'),
    title: 'Prayer',
    location: 'SCE',
    effectiveFrom: '2026-10-01',
    effectiveTo: '2026-10-30',
    time1: '13:05',
    dailyLocation: '315',
    dailyHours: '11–9',
    dailyDirections: 'Third floor',
  };
  assert.doesNotThrow(() => validate('prayer', d));
  assert.throws(() => validate('prayer', { ...d, effectiveTo: '2026-09-30' }));
  assert.throws(() => validate('prayer', { ...d, time1: '25:00' }));
  assert.throws(() => validate('prayer', { ...d, effectiveFrom: '2026-02-30' }));
  assert.throws(() => validate('prayer', { ...d, announcement: 'x'.repeat(5001) }));
});
