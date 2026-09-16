export {};
// Keep Tab inside the dialog, including the browser's last-to-first transition.
document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => {
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [
      ...dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]'),
    ].filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
});
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
const opener = document.querySelector<HTMLButtonElement>('.menu-open');
const closer = document.querySelector<HTMLButtonElement>('.menu-close');
if (menu && opener && closer && typeof menu.showModal === 'function') {
  opener.hidden = false;
  opener.addEventListener('click', () => {
    menu.showModal();
    document.body.classList.add('menu-is-open');
    opener.setAttribute('aria-expanded', 'true');
    closer.focus();
  });
  closer.addEventListener('click', () => menu.close());
  menu.addEventListener('click', (event) => {
    if (event.target === menu && event.clientX < menu.getBoundingClientRect().left) menu.close();
  });
  menu.addEventListener('close', () => {
    document.body.classList.remove('menu-is-open');
    opener.setAttribute('aria-expanded', 'false');
    opener.focus();
  });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', (event) => {
    if (event.matches && menu.open) menu.close();
  });
}

let toastTimeout: ReturnType<typeof setTimeout>;
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const text = button.dataset.copy || '';
    const status = document.getElementById('copy-status');
    if (!status) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = `${text} copied.`;
    } catch {
      status.textContent = 'Copy is unavailable. Select and copy the recipient shown above.';
    }
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      status.textContent = '';
    }, 6500);
  });
});

document.querySelectorAll<HTMLImageElement>('[data-photo] img').forEach((img) => {
  const failed = () => {
    const figure = img.closest('[data-photo]');
    figure?.classList.add('image-failed');
    const fallback = figure?.querySelector<HTMLElement>('.photo-fallback');
    if (fallback) fallback.hidden = false;
  };
  img.addEventListener('error', failed);
  if (img.complete && img.naturalWidth === 0) failed();
});

document.querySelectorAll<HTMLAnchorElement>('[data-poster]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const dialog = document.querySelector<HTMLDialogElement>('#poster-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    const img = dialog.querySelector('img')!;
    img.src = link.href;
    img.alt = link.dataset.poster || 'MSA announcement';
    dialog.showModal();
    document.body.classList.add('menu-is-open');
    dialog.addEventListener(
      'close',
      () => {
        document.body.classList.remove('menu-is-open');
        link.focus();
      },
      { once: true },
    );
  });
});
document
  .querySelector<HTMLButtonElement>('[data-close-poster]')
  ?.addEventListener('click', () =>
    document.querySelector<HTMLDialogElement>('#poster-dialog')?.close(),
  );

