# Board workspace

Implemented on `husaam-revision-2`. Open **Menu → Admin → Board workspace**. The Events page no longer contains a board sign-in button.

## Local demonstration

Build with `pnpm build`, then start the production preview with `ADMIN_DEMO=1` and `node scripts/serve.mjs` (PowerShell: `$env:ADMIN_DEMO='1'; node scripts/serve.mjs`). Visit `http://127.0.0.1:4322/admin/` and use `password`.

The preview is bound to loopback. The demo API requires same-origin JSON requests and a random HttpOnly, SameSite session cookie. It stores changes in ignored `.local-admin/content-4322.json`, outside the built website. Restarting the server signs you out but preserves content. This password and adapter are never shipped in the production browser bundle or Cloudflare worker. Production builds use Firebase Google authentication; the preview adapter is disabled unless explicitly enabled in the local server environment.

## Editors

- **Prayer & locations:** Friday location, four prayer sessions with individual room overrides, Chicago effective dates, directions/map links, daily room/hours/accessibility, and a temporary announcement. Outside the effective date window, public visitors see a confirmation notice instead of stale Friday times. The dated original announcement image is hidden after a schedule is published.
- **Events:** preserves existing event IDs, title, description, Chicago dates, location, audience, RSVP, category/status, flyer upload and existing photo/recap fields. New content overrides the legacy event by slug on every event list/calendar. Archive hides an event without permanently destroying it.
- **Khutbahs:** title, speaker, date, summary, supported recording URL, transcript, order, and archive. YouTube videos have a privacy-enhanced embed; Vimeo/SoundCloud use an outgoing recording link. Existing static lecture resources remain available.
- **Donation methods:** recipient, alternate identifier, instructions, HTTPS destination, order, archive, and a separate before/after confirmation at publish time. The old donation poster is hidden after edits so it cannot contradict the current details. Current payment methods are withheld while live data is loading; load failures show contact instructions.
- **Giving campaign:** heading, introductory copy, and purpose. The charity hadith and its reference are preserved.

Each editor supports draft, public preview, publish, revision history, and restore-as-a-new-publication. Unsaved edits trigger a navigation warning. Draft and publish conflicts retain the form contents instead of silently overwriting newer data. Revision history starts with the first CMS publication; original static defaults remain in source control. Daily locations and payment methods use manual updates; automatic prayer calculation and scheduled publication are outside this release.

## Production setup and rollout

This checkout has no Firebase environment credentials. Local demo workflows are verified; the Firebase adapter and rules need staging verification before enabling production editing.

1. Keep the existing six `PUBLIC_FIREBASE_*` build variables and Google provider configuration described in `docs/board-events-setup.md`. Add the actual production domain to Firebase Auth's authorized domains. Never enable the local preview server as a production service.
2. Back up existing Firestore content. Review the board allowlist in `src/data/board-access.ts` and the rules generator; both currently preserve the repository's existing two accounts. All board accounts must have verified email addresses.
3. Explicitly choose which existing board account is allowed to publish financial changes. An authorized Firebase administrator must set its custom claim `msaRole` to `treasurer` or `admin` using the Admin SDK, preserving other claims. No account is promoted by this code. Refresh the user's sign-in after changing claims. Other board editors can save financial drafts but cannot publish them.
4. Generate `firestore.rules` with `node scripts/generate-admin-rules.mjs`. Deploy that file to the same Firebase project, then deploy the new client in the coordinated release window. These rules replace the prior permissive event-write rules: the legacy events collection is readable but no longer writable. Do not deploy the rules alone while expecting the old event editor to remain writable.
5. The new collections are `cmsPublic`, `cmsDrafts`, and `cmsHistory`. No special indexes are needed. Public documents contain only published content, including archived markers required to suppress old event records. Private drafts/history require an approved board account. The browser uses transactions for revision checks and publishes the matching immutable history entry atomically. Rules reject anonymous writes, unapproved accounts, unknown fields, invalid field types, invalid URL schemes, and unauthorized financial publication.
6. Defaults are read from existing site content until a CMS document is published. Existing events remain in their current collection; the new documents override them by ID without deleting the originals. Khutbah entries are additive to the existing lecture library. No manual rebuild is required after publishing; visitors receive published changes on their next page load. Runtime network failures show dated/explicit fallback states; donation destinations are not silently substituted.
7. The old `public/admin` Decap assets and `/cms-auth` token relay are retired. The worker returns 410 for `/cms-auth` and no longer binds the GitHub bot token. Review any external Cloudflare Access policies on `/admin*` and remove obsolete CMS policies/secrets only after the Firebase login has been verified. No external account, token, or policy was changed by this implementation.
8. In a staging Firebase project, verify direct requests from anonymous, non-board, board-editor, and treasurer users, transaction conflicts, private-draft reads, financial publishing, and immutable history before live rollout. Firestore rules could not be emulator-tested in this environment (no Java/Firebase emulator). The local test adapter is not evidence of Firebase rule enforcement.

Rollback: restore a previous CMS revision through the workspace. For a deployment rollback to the old editor, restore the old rules in the same release window; simply reverting the browser without its matching rules leaves the old editor read-only. Keep a Firestore export before a rollback or migration.

## Verification

- `pnpm build`: Astro diagnostics and static production build.
- Node 24 `--test tests/*.test.mjs`: existing content tests plus schema, invalid URLs, effective dates and Chicago DST edge cases.
- `node tests/admin-browser.mjs`: isolated port 4323 with separate test data, restored after the test; verifies demo login, unauthorized API rejection, draft privacy, publication, stale revisions, event/khutbah rendering, donation confirmation, archive/restore, sign-out, mobile overflow and axe accessibility.
- `node tests/celestial-check.mjs`: responsive pages, animated underline, native crescent-arrow pointer, spark pool, reduced motion and touch behavior.
- `node tests/celestial-accessibility.mjs`: public-page axe checks.

The local preview is functional. Deploying Firebase rules, assigning financial roles, and publishing the site are separate production setup steps, not changes made to a live service in this run.
