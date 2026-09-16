# Implementation verification

Reviewed September 11, 2026 against the generated production build and the supplied [design brief](../improvements.md). This records observed results and distinguishes launch checks that remain outside the local preview.

## Build and functional checks

| Area | Evidence and result |
| --- | --- |
| Static output | Astro builds 18 complete pages: 17 content destinations plus 404. Event detail routes are additionally generated when real records exist. |
| Types and templates | `pnpm build` runs `astro check` before building; no errors, warnings, or hints. |
| Automated content checks | `pnpm test`: eight passing tests covering HTML structure, all local assets/links/fragments, supplied connection/payment/prayer facts, Chicago dates and daylight-saving transitions, expiry, event validation, and ongoing events. |
| Responsive pages | `node tests/browser.mjs`: all 17 content routes at 320, 390, 430, 768, 1024, 1099, 1100, and 1440px; no horizontal overflow or browser errors. |
| Menu and interactions | Mobile open/close, Tab containment, Escape, return focus, scroll unlock, native FAQ disclosure, actual clipboard value/feedback, poster expansion/close, and reduced motion checked. |
| Progressive enhancement | JavaScript-disabled mobile navigation and ordinary prayer links work. Failed hero image produces a quiet text fallback. Donation poster is not downloaded before interaction. |
| Accessibility | axe checks tagged WCAG 2 A/AA, 2.1 AA, and 2.2 AA on all 17 routes reported no violations. Keyboard checks and the saved Home/Join/Prayer accessibility trees were reviewed for order, names, logistics and headings. This is not a blanket conformance certification. |
| Redirects and recovery | All 19 legacy mappings return actual HTTP 301 responses in the production preview, with slash variants and query preservation; all targets resolve directly. Unknown paths return the helpful 404 with HTTP 404. Host deployment must retain these rules. |
| Long content and touch | `node tests/layout.mjs`: browser-only long event names and three cards without photos fit at 320, 390, 768, and 1440px. Visible primary buttons/controls on Home, Join, Prayer, and Donate meet 44px minimum width/height on mobile. |
| Conditional content | `node tests/states.mjs` builds isolated synthetic examples outside production content. It verifies ongoing/past events, visible Ramadan cancellation, removed RSVP on cancelled/past details, suspended giving without recipient text or poster in output, closed committee applications, and verified daily/weekly prayer details in both summary and detail. |
| External links | [33 destinations reviewed](external-links.md), with no confirmed dead links. Authentication and platform limitations are recorded. No registration, group join, message, purchase, or payment was submitted. |

Reports: [browser](verification/browser-report.json), [layout](verification/layout-report.json), [conditional states](verification/states-report.json), and [performance sample](verification/performance.json). CI repeats the build, content, browser, layout and state checks on pushes and scheduled builds; local reports do not imply a successful remote workflow run.

## Visual review and performance

The rendered homepage was inspected at 390px and 1440px, as were the prayer page and individual community photographs. The first mobile community photo begins about 627px down, within an 844px viewport. Original MSA images retain natural color; meaningful subjects and visible photographer watermarks remain in frame. All four community images have desktop/mobile crop captures. The full-width layout, empty schedules, unknown prayer information, and resource pages remain deliberately composed without invented content.

A fresh Chrome context at 390px, DPR 2, 1.6 Mbps throughput and 150ms simulated latency transferred approximately **252,444 bytes (247 KiB)** initially. The measured 1200px hero resource was approximately **140 KB**, under the brief's mobile budget. The sample navigation took approximately **2.25 seconds**. These are local emulation measurements, not field Core Web Vitals or a Lighthouse score. Video players, social feeds and full-size posters do not load eagerly. Fonts are locally served; motion respects the system preference.

## Content and handover audit

- All requested connection steps, the WhatsApp invitation, six social destinations, 5,000+ Instagram figure, Zelle email, both Venmo identifiers, and both PayPal identifiers are present. The generic X link is replaced by MSA's verified account.
- Both supplied posters are preserved, with essential logistics in HTML. The supplied Friday times are 1:05 PM and 3:05 PM; the weekly location remains explicitly unannounced. Old fixed-room and summer schedules were not reused.
- No future event, officer, committee opening, testimonial, additional statistic, or room assignment is fabricated. Current empty data has useful contact/announcement fallbacks. Test fixtures live only under ignored `test-results/` during verification and never in the public build.
- Source, the dependency lockfile, structured content, optimized images, original photo masters, font licenses, asset provenance, redirects, daily build workflow, maintenance guide and launch/rollback instructions are included.
- The static build contains no member records, credentials, private mailing-list exports, or source-only photo provenance notes.

## Explicit limits before public launch

Physical iPhone Safari, physical Android Chrome, and a screen-reader application were not available for testing. Desktop Chrome's accessibility tree and phone-sized viewports are partial evidence; perform those device/assistive-technology checks on the chosen host.

The weekly room, daily prayer room/hours/access directions, future events, and committee openings remain unconfirmed. Their intended truthful fallbacks are complete. Continuing rights for photographs already published on the former MSA site are assumed for this authorized migration and should be confirmed for public launch. Supplied recipients are authoritative task inputs; payment receipt and inbox delivery were not tested.

Public hosting and the existing domain have not been changed. Configure the selected host, `SITE_URL`, redirects/headers and `DEPLOY_HOOK_URL` (or an equivalent scheduled deployment) before cutover. A scheduled build artifact alone does not refresh a live host. These launch boundaries follow the brief, which allows a finished preview while operating details are confirmed separately.
