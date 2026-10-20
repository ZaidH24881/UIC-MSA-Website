import { prayer, donations } from '../data/site';
import { blank } from './admin-schema.mjs';
export const seedRecords = [
  {
    kind: 'prayer',
    id: 'current',
    data: {
      ...blank('prayer'),
      title: 'Friday & daily prayer',
      location: prayer.weeklyLocation || prayer.location,
      effectiveFrom: prayer.receivedAt,
      effectiveTo: prayer.receivedAt,
      time1: '13:05',
      time2: '15:05',
      dailyLocation: prayer.daily.location || '',
      dailyHours: prayer.daily.hours || '',
      dailyDirections: prayer.daily.directions || '',
      accessibility: prayer.daily.accessibilityDirections || '',
    },
  },
  {
    kind: 'giving',
    id: 'campaign',
    data: {
      title: 'Be part of someone’s reason to belong.',
      description:
        'A meal shared after a long day. A new friend across the table. A gathering that brings us closer. Help create more of these moments at UIC.',
      purpose: donations.purpose,
    },
  },
  ...(donations.enabled ? donations.methods : []).map((m, i) => ({
    kind: 'donations',
    id: m.name.toLowerCase(),
    data: {
      title: m.name,
      recipient: m.recipient,
      alternative: m.alternative || '',
      instruction: m.instruction,
      url: m.url || '',
      order: i,
    },
  })),
].map((r) => ({
  ...r,
  revision: 0,
  schemaVersion: 1,
  archived: false,
  updatedAt: prayer.receivedAt + 'T12:00:00.000Z',
  publishedAt: prayer.receivedAt + 'T12:00:00.000Z',
  updatedBy: 'Initial website content',
}));
