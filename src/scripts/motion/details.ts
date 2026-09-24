import gsap from 'gsap';

export function mountPointers() {
  const media = gsap.matchMedia();
  media.add(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    () => {
      const cleanups: (() => void)[] = [];
      document.querySelectorAll<HTMLElement>('[data-glow], [data-magnetic]').forEach((element) => {
        const button = element.querySelector<HTMLElement>('.button');
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
              if (button) {
                tween?.kill();
                button.style.willChange = 'transform';
                tween = gsap.to(button, {
                  x: gsap.utils.clamp(-8, 8, (x - box.left - box.width / 2) * 0.12),
                  y: gsap.utils.clamp(-6, 6, (y - box.top - box.height / 2) * 0.12),
                  duration: 0.25,
                  ease: 'power3.out',
                  force3D: true,
                });
              } else {
                element.style.setProperty('--glow-x', `${x - box.left}px`);
                element.style.setProperty('--glow-y', `${y - box.top}px`);
                element.dataset.glow = 'active';
              }
            });
        };
        const reset = () => {
          cancelAnimationFrame(raf);
          raf = 0;
          if (button) {
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
          } else element.dataset.glow = '';
        };
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerleave', reset);
        button?.addEventListener('focus', reset);
        cleanups.push(() => {
          cancelAnimationFrame(raf);
          tween?.kill();
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerleave', reset);
          button?.removeEventListener('focus', reset);
          if (button) gsap.set(button, { clearProps: 'transform,willChange' });
          else {
            element.dataset.glow = '';
            element.style.removeProperty('--glow-x');
            element.style.removeProperty('--glow-y');
          }
        });
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    },
  );
  return () => media.revert();
}

// Scroll-driven movement stops as soon as scrolling settles; no autoplay controls needed.
export function mountMarquee(element: HTMLElement) {
  const track = element.querySelector<HTMLElement>('[data-marquee-track]')!;
  const group = element.querySelector<HTMLElement>('[data-marquee-group]')!;
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const clone = group.cloneNode(true) as HTMLElement;
    clone.removeAttribute('data-marquee-group');
    clone.dataset.marqueeClone = '';
    clone.inert = true;
    clone.setAttribute('aria-hidden', 'true');
    track.append(clone);
    gsap.to(track, {
      x: () => -group.getBoundingClientRect().width * 0.6,
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    return () => clone.remove();
  });
  return () => media.revert();
}
