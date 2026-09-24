// Load the animation engine only on pages using the motion components.
let dispose: (() => void) | undefined;
let generation = 0;
async function start() {
  const current = ++generation;
  dispose?.();
  dispose = undefined;
  if (!document.querySelector('[data-motion-home]')) return;
  const { mountMotion } = await import('./motion/runtime');
  if (current === generation) dispose = mountMotion();
}
function stop() {
  generation++;
  dispose?.();
  dispose = undefined;
}
void start();
document.addEventListener('astro:before-swap', stop);
document.addEventListener('astro:page-load', () => void start());
window.addEventListener('pagehide', stop);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) void start();
});
