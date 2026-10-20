# Admin area — future implementation scope

Status: planning only for husaam-revision-2. No login, permissions, content storage, or menu behavior changes are implemented in this revision.

## Entry point and screens

Add an Admin section after the public links at the bottom of the shared menu, with a Board sign in link to /admin/. Remove the discreet sign-in panel from Events only when the replacement is ready. Public events remain visible without authentication. Authenticated board members see a dashboard with Prayer & locations, Events, Khutbahs, Donations, and Sign out. Each editor has a saved-state indicator, validation messages, Preview, Save draft, and Publish controls. Keep keyboard access, mobile layouts, and the blue/gold moon design.

Proposed routes: /admin/ (dashboard/login), /admin/prayer/, /admin/events/, /admin/khutbahs/, and /admin/donations/. Returning to the public site must not discard an unsaved draft without a warning.

## Content and editing

| Area               | Editable fields                                                                                                                                                                               | Publishing rules                                                                                                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prayer & locations | Daily prayer-room name, building, room, address, directions/map URL, accessibility notes; multiple Friday prayer sessions with time and location; temporary announcements and effective dates | Use America/Chicago timezone and explicit local dates; allow multiple sessions; reject invalid times and end-before-start dates; preview the exact public display. Manual schedule updates first, automatic prayer calculations later.                    |
| Events             | Existing title, dates/times, location, description, RSVP link, and existing event fields                                                                                                      | Reuse the current Firebase event editor and its validation; preserve existing event IDs and public behavior; support draft, publish, archive, and delete confirmation.                                                                                    |
| Khutbahs           | Title, speaker, date, summary, approved video/audio URL, optional transcript link, display order                                                                                              | Validate HTTPS URLs and supported media providers; generate embeds from validated URLs rather than arbitrary HTML; preview playback; archive without destroying history.                                                                                  |
| Donations          | Introductory copy, donation-method labels, recipient/handle, payment URL, instructions, method order, visibility, and campaign text                                                           | Show a before/after preview of recipient and destination URL; require a separate explicit publish confirmation for financial destination changes. Keep the existing hadith and citation unless separately reviewed. Never collect card data on this site. |

Optional later areas: board profiles, FAQ, general resource links, campaign progress, and scheduled publishing. These are outside the first release.

## Authentication and authorization

The requested password for a future local prototype is `password`. It is a demo-only requirement, not a production credential. If a password demo is built, isolate it from production data and disable it in production builds. Do not place a password-based production gate in client JavaScript.

For the real board area, retain the existing Firebase Google sign-in and approved board accounts. Confirm the final board roster before rollout. Enforce permissions in Firestore Security Rules or a verified server endpoint, including direct requests that bypass the interface. The current client allowlist is only a display convenience. Use board-editor access for ordinary content, and an explicitly authorized administrator/treasurer role for donation destination changes and account administration. Public users may read only published content; drafts and change history must be private. Deny anonymous writes and reject malformed fields at the storage boundary.

## Data and integration plan

Current sources are src/data/site.ts (prayer and donations), src/data/resources.ts (lecture/resource entries), and the existing Firebase events collection. The current EventsAdmin component and src/scripts/events/admin.ts provide reusable authentication and event editing logic. The shared Header component owns the menu.

Use a published site-settings document for prayer/location and a separate one for donation methods, with matching private drafts. Use a khutbah collection for individual entries and retain the existing events collection. Records need schemaVersion, revision, updatedAt, updatedBy, and publishedAt; dates must use explicit timezone handling. Keep immutable revisions/change records with the actor, time, and changed fields. A transaction must check the base revision before publishing so concurrent editors cannot silently overwrite one another. Provide restore-from-revision as a new publication.

Before migration, inventory every component that reads the current static values. Seed records from those values and compare the public rendering. Decide public data delivery explicitly: the proposed first release loads published records at runtime with a cached/static fallback so an admin publication does not require a manual GitHub build. Ensure the fallback is visibly dated where stale prayer information matters, and provide a clear unavailable state for critical missing data. Donations must never silently switch to an unverified destination. If server rendering or a rebuild webhook is chosen instead, document publication delay and failure recovery before implementation.

Audit the legacy /cms-auth handling in worker/entry.js and any old CMS route/configuration before introducing /admin/. Remove obsolete token-relay infrastructure only after confirming no active dependency; do not revive it for the new dashboard.

## Delivery phases

1. Confirm fields, roles, content owners, Firebase environment, and publication delivery; back up existing data and write rules tests.
2. Implement /admin/ authentication and dashboard plus the bottom-menu entry. Move the existing events editor and verify feature parity before removing its old sign-in location.
3. Build prayer/location and khutbah editors with drafts, previews, validation, revision conflicts, and public rendering.
4. Build donation editing with destination review, restricted publishing, and audit history. Test using non-production payment destinations.
5. Seed and compare content, run accessibility/mobile and authorization tests, train board members, then deploy with a rollback plan.

## Acceptance criteria for that future run

- Admin appears at the bottom of the menu on desktop and mobile; public pages never require sign-in.
- All existing events editing works from the new dashboard; the old Events sign-in is removed only after parity.
- Authorized edits update every relevant public page through the chosen publication mechanism; drafts never leak to public reads.
- Anonymous and unauthorized direct writes fail; ordinary editors cannot change donation destinations; production rejects demo-password access.
- Prayer times and effective dates behave correctly around Chicago daylight-saving transitions; invalid times/URLs cannot be published.
- Two editors receive a conflict warning rather than overwriting each other. Publish failures preserve drafts, and previous revisions can be restored.
- Keyboard, focus, error messages, loading/empty states, small screens, and reduced-motion behavior pass verification.

This document scopes the work only. The requested new Admin menu section and its editors are intentionally not implemented in this run.
