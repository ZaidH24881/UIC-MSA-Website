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
