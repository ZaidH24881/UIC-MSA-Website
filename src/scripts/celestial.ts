const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
let paused = preference.matches;
function sync() {
  paused = preference.matches;
  root.toggleAttribute('data-motion-paused', paused);
  window.dispatchEvent(new CustomEvent('msa:motion-change', { detail: { paused } }));
}
preference.addEventListener('change', sync);
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
      '.section-heading, .resource-link, .aside-panel, .support-band > .container, .page-lead, .page-content article, .join-steps .steps > li, .faq details, .intro-photo, .giving-story, .giving-values > div, .charity-quote, .method, .video-card',
    )
    .forEach((element, index) => {
      if (paused) return;
      element.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
      element.dataset.reveal = 'waiting';
      observer.observe(element);
    });
}

// The cursor itself is a native SVG cursor: no offset follower or duplicate arrow.
// A bounded pool of soft moonlight dots provides an optional moving trail.
const pointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
const motes = Array.from({ length: 10 }, (_, i) => {
  const mote = document.createElement('span');
  mote.className = `moon-mote ${i % 2 ? 'moon-mote--gold' : ''}`;
  mote.setAttribute('aria-hidden', 'true');
  document.body.append(mote);
  return mote;
});
let lastMote = 0,
  moteIndex = 0;
function clearTrail() {
  motes.forEach((mote) => mote.getAnimations().forEach((animation) => animation.cancel()));
}
document.addEventListener(
  'pointermove',
  (event) => {
    if (paused || !pointerMedia.matches || event.pointerType !== 'mouse') return;
    const now = performance.now();
    if (now - lastMote < 60) return;
    lastMote = now;
    const mote = motes[moteIndex++ % motes.length];
    mote.getAnimations().forEach((animation) => animation.cancel());
    mote.style.left = `${event.clientX}px`;
    mote.style.top = `${event.clientY}px`;
    mote.animate(
      [
        { opacity: 0.6, transform: 'translate(-50%, -50%) scale(1)' },
        { opacity: 0, transform: 'translate(-50%, 15px) scale(.2)' },
      ],
      { duration: 550, easing: 'ease-out' },
    );
  },
  { passive: true },
);
document.documentElement.addEventListener('pointerleave', clearTrail);
window.addEventListener('blur', clearTrail);
window.addEventListener('pagehide', clearTrail);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearTrail();
});
preference.addEventListener('change', clearTrail);
pointerMedia.addEventListener('change', clearTrail);
