// Scroll is never intercepted. The photo expands gently in response to natural scrolling.
const frame = document.querySelector<HTMLElement>('[data-cinema]');
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 768px)');
let pending = 0;
function paint() {
  pending = 0;
  if (!frame) return;
  if (preference.matches || !desktop.matches) {
    frame.style.removeProperty('--cinema-scale');
    return;
  }
  const top = frame.getBoundingClientRect().top;
  const progress = Math.min(1, Math.max(0, 1 - top / window.innerHeight));
  frame.style.setProperty('--cinema-scale', String(0.94 + progress * 0.06));
}
function schedule() {
  if (!pending) pending = requestAnimationFrame(paint);
}
if (frame) {
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  preference.addEventListener('change', schedule);
  desktop.addEventListener('change', schedule);
  paint();
}
export {};
