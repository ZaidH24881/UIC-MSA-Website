# Design updates

The rebrand uses generous spacing, oversized DM Sans typography, porcelain white, deep blue, and existing campus photography. Pulse Pathway at UIC and Goldsand informed the focused presentation and motion. MSA retains its identity, content, destinations, and existing Astro architecture.

The homepage was later trimmed to a compact overview: a hero, a "quick links" grid pointing to each full page (About, Events, Prayer, Community, Resources, Join), a short upcoming-events teaser, and a donate band. Full detail for each topic lives on its own page instead of being repeated on the homepage.

## Integrated motion

The homepage includes a staggered pill, split-line heading, CTA, and photo entrance; pinned photo expansion and parallax; a scroll-driven headline glint; event cards that settle into place as they enter the viewport; and a magnetic primary CTA.

`src/scripts/motion.ts` loads the engine only on the homepage. `motion/runtime.ts` owns Lenis, GSAP ticker synchronization, layout refresh, dialog scroll locking, and disposal. `motion/sections.ts` owns the hero and the upcoming-events scroll-in. `motion/details.ts` owns the magnetic pointer effect on the primary CTA. Shared theme styles remain in `src/styles/design.css`; the interaction layer is in `src/styles/motion.css`.

Lenis uses one GSAP requestAnimationFrame ticker, synchronizes ScrollTrigger on scroll, and retains native touch scrolling. Pinning and inertia are limited to fine-pointer desktop viewports with enough height. All controllers dispose listeners, observers, tweens, and pin spacers on navigation or page lifecycle changes. Transform acceleration is applied to animated elements, with temporary will-change hints during interaction.

## Content and accessibility

Hero entrance wrappers separate entrance transforms from scroll transforms. Put replacement media inside the existing Photo component to retain responsive images and fallback behavior.

Reduced motion is honored live: inertia, pinning, and pointer effects are removed. Mobile uses native scrolling. The quick-links grid and event cards remain available without JavaScript.

## Verification

Run `pnpm build`, `pnpm test`, and start `pnpm preview`. Then run `pnpm test:browser`, `node tests/design.mjs`, `node tests/layout.mjs`, and `node tests/states.mjs`. Motion checks cover pinning, scaling, headline glint, quick-links rendering, live reduced-motion changes, mobile overflow, lifecycle cleanup, and no-JavaScript fallback. Site-wide checks cover routes, links, keyboard dialogs, accessibility, responsive layouts, and content states.

Physical-device Safari and screen-reader application checks remain separate from the automated Chromium checks. This branch does not change event records, payment destinations, membership destinations, or production deployment settings.

## Navigation and scroll refinements

The labeled Menu button stays visible across screen sizes. Its destinations begin Prayer, Join MSA, Resources, followed by the unchanged relative order of the other links. The donation sidebar uses a shared arrow column so wrapped announcement text stays aligned with sponsorship. The prayer heading includes explicit spacing when its responsive line break is hidden.

The hero uses a wider blue glint and a stronger photo expansion. Event cards settle into place as they enter the viewport, scrubbed by scroll position and removed when reduced motion is enabled. Tests verify menu ordering, heading spacing, donation-arrow alignment, and animation cleanup alongside the existing responsive checks.

## Mobile verification

`pnpm test:mobile` exercises touch-enabled Chromium and WebKit at 320×568, 390×844, 430×932, 844×390, 820×1180, and 1180×820. Coverage includes native scrolling without Lenis or pinned cards on touch devices, a long menu and rotation while open, quick-link navigation, donation dialogs, reduced motion, and overflow on key routes. A screenshot and a JSON report are written under `test-results`. These are emulated devices, not physical iOS or Android hardware.

Short landscape screens keep the menu close control visible as its links scroll. CI installs Chromium and WebKit and runs the mobile suite alongside the existing route, accessibility, and layout checks.
