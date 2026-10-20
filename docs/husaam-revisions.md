# Husaam visual revisions

Branch: `husaam-revisions-1`.

The existing page structure and content now sit in a blue and gold celestial theme: a deep-blue home hero, decorative drifting stars, slowly moving orbital lines and ambient glows, gold calls to action, spaced resource cards, scroll entrances, animated card icons and navigation underlines. Shared backgrounds carry the theme through the other pages. No new dependencies or image downloads were added.

The motion button has been removed on request. System reduced-motion settings automatically disable animations and the decorative cursor. The mouse cursor has a blue/gold star and a bounded sparkle trail; touch devices keep their normal interaction. Interior page ornaments, constellation lines, shooting stars, card entrances, and hover effects extend the theme across the site. Resources uses consistently aligned cards. Donate includes a community photograph and a short charity hadith excerpt attributed in plain text to Sahih Muslim 2588, reported by Abu Hurayrah.

## Verification

- Production build and Astro check: zero errors and warnings; one existing async-function hint.
- Eight existing content/site tests pass using Node 24.
- Existing layout suite passes for long content, photo crops, and mobile touch targets.
- Existing browser suite traversed 17 routes at eight widths without horizontal overflow and completed keyboard/dialog/no-JavaScript checks, but its final runtime assertion fails with Firebase `auth/invalid-api-key` because this checkout has no local Firebase configuration. Live events and board authentication are therefore not verified here.
- `node tests/celestial-check.mjs` verifies responsive layouts, resource alignment, the donation reference, cursor behavior, reduced motion, and touch handling, and captures desktop/mobile screenshots. Run against `pnpm preview` on port 4322 with Chrome installed.
- `node tests/celestial-accessibility.mjs` audits seven primary routes at 390px and 1440px using axe.

No production deployment was performed.
