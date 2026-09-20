# Design updates

The rebrand uses generous spacing, oversized DM Sans typography, porcelain white, deep blue, and existing campus photography. Pulse Pathway at UIC and Goldsand informed the restrained navigation and focused headline presentation. MSA keeps its own identity and content.

The homepage leads with “Your people. Your place.” A campus photo expands with natural scrolling, followed by a short community story and the existing events, prayer, membership, and resource content. Shared styling applies throughout the public site.

## Motion and accessibility

- One coordinated headline/photo entrance; no loading screen or scroll interception.
- Passive scrolling with one scheduled animation frame to expand the campus photo on desktop.
- Progressive CSS scroll animation on the belonging headline; unsupported browsers show normal content.
- A manual community gallery with keyboard-operable controls, pressed states, and announced selection. No timed advancement.
- System reduced-motion preferences disable animations, including when the preference changes while the page is open.
- Without JavaScript, the initial photo and existing navigation fallback remain available.

The shared theme is in `src/styles/design.css`. Homepage motion is in `src/scripts/motion.ts`; the interactive gallery is in `src/components/CommunityGallery.astro`. Existing functional component styling remains in `global.css`.

## Verify

Run `pnpm build`, `pnpm test`, and start `pnpm preview`. Then run `pnpm test:browser` and `node tests/design.mjs`. The latter verifies scroll expansion, keyboard photo selection, live reduced-motion changes, and the no-JavaScript gallery fallback. CI runs these checks on `design-updates` and on pull requests.

This branch does not change event records, payment destinations, membership destinations, or deployment configuration. Physical-device Safari and screen-reader application checks remain separate from automated Chromium checks.
