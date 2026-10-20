const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
let paused = preference.matches;
try {
  paused ||= localStorage.getItem('msa-motion-paused') === 'true';
} catch {
  /* Storage can be unavailable. */
}
function sync() {
  root.toggleAttribute('data-motion-paused', paused);
  toggle?.setAttribute('aria-pressed', String(paused));
  if (toggle) toggle.textContent = paused ? '✦ Motion paused' : '✦ Pause motion';
  window.dispatchEvent(new CustomEvent('msa:motion-change', { detail: { paused } }));
}
toggle?.removeAttribute('hidden');
toggle?.addEventListener('click', () => {
  paused = !paused;
  try {
    localStorage.setItem('msa-motion-paused', String(paused));
  } catch {
    /* Keep the control usable. */
  }
  sync();
});
preference.addEventListener('change', () => {
  paused = preference.matches;
  sync();
});
sync();
// Observe only elements below the fold; failed/disabled JavaScript never hides content.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-reveal', 'visible');
        if (!paused) {
          const animation = entry.target.animate(
            [
              { opacity: 0.3, transform: 'translateY(20px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' },
          );
          window.addEventListener('msa:motion-change', () => animation.cancel(), { once: true });
        }
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll<HTMLElement>(
      '.section-heading, .resource-link, .aside-panel, .support-band > .container, .page-lead',
    )
    .forEach((element, index) => {
      if (element.getBoundingClientRect().top < innerHeight || paused) return;
      element.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
      element.dataset.reveal = 'waiting';
      observer.observe(element);
    });
}
