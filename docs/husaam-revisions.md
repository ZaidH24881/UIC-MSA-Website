# Husaam visual revisions

Current branch: `husaam-revision-2`, based on `husaam-revisions-1`.

The blue/gold layout now uses drifting crescents, moon phases, orbital lines, and ambient glows. Interior page ornaments, ribbon separators, the support banner, and charity quotation use moon motifs. Navigation has one gold underline at the original underline position.

Desktop pointers use a gold crescent with a blue outline as the actual cursor, including links and buttons. A bounded pool of soft moonlight dots trails the pointer. Touch devices have no custom pointer; system reduced-motion settings disable motion and the trail while retaining the static crescent cursor. No motion-toggle button is present.

The existing Resources alignment and Donate design are preserved, including the plain-text Sahih Muslim 2588 reference. No new dependencies were added.

The Admin workspace is implemented; see admin-workspace.md for setup and verification. The navigation underline now extends smoothly on hover/focus, and the sharper crescent-arrow cursor emits pooled sparkles over clickable controls.

## Verification

Run `pnpm build`, the existing unit tests with Node 24, `node tests/celestial-check.mjs`, and `node tests/celestial-accessibility.mjs`. Browser checks expect the production preview at port 4322 and Chrome installed. The visual checks cover responsive layouts, resource alignment, donation reference, moon cursor styling, reduced motion, and touch behavior.

This local checkout lacks Firebase credentials, so live events and board authentication cannot be verified here. No production deployment is included.
