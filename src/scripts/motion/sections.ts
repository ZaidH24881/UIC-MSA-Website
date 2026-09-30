import gsap from 'gsap';

export function mountHero(home: HTMLElement) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
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
  return () => media.revert();
}
