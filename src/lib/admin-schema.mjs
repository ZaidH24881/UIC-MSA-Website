// Shared by the browser, local preview server, and security-rule generator.
const field = (label, type = 'text', required = false, options = {}) => ({
  label,
  type,
  required,
  ...options,
});
export const schemas = {
  prayer: {
    title: field('Schedule title', 'text', true),
    location: field('Friday location', 'text', true),
    directions: field('Friday directions', 'textarea'),
    locationUrl: field('Friday map link', 'url'),
    effectiveFrom: field('Effective from (Chicago date)', 'date', true),
    effectiveTo: field('Effective through (Chicago date)', 'date', true),
    ...Object.fromEntries(
      [1, 2, 3, 4].flatMap((i) => [
        [`time${i}`, field(`Friday prayer ${i} time`, 'time', i === 1)],
        [`room${i}`, field(`Friday prayer ${i} room (optional override)`)],
      ]),
    ),
    dailyLocation: field('Daily prayer room', 'text', true),
    dailyHours: field('Daily room opening hours', 'text', true),
    dailyDirections: field('Daily room directions', 'textarea', true),
    accessibility: field('Accessible entrance and elevator directions', 'textarea'),
    dailyUrl: field('Daily room map link', 'url'),
    announcement: field('Temporary announcement', 'textarea'),
  },
  events: {
    title: field('Event title', 'text', true),
    description: field('Description', 'textarea', true),
    start: field('Starts (Chicago time)', 'datetime-local', true),
    end: field('Ends (Chicago time)', 'datetime-local', true),
    location: field('Location', 'text', true),
    audience: field('Audience', 'text', true),
    rsvpUrl: field('RSVP link', 'url'),
    status: field('Event status', 'select', true, {
      choices: ['confirmed', 'cancelled', 'postponed'],
    }),
    category: field('Category', 'select', false, {
      choices: ['', 'ramadan', 'community', 'learning', 'service'],
    }),
    flyer: field('Flyer image', 'image'),
    photo: field('Existing photo asset', 'asset'),
    photoAlt: field('Photo description'),
    recap: field('Event recap', 'textarea'),
  },
  khutbahs: {
    title: field('Khutbah or recording title', 'text', true),
    speaker: field('Speaker', 'text', true),
    date: field('Date', 'date', true),
    description: field('Summary', 'textarea', true),
    url: field('YouTube, Vimeo, or SoundCloud recording URL', 'media', true),
    transcript: field('Transcript link', 'url'),
    order: field('Display order (lower appears first)', 'number', true),
  },
  donations: {
    title: field('Payment method name', 'text', true),
    recipient: field('Recipient / handle', 'text', true),
    alternative: field('Alternative recipient identifier'),
    instruction: field('Payment instructions', 'textarea', true),
    url: field('Payment destination URL', 'url'),
    order: field('Display order (lower appears first)', 'number', true),
  },
  giving: {
    title: field('Campaign heading', 'text', true),
    description: field('Campaign introduction', 'textarea', true),
    purpose: field('Giving purpose', 'textarea', true),
  },
};
export const labels = {
  prayer: 'Prayer & locations',
  events: 'Events',
  khutbahs: 'Khutbahs',
  donations: 'Donation methods',
  giving: 'Giving campaign',
};
export function blank(kind) {
  return Object.fromEntries(
    Object.entries(schemas[kind]).map(([key, f]) => [
      key,
      f.type === 'number' ? 0 : f.choices?.[0] || '',
    ]),
  );
}
export function validUrl(value, media = false) {
  try {
    const u = new URL(value);
    return (
      u.protocol === 'https:' &&
      !u.username &&
      !u.password &&
      (!media ||
        [
          'youtube.com',
          'www.youtube.com',
          'youtu.be',
          'vimeo.com',
          'www.vimeo.com',
          'soundcloud.com',
          'www.soundcloud.com',
        ].includes(u.hostname))
    );
  } catch {
    return false;
  }
}
export function validate(kind, data) {
  const schema = schemas[kind];
  if (!schema || !data || typeof data !== 'object' || Array.isArray(data))
    throw new Error('Invalid content type.');
  if (Object.keys(data).some((k) => !schema[k])) throw new Error('Unknown content field.');
  for (const [key, f] of Object.entries(schema)) {
    const v = data[key];
    if (f.type === 'number') {
      if (!Number.isInteger(v) || v < 0 || v > 9999)
        throw new Error(`${f.label}: use a whole number from 0 to 9999.`);
      continue;
    }
    if (
      typeof v !== 'string' ||
      v.length > (f.type === 'image' ? 900000 : f.type === 'textarea' ? 5000 : 1000)
    )
      throw new Error(`${f.label}: missing or too long.`);
    if (f.required && !v.trim()) throw new Error(`${f.label} is required.`);
    if (!v) continue;
    if (f.choices && !f.choices.includes(v)) throw new Error(`${f.label}: invalid choice.`);
    if (['url', 'media'].includes(f.type) && !validUrl(v, f.type === 'media'))
      throw new Error(
        `${f.label}: use a valid HTTPS ${f.type === 'media' ? 'supported recording ' : ''}URL.`,
      );
    if (f.type === 'image' && !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v))
      throw new Error('Flyer must be a compressed JPEG.');
    if (f.type === 'asset' && !/^\/assets\/[A-Za-z0-9_.\/-]+$/.test(v))
      throw new Error('Photo must be an existing /assets/ path.');
    if (f.type === 'time' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v))
      throw new Error(`${f.label}: invalid time.`);
    if (
      f.type === 'date' &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(v) ||
        !Number.isFinite(Date.parse(v)) ||
        new Date(v).toISOString().slice(0, 10) !== v)
    )
      throw new Error(`${f.label}: invalid date.`);
    if (f.type === 'datetime-local' && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v))
      throw new Error(`${f.label}: invalid date/time.`);
  }
  if (kind === 'prayer' && data.effectiveTo < data.effectiveFrom)
    throw new Error('Effective-through date must follow the start date.');
  if (kind === 'events') {
    const start = chicagoInstant(data.start),
      end = chicagoInstant(data.end);
    if (end <= start) throw new Error('Event end must be after its start.');
  }
  return data;
}
// Resolve wall times by round-trip, rejecting nonexistent/ambiguous DST hours.
export function chicagoInstant(local) {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const matches = ['-05:00', '-06:00']
    .map((offset) => new Date(local + ':00' + offset))
    .filter((d) => Number.isFinite(+d) && formatter.format(d).replace(' ', 'T') === local);
  if (matches.length !== 1)
    throw new Error(
      'This Chicago time is invalid or ambiguous during daylight saving. Choose a time outside the clock-change hour.',
    );
  return matches[0].toISOString();
}
export function eventRecord(record) {
  const d = record.data;
  return {
    ...d,
    slug: record.id,
    start: chicagoInstant(d.start),
    end: chicagoInstant(d.end),
    timezone: 'America/Chicago',
    location: d.location || null,
    rsvpUrl: d.rsvpUrl || null,
  };
}
