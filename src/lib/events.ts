export type EventRecord = {
  slug: string;
  title: string;
  description: string;
  start: string;
  end: string;
  timezone: 'America/Chicago';
  location: string | null;
  audience: string;
  rsvpUrl: string | null;
  status: 'confirmed' | 'cancelled' | 'postponed';
  photo?: string;
  photoAlt?: string;
  flyer?: string;
  recap?: string;
  category?: 'ramadan' | 'community' | 'learning' | 'service';
};
export const upcomingEvents = (events: EventRecord[], now = new Date()) =>
  events
    .filter((event) => new Date(event.start).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
export const currentEvents = (events: EventRecord[], now = new Date()) =>
  events
    .filter((event) => new Date(event.end) > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
export const shortDateLabel = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
export const dayKey = (date: string | Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
export const timeLabel = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(date));
export type Announcement = {
  title: string;
  summary: string;
  url: string;
  startsAt: string;
  expiresAt: string;
  owner: string;
};
export const activeNotices = (items: Announcement[], now = new Date()) =>
  items.filter((item) => new Date(item.startsAt) <= now && new Date(item.expiresAt) > now);
