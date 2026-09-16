# MSA at UIC website

A static, responsive community website for membership, prayer information, events, student resources, and giving. Membership remains in CampusGroups, recordings remain on YouTube, and gifts go through the supplied external payment services. There is no membership database, card collection, or contact-form backend.

The implementation follows the user-supplied `improvements.md`; `site-analysis.md` preserves legacy-site evidence. Both documents remain at the repository root. Current operating details take precedence over dated legacy content.

## Run locally

The working toolchain is **Node.js 24, pnpm 11.19, Astro 7, and TypeScript 5.9**. Use the committed pnpm lockfile.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development site normally opens at `http://127.0.0.1:4321`. To inspect the generated site:

```sh
pnpm build
pnpm test
pnpm preview
```

`pnpm build` checks Astro/TypeScript, generates `dist/`, and prepares hosting files. Tests read the built output, so build first. The production preview runs at `http://127.0.0.1:4322` and exercises local permanent redirects and 404 responses. `PORT` can override that port. `pnpm check` runs the source check separately.

## Where to update content

| Content | File |
| --- | --- |
| Membership links, social accounts, contact, prayer, giving, committees | `src/data/site.ts` |
| Events and individual occurrences | `src/data/events.json` |
| Expiring homepage notices | `src/data/announcements.json` |
| Student resources, books, recorded talks, source/review dates | `src/data/resources.ts` |
| Photo dimensions, focal points, descriptions, credits | `src/data/photos.ts` |
| Published images, poster originals, thumbnails | `public/assets/` |
| Legacy redirects | `content/redirects.json` |
| Shared presentation and interactions | `src/components/`, `src/layouts/`, `src/styles/`, `src/scripts/` |
| Page-specific introductory copy | `src/pages/` |

For every content change: edit the record, build, test, inspect its page on a phone-sized viewport, and publish through the chosen host. Review both the homepage summary and detail page when changing prayer or events.

### Add or change an event

Board members without repo access should use the **Events Editor at `/admin`**
instead of editing this file directly — see
[`docs/board-editing-setup.md`](board-editing-setup.md) for the one-time setup and
[`public/admin/config.yml`](../public/admin/config.yml) for the field definitions it
edits. The rest of this section is for editing `events.json` by hand.

`events.json`'s top level is `{ "events": [...] }`. Each object in that array has
`slug`, `title`, `description`, `start`, `end`, `timezone`, `location`, `audience`, `rsvpUrl`, and `status`. Optional fields are `photo`, `photoAlt`, `flyer`, `recap`, and `category`. Supply a factual `photoAlt` description with an event photograph. Use a unique URL-safe slug; use `null` for unknown location or absent RSVP. Status is `confirmed`, `cancelled`, or `postponed`. Categories are `ramadan`, `community`, `learning`, or `service`.

Use complete ISO date-times with an explicit offset and `timezone: "America/Chicago"`. For example, `2027-01-15T13:05:00-06:00` is a winter Chicago time; `2027-07-16T13:05:00-05:00` is a summer Chicago time. These are formatting examples, not event records. Check the correct offset for the actual date, especially around daylight-saving transitions. End must follow start. Avoid date-only strings for occurrences and deadlines.

There is **no recurrence generator**: enter each confirmed occurrence explicitly. For a weekly program, enter only its approved term, omit exception dates, and mark cancellations/postponements clearly. Keep a cancelled record long enough to inform students. Past records can retain a factual `recap`; expired RSVP urgency is removed from detail pages. Event routes are generated from real records, not sample content.

Any current or future event with `category: "ramadan"` activates the Ramadan program view, including cancellations so important changes remain visible. Without one, the Ramadan page uses its off-season message. Past Ramadan records remain available as recaps. Events stay in the current list until their end, with an "In progress" label after they start.

### Prayer and exceptions

The supplied poster authorizes **1:05 PM and 3:05 PM**, with **location announced weekly**. `prayer.receivedAt` records when the schedule was supplied; it does not assert that a room was independently checked that week. Preserve this distinction when updating the date or source.

Update `sessions`, `weeklyLocation`, optional `weeklyDirections`, and `locationUrl` when the team provides current details. Keep `weeklyLocation: null` if the weekly room is unknown. An empty `sessions` array invokes the current-information fallback.

Set `daily.verified` to `true` only after confirming the daily room. Populate `daily.location`, `hours`, and `directions`; optional fields are `accessibilityDirections` and `locationUrl`. Otherwise leave the verified flag false and retain the contact fallback. Do not carry forward the old conflicting fixed-room or summer schedule.

For a temporary change, set `exception` to `{ "message": "Confirmed change", "expiresAt": "complete ISO date-time with offset" }`. Use actual confirmed copy and expiry, then rebuild. An expired exception disappears on the next build.

### Committees, notices, and resources

Involvement status is `open`, `closed`, or `unconfirmed`. Update its `statusMessage` and `opportunities` together. Each opportunity contains `title`, `description`, `status` (`open`/`closed`), application `url` or `null`, and ISO `deadline` or `null`. Closing the overall collection, closing an item, or passing its deadline suppresses its application action. Keep a useful contact option when closed.

Announcements require `title`, `summary`, `url`, `startsAt`, `expiresAt`, and `owner`. Only currently applicable notices appear after a build. Use real, short notices with specific destinations.

