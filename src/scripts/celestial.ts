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

// Tiny, pooled bursts respond to interactive targets, including modal controls.
const sparks = Array.from({ length: 24 }, () => {
  const s = document.createElement('span');
  s.className = 'cursor-spark';
  s.setAttribute('aria-hidden', 'true');
  document.body.append(s);
  return s;
});
let sparkIndex = 0,
  lastSpark = 0;
const clickable =
  'a[href],button:not(:disabled),summary,[role="button"],input[type="submit"],input[type="checkbox"]';
function sparkle(event: PointerEvent, count: number) {
  if (paused || !pointerMedia.matches || event.pointerType !== 'mouse') return;
  const target = event.target instanceof Element ? event.target.closest(clickable) : null;
  if (!target) return;
  const parent = target.closest('dialog[open]') || document.body;
  for (let i = 0; i < count; i++) {
    const spark = sparks[sparkIndex++ % sparks.length];
    spark.getAnimations().forEach((a) => a.cancel());
    parent.append(spark);
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    const angle = Math.random() * Math.PI * 2,
      distance = 18 + Math.random() * 26;
    spark.animate(
      [
        { opacity: 1, transform: 'translate(-50%, -50%) scale(.4) rotate(0deg)' },
        {
          opacity: 0,
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1.1) rotate(100deg)`,
        },
      ],
      { duration: 550, easing: 'ease-out' },
    );
  }
}
document.addEventListener('pointerover', (e) => {
  const previous = e.relatedTarget instanceof Element ? e.relatedTarget.closest(clickable) : null;
  const target = e.target instanceof Element ? e.target.closest(clickable) : null;
  if (target !== previous) sparkle(e, 7);
});
document.addEventListener(
  'pointermove',
  (e) => {
    if (performance.now() - lastSpark > 90) {
      sparkle(e, 2);
      lastSpark = performance.now();
    }
  },
  { passive: true },
);
document.addEventListener('pointerdown', (e) => sparkle(e, 12));
const clearSparks = () => sparks.forEach((s) => s.getAnimations().forEach((a) => a.cancel()));
preference.addEventListener('change', clearSparks);
pointerMedia.addEventListener('change', clearSparks);
window.addEventListener('blur', clearSparks);
document.documentElement.addEventListener('pointerleave', clearSparks);
