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

// A pooled sparkle trail keeps pointer movement lightweight and avoids DOM growth.
const pointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
const cursor = document.createElement('div');
cursor.className = 'star-cursor';
cursor.setAttribute('aria-hidden', 'true');
cursor.innerHTML =
  '<svg viewBox="0 0 40 40" fill="none"><path d="M20 1 25 15 39 20 25 25 20 39 15 25 1 20 15 15Z" fill="#ecc77e" stroke="#285da4" stroke-width="2"/><path d="M20 10 22 18 30 20 22 22 20 30 18 22 10 20 18 18Z" fill="#437bca"/></svg>';
document.body.append(cursor);
const sparks = Array.from({ length: 12 }, (_, i) => {
  const spark = document.createElement('span');
  spark.className = `cursor-spark ${i % 2 ? 'cursor-spark--gold' : ''}`;
  spark.setAttribute('aria-hidden', 'true');
  document.body.append(spark);
  return spark;
});
let frame = 0,
  x = 0,
  y = 0,
  lastSpark = 0,
  sparkIndex = 0;
function hideCursor() {
  cancelAnimationFrame(frame);
  frame = 0;
  cursor.classList.remove('is-visible');
  sparks.forEach((spark) => spark.getAnimations().forEach((animation) => animation.cancel()));
}
function moveCursor(event: PointerEvent) {
  if (paused || !pointerMedia.matches || event.pointerType !== 'mouse') return;
  x = event.clientX;
  y = event.clientY;
  cursor.classList.toggle(
    'is-interactive',
    !!(event.target as Element).closest('a, button, summary, input, textarea'),
  );
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    cursor.style.transform = `translate3d(${x + 12}px, ${y + 12}px, 0)`;
    cursor.classList.add('is-visible');
    const now = performance.now();
    if (now - lastSpark < 55) return;
    lastSpark = now;
    const spark = sparks[sparkIndex++ % sparks.length];
    spark.getAnimations().forEach((animation) => animation.cancel());
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    const drift = ((sparkIndex % 3) - 1) * 16;
    spark.animate(
      [
        { opacity: 0.85, transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
        {
          opacity: 0,
          transform: `translate(calc(-50% + ${drift}px), 24px) scale(.15) rotate(100deg)`,
        },
      ],
      { duration: 620, easing: 'ease-out' },
    );
  });
}
document.addEventListener('pointermove', moveCursor, { passive: true });
document.documentElement.addEventListener('pointerleave', hideCursor);
window.addEventListener('blur', hideCursor);
window.addEventListener('pagehide', hideCursor);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hideCursor();
});
preference.addEventListener('change', hideCursor);
pointerMedia.addEventListener('change', hideCursor);
