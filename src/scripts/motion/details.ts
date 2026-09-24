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

export function mountMarquee(element: HTMLElement) {
  const track = element.querySelector<HTMLElement>('[data-marquee-track]')!;
  const group = element.querySelector<HTMLElement>('[data-marquee-group]')!;
  const button = element.querySelector<HTMLButtonElement>('[data-marquee-pause]')!;
  const media = gsap.matchMedia();
  let tween: gsap.core.Tween | undefined;
  let paused = false,
    hovered = false,
    focused = false,
    visible = true;
  const sync = () => tween?.paused(paused || hovered || focused || !visible || document.hidden);
  const enter = () => {
    hovered = true;
    sync();
  };
  const leave = () => {
    hovered = false;
    sync();
  };
  const focus = () => {
    focused = true;
    sync();
  };
  const blur = (event: FocusEvent) => {
    if (!element.contains(event.relatedTarget as Node | null)) {
      focused = false;
      sync();
    }
  };
  const click = () => {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Resume animation' : 'Pause animation';
    sync();
  };
  const removeClones = () =>
    track.querySelectorAll('[data-marquee-clone]').forEach((clone) => clone.remove());
  media.add('(prefers-reduced-motion: no-preference)', () => {
    button.hidden = false;
    const build = () => {
      const width = group.getBoundingClientRect().width;
      if (!width) return;
      const progress = tween?.progress() ?? 0;
      tween?.kill();
      removeClones();
      const count = Math.ceil(element.clientWidth / width) + 1;
      for (let i = 0; i < count; i++) {
        const clone = group.cloneNode(true) as HTMLElement;
        clone.removeAttribute('data-marquee-group');
        clone.dataset.marqueeClone = '';
        clone.inert = true;
        clone.setAttribute('aria-hidden', 'true');
        track.append(clone);
      }
      tween = gsap
        .fromTo(
          track,
          { x: 0 },
          {
            x: -width,
            duration: width / 36,
            repeat: -1,
            ease: 'none',
            force3D: true,
            paused: true,
          },
        )
        .progress(progress);
      sync();
    };
    const observer = new ResizeObserver(build);
    observer.observe(group);
    observer.observe(element);
    build();
    return () => {
      observer.disconnect();
      tween?.kill();
      tween = undefined;
      removeClones();
      gsap.set(track, { clearProps: 'transform' });
      button.hidden = true;
    };
  });
  element.addEventListener('pointerenter', enter);
  element.addEventListener('pointerleave', leave);
  element.addEventListener('focusin', focus);
  element.addEventListener('focusout', blur);
  button.addEventListener('click', click);
  document.addEventListener('visibilitychange', sync);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(element);
  return () => {
    observer.disconnect();
    media.revert();
    element.removeEventListener('pointerenter', enter);
    element.removeEventListener('pointerleave', leave);
    element.removeEventListener('focusin', focus);
    element.removeEventListener('focusout', blur);
    button.removeEventListener('click', click);
    document.removeEventListener('visibilitychange', sync);
  };
}
