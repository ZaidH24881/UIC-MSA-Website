import gsap from 'gsap';
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
