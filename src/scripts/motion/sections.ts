import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
const desktopMotion =
  '(min-width: 1000px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function mountHero(home: HTMLElement) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(
      home.querySelectorAll('[data-glint]'),
      { '--glint': '125%' },
      {
        '--glint': '-25%',
        ease: 'none',
        scrollTrigger: { trigger: home, start: 'top top+=160', end: 'top top-=280', scrub: 0.35 },
      },
    );
    gsap.from(home.querySelectorAll('[data-hero-enter]'), {
      opacity: 0,
      y: 26,
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
      force3D: true,
      clearProps: 'opacity,transform',
    });
  });
  media.add(desktopMotion, () => {
    const stage = home.querySelector<HTMLElement>('[data-hero-stage]')!;
    const depth = home.querySelector<HTMLElement>('[data-cinema]')!;
    gsap.fromTo(
      depth,
      { scale: 0.93, y: 0, borderRadius: 32 },
      {
        scale: 1.035,
        y: -40,
        borderRadius: 12,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: stage,
          start: 'top 16%',
          end: () => `+=${innerHeight * 0.5}`,
          pin: stage,
          pinSpacing: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: ({ isActive }) => {
            depth.style.willChange = isActive ? 'transform' : '';
          },
        },
      },
    );
    return () => {
      depth.style.willChange = '';
    };
  });
  return () => media.revert();
}

// Independent transform layers keep scrolling separate from links and illustration hover effects.
export function mountPageFlow() {
  const media = gsap.matchMedia();
  media.add(
    { wide: '(min-width: 768px)', motion: '(prefers-reduced-motion: no-preference)' },
    (context) => {
      if (!context.conditions?.motion) return;
      const compact = !context.conditions.wide;
      gsap.utils
        .toArray<HTMLElement>('.upcoming-section .event-card, .prayer-panel')
        .forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: compact ? 20 : 56, rotation: compact ? 0 : index % 2 ? 1 : -1, scale: 0.97 },
            {
              y: 0,
              rotation: 0,
              scale: 1,
              ease: 'none',
              force3D: true,
              scrollTrigger: { trigger: card, start: 'top 96%', end: 'top 62%', scrub: 0.45 },
            },
          );
        });
      gsap.utils.toArray<HTMLElement>('.resource-art').forEach((art, index) => {
        const scene = art.querySelector('[data-resource-scene]')!;
        // Move the inner scene: its outer SVG retains the existing hover response.
        gsap.fromTo(
          scene,
          { y: compact ? 12 : 28 },
          {
            y: compact ? -6 : -14,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: art,
              start: 'top bottom',
              end: 'bottom 15%',
              scrub: 0.6 + index * 0.04,
            },
          },
        );
      });
    },
  );
  return () => media.revert();
}

export function mountDeck(deck: HTMLElement, scrollTo: (top: number) => void) {
  const cards = [...deck.querySelectorAll<HTMLElement>('[data-deck-card]')];
  const buttons = [...deck.querySelectorAll<HTMLButtonElement>('[data-deck-select]')];
  const controls = deck.querySelector<HTMLElement>('.deck-controls')!;
  const stage = deck.querySelector<HTMLElement>('[data-deck-stage]')!;
  let media: ReturnType<typeof gsap.matchMedia>;
  let timeline: gsap.core.Timeline | undefined;
  let timer = 0;
  let active = -1;
  controls.hidden = false;
  function select(index: number) {
    if (index === active) return;
    active = index;
    cards.forEach((card, i) => {
      card.inert = i !== index;
    });
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  function build() {
    media?.revert();
    media = gsap.matchMedia();
    media.add(desktopMotion, () => {
      const height = Math.max(...cards.map((card) => card.offsetHeight)) + (cards.length - 1) * 12;
      if (height + controls.offsetHeight + 132 > innerHeight) return;
      gsap.set(stage, { height, overflow: 'hidden' });
      cards.forEach((card, i) =>
        gsap.set(card, {
          position: 'absolute',
          insetInline: 0,
          top: i * 12,
          zIndex: i + 1,
          yPercent: i ? 120 : 0,
          transformOrigin: '50% 0%',
          force3D: true,
        }),
      );
      deck.dataset.pinned = 'true';
      select(0);
      const tl = gsap.timeline({
        defaults: { duration: 1, ease: 'none' },
        scrollTrigger: {
          trigger: deck,
          start: 'top top+=96',
          end: () => `+=${innerHeight * (cards.length - 1 + 0.3)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: ({ isActive }) =>
            cards.forEach((card) => {
              card.style.willChange = isActive ? 'transform' : '';
            }),
        },
      });
      cards.slice(1).forEach((card, i) => {
        tl.to(card, { yPercent: 0 }, i)
          .to(cards[i], { scale: 0.965 }, i)
          .to(cards[i].querySelector('[data-deck-dim]'), { opacity: 0.18 }, i);
      });
      tl.to({}, { duration: 0.3 });
      tl.eventCallback('onUpdate', () =>
        select(Math.min(cards.length - 1, Math.floor(tl.time() + 0.2))),
      );
      timeline = tl;
      return () => {
        timeline = undefined;
        active = -1;
        delete deck.dataset.pinned;
        cards.forEach((card) => {
          card.inert = false;
          card.style.willChange = '';
        });
        buttons.forEach((button) => button.removeAttribute('aria-pressed'));
      };
    });
    ScrollTrigger.refresh();
  }
  const handlers = buttons.map((button, i) => {
    const click = () => {
      ScrollTrigger.refresh();
      const trigger = timeline?.scrollTrigger;
      if (trigger) {
        scrollTo(trigger.start + (i / (cards.length - 1 + 0.3)) * (trigger.end - trigger.start));
        trigger.getTween()?.progress(1);
      } else scrollTo(cards[i].getBoundingClientRect().top + scrollY - 96);
    };
    button.addEventListener('click', click);
    return () => button.removeEventListener('click', click);
  });
  const schedule = () => {
    clearTimeout(timer);
    timer = window.setTimeout(build, 140);
  };
  const sizes = new WeakMap<Element, string>();
  const observer = new ResizeObserver((entries) =>
    entries.forEach((entry) => {
      const size = `${entry.contentRect.width}:${entry.contentRect.height}`;
      if (sizes.has(entry.target) && sizes.get(entry.target) !== size) schedule();
      sizes.set(entry.target, size);
    }),
  );
  deck.querySelectorAll('[data-deck-content]').forEach((content) => observer.observe(content));
  window.addEventListener('resize', schedule);
  build();
  return () => {
    clearTimeout(timer);
    observer.disconnect();
    window.removeEventListener('resize', schedule);
    handlers.forEach((remove) => remove());
    media.revert();
    controls.hidden = true;
  };
}