For practical resources, preserve source links and update `reviewedAt` after checking the content. Recheck transit guidance against official sources and food information against the named certification directory. Check recording titles and availability on YouTube. Do not turn a directory reference into a guarantee about every menu item or location.

### Giving and membership

The implementation request explicitly authorized the supplied Zelle, Venmo, and PayPal recipients and the prayer poster. Preserve the exact authorized identifiers in `site.ts` and their supplied/approval date. Do not silently replace them with legacy recipients or an old Stripe campaign. Ask the responsible MSA officer before changing a recipient; record the new owner, purpose, approval, and effective period in maintenance records. Verify the destination without making a test payment. If giving is suspended or its details become uncertain, remove payment actions and current recipient artwork together and use the sponsorship/contact route.

Keep the CampusGroups registration, group-access form, WhatsApp Community, and public contact destinations in one place. Do not promise automatic approval or copy private member data into this repository. Contact uses email; no form submission or subscription success is simulated.

Set `donations.enabled` to `false` to suspend giving. An empty `methods` array has the same result: contact-only guidance replaces recipients and payment actions, the poster link is hidden, and the build removes the recipient poster from `dist/`. Republish the full build and purge any old host cache when suspending giving; a cached copy from a previous deployment cannot be recalled by a source edit.

### Photos and credits

The four community photographs were recovered from the existing MSA site's public assets for the requested migration. Reuse assumes MSA has permission to continue publishing its existing photographs; independent ownership releases were not available. Confirm that assumption and required credits before wider public launch. The two supplied posters are authorized task inputs. Do not infer names, dates, or event identities from appearances.

Keep original full-quality masters and permission records outside `public/`. Update the matching `photos.ts` record when replacing a photo, including its real dimensions, alt text, factual caption/credit, and separate `desktop`/`mobile` focal points. Review every crop at phone and desktop widths. Preserve existing photographer credits, including Art of Khanan, unless the supplied terms require a correction. Private permission notes must not appear in rendered pages.

`node scripts/optimize-images.mjs` creates the current responsive WebP variants and optimizes the working JPEGs/logo. It overwrites those working JPEGs: retain masters first. If adding a new photo name, extend the optimizer's input list and asset mapping. Keep poster text legible; use the full original only when expanding it, with a small preview on the page.

## Hosting, freshness, and migration

The actual production host is **not configured yet**. `dist/` is the deployable static output. Cloudflare Pages is a compatible option: use `pnpm build` as the build command and `dist` as the output directory, with the documented Node/pnpm versions. The build generates `_redirects`; `public/_headers` supplies the header rules copied into the output. Other hosts may need equivalent redirect/header configuration.

Set `SITE_URL` to the selected production origin in the host's build environment once chosen. It supplies canonical URLs and the generated sitemap. Keep credentials out of `.env.example`, source files, and `dist/`.

Enable the daily GitHub Actions build/artifact workflow during launch setup. A successful scheduled build and uploaded artifact **do not update the live host on their own**. The optional repository secret `DEPLOY_HOOK_URL` must point to the selected provider's authorized rebuild hook if using that refresh path; it triggers a provider rebuild. Confirm that the provider actually publishes the new build. Without a working deployment refresh, notices, deadlines, prayer exceptions, and past/upcoming classifications remain frozen at the last deployed build. Treat the hook as a secret; never place it in public content.

Before domain cutover:

1. Retain the legacy content, original photos/logo/posters, URL inventory, DNS records, current host access, and any mailing-list dependencies.
2. Deploy to the selected host's preview/staging URL and verify canonical pages, helpful 404, `/search` resource finder, and actual HTTP permanent redirects, including legacy spelling/capitalization. The redirect source is `content/redirects.json`; avoid redirect chains.
3. Check the live external registration, announcements, contact, and payment destinations. Confirm current daily prayer details, event records, committee opportunities, and photo rights with the responsible people.
4. Verify the deployed mobile site and establish a rollback deployment. Preserve email DNS records as well as website records.

This work does **not** authorize changing the existing public domain, cancelling hosting, or deleting dependent services. Complete those actions only after separate authorization and a working replacement.

## Review and annual handover

Record tests actually performed in the release notes; do not infer coverage from installed test packages or a passing build. Review 320, 390, 430, 768, 1024, and 1440px layouts, keyboard navigation, menu focus/Escape, text contrast, reduced motion, image crops, long content, missing images, empty schedules, closed committees, and unknown prayer details. Test real HTTP redirects on the deployed host.

Physical iPhone Safari, physical Android Chrome, and a screen-reader pass have **not yet been completed**. These remain explicit launch checks; a desktop browser emulating phone dimensions does not replace them. No test-count or all-passing claim is made here.

At every board transition, hand over organization-owned repository, domain, hosting, GitHub Actions, CampusGroups, social, and payment-provider access to at least two authorized maintainers. Name the website editor and prayer, events, and treasury contacts. Recheck recipient ownership, group links, photo permissions, semester schedules, notices, resource review dates, billing, and recovery access. Remove outgoing members' access through the organization's normal process.

For rollback, redeploy the last known-good host deployment or revert the faulty content/source commit, rebuild, test, and redeploy. A repository revert alone does not change a running static site. Keep the prior host and its configuration available until the migration and dependent services are confirmed working.

Current unresolved operating details are the daily prayer room/hours/directions, the weekly announced room, future event records, and committee opportunities. The site deliberately provides contact and announcement routes for these gaps.