type CalendarEvent = {
  slug: string;
  title: string;
  start: string;
  location: string | null;
  status: string;
};
const calendarRoot = document.querySelector<HTMLElement>('[data-calendar]');
const calendarData = calendarRoot?.querySelector<HTMLScriptElement>('[data-calendar-events]');
const calendarGrid = calendarRoot?.querySelector<HTMLElement>('[data-calendar-grid]');
const calendarLabel = calendarRoot?.querySelector<HTMLElement>('[data-calendar-label]');
const calendarPrev = calendarRoot?.querySelector<HTMLButtonElement>('[data-calendar-prev]');
const calendarNext = calendarRoot?.querySelector<HTMLButtonElement>('[data-calendar-next]');
if (calendarRoot && calendarData && calendarGrid && calendarLabel && calendarPrev && calendarNext) {
  const events: CalendarEvent[] = JSON.parse(calendarData.textContent || '[]');
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let selectedKey: string | null = null;

  const pad = (n: number) => String(n).padStart(2, '0');
  const gridKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dayKey = (iso: string) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(iso));
  const todayKey = gridKey(now);
  const monthLabel = (y: number, m: number) =>
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(y, m, 1));
  const dayTitleLabel = (d: Date) =>
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(d);
  const timeLabel = (iso: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(iso));

  const eventsByDay = new Map<string, CalendarEvent[]>();
  events.forEach((event) => {
    const key = dayKey(event.start);
    const list = eventsByDay.get(key) ?? [];
    list.push(event);
    eventsByDay.set(key, list);
  });

  const agendaSelected = document.querySelector<HTMLElement>('[data-agenda-selected]');
  const agendaDefault = document.querySelector<HTMLElement>('[data-agenda-default]');
  const agendaTitle = document.querySelector<HTMLElement>('[data-agenda-selected-title]');
  const agendaList = document.querySelector<HTMLUListElement>('[data-agenda-selected-list]');
  const agendaEmpty = document.querySelector<HTMLElement>('[data-agenda-selected-empty]');
  const agendaClear = document.querySelector<HTMLButtonElement>('[data-agenda-clear]');

  const showDefaultAgenda = () => {
    selectedKey = null;
    if (agendaSelected) agendaSelected.hidden = true;
    if (agendaDefault) agendaDefault.hidden = false;
    calendarGrid
      .querySelectorAll('.is-selected')
      .forEach((cell) => cell.classList.remove('is-selected'));
  };

  const showDayAgenda = (d: Date, cell: HTMLElement) => {
    const key = gridKey(d);
    if (selectedKey === key) {
      showDefaultAgenda();
      return;
    }
    selectedKey = key;
    calendarGrid
      .querySelectorAll('.is-selected')
      .forEach((el) => el.classList.remove('is-selected'));
    cell.classList.add('is-selected');
    const dayEvents = eventsByDay.get(key) ?? [];
    if (agendaTitle) agendaTitle.textContent = dayTitleLabel(d);
    if (agendaEmpty) agendaEmpty.hidden = dayEvents.length > 0;
    if (agendaList) {
      agendaList.innerHTML = '';
      dayEvents.forEach((event) => {
        const item = document.createElement('li');
        item.className = 'event-agenda-item';
        const link = document.createElement('a');
        link.className = 'event-agenda-title';
        link.href = `/events/${event.slug}/`;
        link.textContent = event.title;
        const meta = document.createElement('span');
        meta.className = 'event-agenda-meta';
        meta.textContent = `${timeLabel(event.start)} · ${event.location || 'Location to be confirmed'}`;
        item.append(link, meta);
        if (event.status !== 'confirmed') {
          const status = document.createElement('span');
          status.className = 'status-label';
          status.textContent = event.status;
          item.appendChild(status);
        }
        agendaList.appendChild(item);
      });
    }
    if (agendaDefault) agendaDefault.hidden = true;
    if (agendaSelected) agendaSelected.hidden = false;
  };

  agendaClear?.addEventListener('click', showDefaultAgenda);

  const renderCalendar = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const start = new Date(year, month, 1 - firstDay);
    calendarGrid.innerHTML = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = gridKey(d);
      const dayEvents = eventsByDay.get(key) ?? [];
      const outside = d.getMonth() !== month;
      const isToday = key === todayKey;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.classList.add('calendar-day');
      if (outside) cell.classList.add('is-outside');
      if (isToday) cell.classList.add('is-today');
      if (dayEvents.length) cell.classList.add('has-events');
      if (selectedKey === key) cell.classList.add('is-selected');
      cell.setAttribute(
        'aria-label',
        dayEvents.length
          ? `${d.getDate()}, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`
          : String(d.getDate()),
      );
      const number = document.createElement('span');
      number.className = 'calendar-day-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(d.getDate());
      cell.appendChild(number);
      if (dayEvents.length) {
        const dot = document.createElement('span');
        dot.className = 'calendar-dot';
        dot.setAttribute('aria-hidden', 'true');
        cell.appendChild(dot);
      }
      cell.addEventListener('click', () => showDayAgenda(d, cell));
      calendarGrid.appendChild(cell);
    }
    calendarLabel.textContent = monthLabel(year, month);
  };

  calendarPrev.hidden = false;
  calendarNext.hidden = false;
  calendarPrev.addEventListener('click', () => {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    showDefaultAgenda();
    renderCalendar();
  });
  calendarNext.addEventListener('click', () => {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    showDefaultAgenda();
    renderCalendar();
  });

  renderCalendar();
}
