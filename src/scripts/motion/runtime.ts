import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { mountDeck, mountHero, mountPageFlow } from './sections';
import { mountPointers, mountMarquee } from './details';

gsap.registerPlugin(ScrollTrigger);
export function mountMotion() {
  const home = document.querySelector<HTMLElement>('[data-motion-home]')!;
  const media = gsap.matchMedia();
  let lenis: Lenis | undefined;
  let dead = false;
  let refreshTimer = 0;
  const scrollTo = (top: number) => {
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(top, { immediate: true });
    } else window.scrollTo({ top, behavior: 'instant' });
  };
  media.add(
    '(min-width: 1000px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    () => {
      const current = new Lenis({
        autoRaf: false,
        lerp: 0.085,
        syncTouch: false,
        smoothWheel: true,
        anchors: true,
      });
      lenis = current;
      // One RAF owner. Wall time avoids changing the host's global lag smoothing.
      const tick = () => current.raf(performance.now());
      current.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      const syncDialog = () =>
        document.querySelector('dialog[open]') ? current.stop() : current.start();
      const observer = new MutationObserver(syncDialog);
      document
        .querySelectorAll('dialog')
        .forEach((dialog) =>
          observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }),
        );
      syncDialog();
      return () => {
        observer.disconnect();
        gsap.ticker.remove(tick);
        current.off('scroll', ScrollTrigger.update);
        current.destroy();
        lenis = undefined;
      };
    },
  );
  const cleanups = [
    mountHero(home),
    ...[...document.querySelectorAll<HTMLElement>('[data-deck]')].map((deck) =>
      mountDeck(deck, scrollTo),
    ),
    mountPointers(),
    mountPageFlow(),
    ...[...document.querySelectorAll<HTMLElement>('[data-marquee]')].map(mountMarquee),
  ];
  const refresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      if (!dead) {
        lenis?.resize();
        ScrollTrigger.refresh();
      }
    }, 120);
  };
  const observer = new ResizeObserver(refresh);
  observer.observe(document.body);
  document.addEventListener('load', refresh, true);
  document.fonts.ready.then(() => {
    if (!dead) refresh();
  });
  refresh();
  home.dataset.motionState = 'ready';
  return () => {
    dead = true;
    clearTimeout(refreshTimer);
    observer.disconnect();
    document.removeEventListener('load', refresh, true);
    cleanups.reverse().forEach((cleanup) => cleanup());
    media.revert();
    delete home.dataset.motionState;
  };
}
