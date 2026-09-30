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
// Turns a `datetime-local` value (a plain wall-clock time, no offset) picked
// as if it were Chicago time into a correct ISO string with the right
// seasonal offset (-05:00 CDT / -06:00 CST), without pulling in a timezone
// library. Works by asking Intl what the Chicago offset is at that UTC
// instant, which matches the wall-clock offset except within the DST
// transition hour itself.
export const chicagoIsoFromLocal = (dateTimeLocal: string): string => {
  const [datePart, timePart] = dateTimeLocal.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = (timePart || '00:00').split(':').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offsetPart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(utcGuess)
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = offsetPart?.match(/GMT([+-]\d+)/);
  const offsetHours = match ? Number(match[1]) : -6;
  const sign = offsetHours <= 0 ? '-' : '+';
  const offsetLabel = `${sign}${String(Math.abs(offsetHours)).padStart(2, '0')}:00`;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${offsetLabel}`;
};
// The inverse of chicagoIsoFromLocal: given a stored ISO string, produce the
// `YYYY-MM-DDTHH:mm` value a `datetime-local` input needs to redisplay that
// moment as Chicago wall-clock time, regardless of the viewer's own timezone.
export const chicagoLocalInputFromIso = (iso: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
};
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
