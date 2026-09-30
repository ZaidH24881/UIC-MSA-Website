import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import { auth, db } from '../../lib/firebase-client';
import { boardEmails } from '../../data/board-access';
import { chicagoIsoFromLocal, chicagoLocalInputFromIso, shortDateLabel, type EventRecord } from '../../lib/events';
import { refreshEvents } from './store';

const root = document.querySelector<HTMLElement>('[data-events-admin]');
if (root) {
  const signinButton = root.querySelector<HTMLButtonElement>('[data-board-signin]')!;
  const unauthorized = root.querySelector<HTMLElement>('[data-events-admin-unauthorized]')!;
  const form = root.querySelector<HTMLFormElement>('[data-events-admin-form]')!;
  const status = root.querySelector<HTMLElement>('[data-events-admin-status]')!;
  const heading = root.querySelector<HTMLElement>('[data-events-admin-heading]')!;
  const submitLabel = root.querySelector<HTMLElement>('[data-events-admin-submit-label]')!;
  const existingSelect = form.querySelector<HTMLSelectElement>('[data-events-admin-existing]')!;
  const slugInput = form.querySelector<HTMLInputElement>('[data-events-admin-slug]')!;
  const titleInput = form.querySelector<HTMLInputElement>('#event-title')!;
  const flyerInput = form.querySelector<HTMLInputElement>('[data-events-admin-flyer]')!;
  const flyerPreview = form.querySelector<HTMLImageElement>('[data-events-admin-flyer-preview]')!;
  const submitButton = form.querySelector<HTMLButtonElement>('[data-events-admin-submit]')!;

  let slugTouched = false;
  slugInput.addEventListener('input', () => {
    slugTouched = true;
  });
  titleInput.addEventListener('input', () => {
    if (slugTouched) return;
    slugInput.value = titleInput.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  });

  let flyerFile: File | null = null;
  flyerInput.addEventListener('change', () => {
    flyerFile = flyerInput.files?.[0] || null;
    if (flyerFile) {
      flyerPreview.src = URL.createObjectURL(flyerFile);
      flyerPreview.hidden = false;
    } else if (!editingEvent?.flyer) {
      flyerPreview.hidden = true;
      flyerPreview.removeAttribute('src');
    }
  });

  async function compressFlyer(file: File): Promise<string> {
    let width = 1000;
    let quality = 0.82;
    for (let attempt = 0; attempt < 5; attempt++) {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, width / bitmap.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length <= 900_000 || (width <= 400 && quality <= 0.4)) return dataUrl;
      quality = Math.max(0.4, quality - 0.15);
      width = Math.max(400, Math.round(width * 0.85));
    }
    throw new Error('Could not compress the flyer image enough to save it.');
  }

  function setSignedOut() {
    signinButton.hidden = false;
    unauthorized.hidden = true;
    form.hidden = true;
  }
  function setUnauthorized() {
    signinButton.hidden = true;
    unauthorized.hidden = false;
    form.hidden = true;
  }
  function setAuthorized() {
    signinButton.hidden = true;
    unauthorized.hidden = true;
    form.hidden = false;
    void populateExistingSelect();
  }

  onAuthStateChanged(auth, (user: User | null) => {
    if (!user) return setSignedOut();
    if (!user.email || !boardEmails.includes(user.email)) return setUnauthorized();
    setAuthorized();
  });

  signinButton.addEventListener('click', async () => {
    status.textContent = '';
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      const code = error instanceof Object && 'code' in error ? String(error.code) : 'unknown';
      console.error('Board sign-in failed:', error);
      status.textContent = `Sign-in failed (${code}). Try again.`;
    }
  });

  root.querySelectorAll('[data-board-signout]').forEach((button) =>
    button.addEventListener('click', () => void signOut(auth)),
  );

  let cachedEvents: EventRecord[] = [];
  let editingEvent: EventRecord | null = null;

  async function populateExistingSelect() {
    try {
      cachedEvents = [...(await refreshEvents())].sort(
        (a, b) => +new Date(a.start) - +new Date(b.start),
      );
    } catch {
      return;
    }
    const selected = existingSelect.value;
    existingSelect.innerHTML = '<option value="">New event</option>';
    for (const event of cachedEvents) {
      const option = document.createElement('option');
      option.value = event.slug;
      option.textContent = `${event.title} — ${shortDateLabel(event.start)}`;
      existingSelect.appendChild(option);
    }
    if (cachedEvents.some((event) => event.slug === selected)) existingSelect.value = selected;
  }

  function resetToNewEvent() {
    editingEvent = null;
    form.reset();
    slugTouched = false;
    slugInput.disabled = false;
    flyerFile = null;
    flyerPreview.hidden = true;
    flyerPreview.removeAttribute('src');
    heading.textContent = 'Add an event';
    submitLabel.textContent = 'Save event';
    existingSelect.value = '';
  }

  function loadEventIntoForm(event: EventRecord) {
    editingEvent = event;
    titleInput.value = event.title;
    slugInput.value = event.slug;
    slugInput.disabled = true;
    slugTouched = true;
    (form.elements.namedItem('description') as HTMLTextAreaElement).value = event.description;
    (form.elements.namedItem('start') as HTMLInputElement).value = chicagoLocalInputFromIso(
      event.start,
    );
    (form.elements.namedItem('end') as HTMLInputElement).value = chicagoLocalInputFromIso(
      event.end,
    );
    (form.elements.namedItem('location') as HTMLInputElement).value = event.location || '';
    (form.elements.namedItem('audience') as HTMLInputElement).value = event.audience;
    (form.elements.namedItem('rsvpUrl') as HTMLInputElement).value = event.rsvpUrl || '';
    (form.elements.namedItem('status') as HTMLSelectElement).value = event.status;
    (form.elements.namedItem('category') as HTMLSelectElement).value = event.category || '';
    flyerFile = null;
    flyerInput.value = '';
    if (event.flyer) {
      flyerPreview.src = event.flyer;
      flyerPreview.hidden = false;
    } else {
      flyerPreview.hidden = true;
      flyerPreview.removeAttribute('src');
    }
    heading.textContent = 'Edit event';
    submitLabel.textContent = 'Update event';
    status.textContent = '';
  }

  existingSelect.addEventListener('change', () => {
    const slug = existingSelect.value;
    if (!slug) return resetToNewEvent();
    const event = cachedEvents.find((e) => e.slug === slug);
    if (event) loadEventIntoForm(event);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    const data = new FormData(form);
    const slug = String(data.get('slug') || '').trim();
    const start = String(data.get('start') || '');
    const end = String(data.get('end') || '');
    const isEditing = editingEvent !== null;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      status.textContent = 'Slug must be lowercase words separated by hyphens.';
      return;
    }
    if (!start || !end || new Date(end) <= new Date(start)) {
      status.textContent = 'End time must be after the start time.';
      return;
    }
    submitButton.disabled = true;
    try {
      if (!isEditing) {
        const existing = await getDoc(doc(db, 'events', slug));
        if (existing.exists()) {
          status.textContent = `An event with the slug "${slug}" already exists. Choose a different slug.`;
          return;
        }
      }
      status.textContent = flyerFile ? 'Compressing flyer…' : 'Saving…';
      const flyer = flyerFile ? await compressFlyer(flyerFile) : editingEvent?.flyer;
      status.textContent = 'Saving…';
      const rsvpUrl = String(data.get('rsvpUrl') || '').trim();
      const location = String(data.get('location') || '').trim();
      const category = String(data.get('category') || '');
      const payload = {
        slug,
        title: String(data.get('title') || '').trim(),
        description: String(data.get('description') || '').trim(),
        start: chicagoIsoFromLocal(start),
        end: chicagoIsoFromLocal(end),
        timezone: 'America/Chicago',
        location: location || null,
        audience: String(data.get('audience') || 'All students').trim(),
        rsvpUrl: rsvpUrl || null,
        status: String(data.get('status') || 'confirmed'),
        ...(category ? { category } : {}),
        ...(flyer ? { flyer } : {}),
        updatedAt: serverTimestamp(),
      };
      if (isEditing) {
        await setDoc(doc(db, 'events', slug), payload, { merge: true });
      } else {
        await setDoc(doc(db, 'events', slug), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser?.email ?? null,
        });
      }
      const title = String(data.get('title') || '');
      resetToNewEvent();
      await populateExistingSelect();
      status.textContent = `“${title}” was saved and is live now.`;
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : 'Something went wrong saving the event.';
    } finally {
      submitButton.disabled = false;
    }
  });
}

export {};
