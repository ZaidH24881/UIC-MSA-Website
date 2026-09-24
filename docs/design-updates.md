# Design updates

The rebrand uses generous spacing, oversized DM Sans typography, porcelain white, deep blue, and existing campus photography. Pulse Pathway at UIC and Goldsand informed the focused presentation and motion. MSA retains its identity, content, destinations, and existing Astro architecture.

## Integrated motion

The actual homepage includes a staggered pill, split-line heading, CTA, and photo entrance; pinned photo expansion and parallax; a three-card community deck with preceding-card scale and dimming; a keyboard-operable joining scrubber; resource bento cards with cursor-following border highlights; a magnetic primary CTA; and a seamless marquee with explicit pause, hover pause, and focus pause.

`src/scripts/motion.ts` loads the engine only on the homepage. `motion/runtime.ts` owns Lenis, GSAP ticker synchronization, layout refresh, dialog scroll locking, and disposal. `motion/sections.ts` owns hero, deck, and joining interactions. `motion/details.ts` owns pointer effects and the marquee. Shared theme styles remain in `src/styles/design.css`; the new interaction layer is in `src/styles/motion.css`.

Lenis uses one GSAP requestAnimationFrame ticker, synchronizes ScrollTrigger on scroll, and retains native touch scrolling. Pinning and inertia are limited to fine-pointer desktop viewports with enough height. Cards that cannot fit the viewport remain in document flow. Resize, image load, and font readiness refresh measurements. All controllers dispose listeners, observers, clones, tweens, and pin spacers on navigation or page lifecycle changes. Transform acceleration is applied to animated elements, with temporary will-change hints during interaction.

## Content and accessibility

Existing real content supplies the deck, membership steps, marquee, and resources. Edit the card data in `CommunityDeck.astro`, membership steps in `index.astro`, or the existing resource data without changing animation controllers. Hero entrance wrappers separate entrance transforms from scroll transforms. Put replacement media inside the existing Photo component to retain responsive images and fallback behavior.

Reduced motion is honored live: inertia, pinning, pointer effects, and marquee animation are removed. Mobile uses native scrolling and normal-flow cards. All three cards and all membership steps remain available without JavaScript. Deck controls support keyboard activation; inactive stacked cards are inert. The joining range exposes descriptive values. Marquee copies are inert and hidden from assistive technology; animation pauses offscreen and when the page is hidden.

## Verification

Run `pnpm build`, `pnpm test`, and start `pnpm preview`. Then run `pnpm test:browser`, `node tests/design.mjs`, `node tests/layout.mjs`, and `node tests/states.mjs`. Motion checks cover pinning, keyboard card selection, scaling, range control, marquee pause, live reduced-motion changes, mobile overflow, lifecycle cleanup, and no-JavaScript fallback. Site-wide checks cover routes, links, keyboard dialogs, accessibility, responsive layouts, and content states.

Physical-device Safari and screen-reader application checks remain separate from the automated Chromium checks. This branch does not change event records, payment destinations, membership destinations, or production deployment settings.
