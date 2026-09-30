import gsap from 'gsap';

export function mountPointers() {
  const media = gsap.matchMedia();
  media.add(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    () => {
      const cleanups: (() => void)[] = [];
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
        const button = element.querySelector<HTMLElement>('.button')!;
        let raf = 0,
          x = 0,
          y = 0;
        let tween: gsap.core.Tween | undefined;
        const move = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          x = event.clientX;
          y = event.clientY;
          if (!raf)
            raf = requestAnimationFrame(() => {
              raf = 0;
              const box = element.getBoundingClientRect();
              tween?.kill();
              button.style.willChange = 'transform';
              tween = gsap.to(button, {
                x: gsap.utils.clamp(-8, 8, (x - box.left - box.width / 2) * 0.12),
                y: gsap.utils.clamp(-6, 6, (y - box.top - box.height / 2) * 0.12),
                duration: 0.25,
                ease: 'power3.out',
                force3D: true,
              });
            });
        };
        const reset = () => {
          cancelAnimationFrame(raf);
          raf = 0;
          tween?.kill();
          tween = gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1,0.5)',
            onComplete: () => {
              button.style.willChange = '';
            },
          });
        };
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerleave', reset);
        button.addEventListener('focus', reset);
        cleanups.push(() => {
          cancelAnimationFrame(raf);
          tween?.kill();
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerleave', reset);
          button.removeEventListener('focus', reset);
          gsap.set(button, { clearProps: 'transform,willChange' });
        });
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    },
  );
  return () => media.revert();
}
