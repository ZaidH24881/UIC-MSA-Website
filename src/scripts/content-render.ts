import { validUrl } from '../lib/admin-schema.mjs';
import type { RecordData } from './admin-client';
export function el(tag: string, text = '', className = '') {
  const e = document.createElement(tag);
  e.textContent = text;
  e.className = className;
  return e;
}
export function link(text: string, url: string) {
  const a = el('a', text, 'text-link') as HTMLAnchorElement;
  if (validUrl(url)) {
    a.href = url;
    a.rel = 'noopener noreferrer';
  }
  return a;
}
const chicagoDate = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
function time(value: string) {
  const [h, m] = value.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
export function renderRecord(r: RecordData) {
  const d = r.data,
    section = el('section', '', 'admin-public-card');
  section.append(el('h2', d.title));
  if (r.archived) {
    section.append(el('p', 'Archived — hidden from public pages.'));
    return section;
  }
  if (r.kind === 'prayer') {
    const current = chicagoDate() >= d.effectiveFrom && chicagoDate() <= d.effectiveTo;
    section.append(
      el(
        'p',
        `Schedule valid ${d.effectiveFrom} through ${d.effectiveTo} · America/Chicago`,
        'fine-print',
      ),
    );
    if (current) {
      section.append(el('h3', d.location));
      const times = el('div', '', 'prayer-times');
      for (let i = 1; i <= 4; i++)
        if (d[`time${i}`]) {
          const box = el('div');
          box.append(
            el('span', `Prayer ${i}${d[`room${i}`] ? ' · ' + d[`room${i}`] : ''}`),
            el('strong', time(d[`time${i}`])),
          );
          times.append(box);
        }
      section.append(times, el('p', d.directions));
      if (d.locationUrl) section.append(link('Friday location directions', d.locationUrl));
      if (d.announcement) section.append(el('p', d.announcement, 'notice'));
    } else
      section.append(
        el(
          'p',
          'This schedule is outside its effective dates. Confirm this week’s time and room with MSA before visiting.',
          'notice',
        ),
      );
    const daily = el('article');
    daily.id = 'daily-prayer';
    daily.append(
      el('h2', 'Daily prayer space'),
      el('h3', d.dailyLocation),
      el('p', d.dailyHours),
      el('p', d.dailyDirections),
      el('p', d.accessibility),
    );
    if (d.dailyUrl) daily.append(link('Daily room directions', d.dailyUrl));
    section.append(daily, link('Contact MSA', 'https://www.instagram.com/msa.at.uic/'));
  } else if (r.kind === 'events') {
    section.append(
      el('p', `${d.start.replace('T', ' ')} – ${d.end.replace('T', ' ')} · Chicago`),
      el('p', `${d.location} · ${d.audience} · ${d.status}`),
      el('p', d.description),
    );
    if (d.rsvpUrl) section.append(link('RSVP', d.rsvpUrl));
    if (d.flyer) {
      const img = document.createElement('img');
      img.src = d.flyer;
      img.alt = `${d.title} flyer`;
      img.style.maxWidth = '320px';
      section.append(img);
    }
  } else if (r.kind === 'khutbahs') {
    section.classList.add('video-card');
    section.append(el('p', `${d.speaker} · ${d.date}`), el('p', d.description));
    const u = new URL(d.url);
    const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v');
    if (
      ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(u.hostname) &&
      id &&
      /^[\w-]{11}$/.test(id)
    ) {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${id}`;
      frame.title = d.title;
      frame.loading = 'lazy';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      section.append(frame);
    }
    section.append(link('Open recording', d.url));
    if (d.transcript) section.append(link('Read transcript', d.transcript));
  } else if (r.kind === 'donations') {
    section.classList.add('method');
    section.append(el('p', d.instruction), el('strong', d.recipient, 'recipient'));
    if (d.alternative) section.append(el('p', `Alternative: ${d.alternative}`));
    if (d.url) section.append(link(`Give with ${d.title}`, d.url));
    else {
      const b = el('button', 'Copy recipient', 'button secondary') as HTMLButtonElement;
      b.type = 'button';
      b.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(d.recipient);
          b.textContent = 'Copied';
        } catch {
          b.textContent = 'Select and copy the recipient above';
        }
      });
      section.append(b);
    }
  } else section.append(el('p', d.description), el('p', d.purpose));
  return section;
}
