import { getEvents } from './store';
import { dayKey, type EventRecord } from '../../lib/events';
import { renderAgendaItem } from './render';

const calendarRoot = document.querySelector<HTMLElement>('[data-calendar]');
const calendarGrid = calendarRoot?.querySelector<HTMLElement>('[data-calendar-grid]');
const calendarLabel = calendarRoot?.querySelector<HTMLElement>('[data-calendar-label]');
const calendarPrev = calendarRoot?.querySelector<HTMLButtonElement>('[data-calendar-prev]');
const calendarNext = calendarRoot?.querySelector<HTMLButtonElement>('[data-calendar-next]');

if (calendarRoot && calendarGrid && calendarLabel && calendarPrev && calendarNext) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let selectedKey: string | null = null;
  let eventsByDay = new Map<string, EventRecord[]>();

  const pad = (n: number) => String(n).padStart(2, '0');
  const gridKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayKey = gridKey(now);
  const monthLabel = (y: number, m: number) =>
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(y, m, 1));
  const dayTitleLabel = (d: Date) =>
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(d);

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
      dayEvents.forEach((event) => agendaList.appendChild(renderAgendaItem(event)));
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
  calendarGrid.removeAttribute('aria-busy');

  getEvents()
    .then((events) => {
      const activeEvents = events.filter((event) => event.status !== 'cancelled');
      eventsByDay = new Map();
      for (const event of activeEvents) {
        const key = dayKey(event.start);
        const list = eventsByDay.get(key) ?? [];
        list.push(event);
        eventsByDay.set(key, list);
      }
      renderCalendar();
    })
    .catch(() => {});
}

export {};
