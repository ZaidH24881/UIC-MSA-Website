# UIC MSA website: design and improvement specification

**Prepared:** September 11, 2026  
**Purpose:** A self-contained design brief for an LLM or developer rebuilding the UIC Muslim Students Association website.  
**Inputs:** This file, uploaded MSA photographs, and the implementation request. `site-analysis.md` supplies additional migration evidence but is not required to understand the design.

## 1. The intended result

Create a welcoming, distinctive, photo-led university community website. A student should recognize real MSA life immediately: friends talking after an event, people sharing a meal, volunteers setting up, students learning together, and familiar campus surroundings. Make it easy to join, find prayer information, and see what is happening next.

The design should feel intentional and contemporary, with warm neutral backgrounds, deep navy typography, generous but controlled spacing, large documentary photographs, and concise writing. Its character should come from UIC MSA's people and activities. Avoid turning it into a generic startup landing page or a collection of enlarged event posters.

**Mobile is a primary design target.** Design the 390px-wide experience first, then expand it for larger screens. The mobile version must retain the same quality, warmth, and useful content as desktop.

### Priority order

1. Excellent visual design and authentic community photography.
2. Clear phone navigation and readable, fast mobile pages.
3. Accurate prayer, event, membership, and contact information.
4. Straightforward content updates and dependable annual handover.
5. Low recurring operating cost and portable content.

The design can be implemented using only this brief and uploaded pictures. Current event dates, donation authorization, prayer schedules, and account credentials are separate operational inputs. Missing facts should produce the explicit fallback states below, not prevent the visual implementation or cause an LLM to invent details.

## 2. Art direction: a real campus community

### Overall composition

Use an editorial layout with a clear rhythm: a strong introduction, practical information, a photographic community story, and useful next steps. Mix full-width color bands with restrained content grids. Alternate dense utility sections with spacious photography. Do not place every section in an identical rounded card.

Keep the current MSA identity recognizable through its logo, navy family, and campus/community subject matter. The following palette is a proposed redesign palette, not an assertion of official UIC or MSA brand standards.

### Color system

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F7F4ED` | Main background; warm and lightly textured in feel without an image texture |
| `--surface` | `#FFFFFF` | Forms, event surfaces, and selected utility panels |
| `--ink` | `#18243B` | Body text and main headings |
| `--navy` | `#21365A` | Primary buttons, footer, important feature bands |
| `--navy-hover` | `#172842` | Button hover/pressed background |
| `--blue-soft` | `#E7ECF3` | Subtle prayer/resource sections |
| `--muted` | `#536075` | Supporting text and metadata |
| `--line` | `#D9DDE3` | Quiet dividers and boundaries |
| `--gold` | `#B78B46` | Small decorative rules and accents; avoid using it for small text |
| `--error` | `#A32D32` | Form errors with text and icons |

Paper and white should occupy most of the interface. Navy supplies structure. Gold is a restrained accent, not a large background or a second competing brand. Preserve the natural colors of uploaded photos. Do not tint every photograph blue.

Use white text on navy buttons and navy/ink text on light surfaces. Verify contrast in the actual implementation, including hover, disabled, focus, and image-overlay states. A thin decorative divider need not carry meaning; an input boundary or state indicator must remain perceivable.

### Typography

Use **DM Sans** for navigation, body copy, labels, and most headings. Use **Libre Baskerville** for a short phrase in the hero and occasional editorial headings. Use licensed, self-hosted font files where available; do not rely on an existing Squarespace font license. Fallback stacks: `Arial, sans-serif` and `Georgia, serif`. The fallback should still produce a polished page.

| Element | Mobile | Desktop | Rules |
| --- | --- | --- | --- |
| Hero heading | 40–46px | 64–76px | Line-height 1.05–1.12; no more than three short lines on a typical phone |
| Page H1 | 36–42px | 52–60px | One semantic H1 per page |
| Section H2 | 28–32px | 36–44px | Line-height around 1.15; avoid oversized filler headings |
| Card H3 | 21–24px | 24–28px | Keep names readable; allow wrapping |
| Body | 16–18px | 17–18px | Line-height 1.55–1.7; about 60–70 characters per line maximum |
| Metadata | 14px | 14–15px | Never hide essential logistics in tiny text |
| Navigation/buttons | 15–16px | 15–16px | Medium/semibold; clear verbs |

Use the serif sparingly, with at most one serif phrase per major section. Keep paragraphs short and left aligned. Avoid long all-caps paragraphs, justified text, excessive letter spacing, and mixing more typefaces into event cards.

### Layout tokens

```css
:root {
  --paper: #f7f4ed;
  --surface: #fff;
  --ink: #18243b;
  --navy: #21365a;
  --navy-hover: #172842;
  --blue-soft: #e7ecf3;
  --muted: #536075;
  --line: #d9dde3;
  --gold: #b78b46;
  --error: #a32d32;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --radius-control: 10px;
  --radius-panel: 16px;
  --radius-photo: 20px;
  --content-max: 1200px;
}

.container {
  width: min(var(--content-max), calc(100% - 40px));
  margin-inline: auto;
}
.section { padding-block: 56px; }
.prose { max-width: 66ch; }
img { display: block; max-width: 100%; height: auto; }

@media (min-width: 768px) {
  .container { width: min(var(--content-max), calc(100% - 64px)); }
  .section { padding-block: 80px; }
}
@media (min-width: 1100px) {
  .container { width: min(var(--content-max), calc(100% - 96px)); }
  .section { padding-block: 96px; }
}
```

These are implementation defaults. Adjust a local gap to fit the content, but preserve a consistent scale. On very narrow 320px layouts, 16px side gutters are acceptable. Use soft shadows only when separation is needed, such as an open menu. Most panels should rely on color and a thin border.

## 3. Photography is the main design material

### Image selection instructions for the implementing LLM

Inspect every uploaded image before assigning it. Inventory its dimensions, orientation, sharpness, lighting, visible action, and useful crop. Assign photos by what is actually visible. Never infer a person's name, academic role, event date, or identity from appearance.

Favor candid interaction over rows of people facing the camera. A group portrait is useful for belonging, but the site should also show what participating looks like. Choose a mix of large gatherings and quieter moments. Represent the breadth of the supplied, approved MSA collection rather than repeating the same small group everywhere.

### Photo slot specification

The filenames below are suggested output names, not claims that these files already exist. The LLM should map the supplied files to the roles automatically. The user should not have to rename every upload.

| Role | Preferred subject | Shape / framing | Placement |
| --- | --- | --- | --- |
| `hero-community` | Strong candid gathering with visible interaction | Landscape source, ideally at least 2000px wide; subject in central/right portion | Homepage hero |
| `community-meal` | Students sharing an iftar or meal | 4:3; preserve faces and table context | Community section lead image |
| `community-friends` | Conversation or friendships at an event | 4:5; small group, natural expression | Companion image |
| `community-service` | Volunteers doing something recognizable | 4:3; show the action, not only a logo backdrop | Community mosaic / involvement |
| `community-learning` | Study circle, lecture, or group learning | 3:2 or 4:3 | Community mosaic / resources |
| `campus-context` | MSA students in a recognizable campus setting | Wide, with some surrounding space | About or secondary banner |
| `prayer-space` | Current approved photo of the prayer location | 4:3, with entrance or room context | Prayer directions |
| `event-photo-*` | A photo accurately associated with the event/program | 3:2 | Event or recap cards |

A strong first version can use **six to ten good photographs**. Four can support a reduced layout. Do not fill an arbitrary number of slots with weak pictures. A valid design with three excellent images is preferable to a larger gallery padded with duplicates.

### Hero composition

At desktop widths, build a two-column hero inside the 1200px container: approximately **42% copy / 58% photography**, separated by 40px. The photograph is the dominant visual mass. Use a 5:4 frame approximately 480–560px tall, with a 20px radius. Set a small photo caption underneath when there is verified context.

The copy stays on paper, not on people's faces. Use a small eyebrow, the headline, a short introductory paragraph, then two actions. This layout should still work if the best supplied photo has no empty area for text.

On mobile, stack **copy → actions → photograph**. Use a 4:3 photo frame and a reviewed mobile focal point. Keep the full headline and main action early in the page; do not force the hero to be a full viewport tall. On an ordinary 390 × 844 viewport, some of the photograph should be visible without scrolling, subject to user font settings.

If a group photo cannot tolerate a 4:3 crop, switch that slot to 3:2 or use an uncropped image. Protect people's faces and the meaning of the scene rather than rigidly enforcing a ratio. Avoid cutting heads at the edge, placing text over faces, or cropping an activity until it becomes unrecognizable.

### Community mosaic

Desktop: use a 12-column grid. Put the lead photo across seven columns and the other five columns in a two-image vertical stack. A fourth wide image can follow only if it adds a different scene. Keep a 16–20px gap and align outer edges. Captions sit below frames.

Mobile: show the lead image full width, followed by two full-width images in normal document order. Use a two-column pair only when both are detail shots that remain legible at small size. Do not hide most of the community content in a swipe-only carousel.

Use this section to show activities, not unsupported testimonials. Suggested section heading: **“The moments that make MSA.”** Suggested introduction: **“Shared meals, conversations after events, and time spent learning together.”** Adapt the copy to the supplied imagery; do not describe a meal if no meal is shown.

### Processing and fallback rules

- Produce responsive image variants and use `srcset`/`sizes`; use WebP or AVIF with a compatible fallback when supported by the project.
- Give every image intrinsic dimensions or an aspect-ratio wrapper to reserve layout space.
- Prioritize the hero image. Lazy-load images below the fold. Do not lazy-load the main hero.
- Store separate mobile and desktop focal points in an asset manifest. Default to center, then visually review every crop.
- Preserve natural skin tones. Use subtle exposure/color consistency only; do not apply strong filters or replace backgrounds.
- Use meaningful alt text for informative photos, empty alt for truly decorative duplicates. Alt text describes visible content; captions provide verified context.
- Keep publication approval and photographer credit in private asset metadata. Display credit when required by the supplied terms. Do not expose private approval notes in the public page.
- Never substitute stock people, AI-generated students, or invented event photographs for missing MSA images.
- If an image fails, preserve its space with a quiet solid-color fallback and remove misleading captions. Never show a broken-image icon in the final layout.
- If no suitable prayer-room photo is provided, use clear text directions and a confirmed location link. Do not use an unrelated mosque photograph as the room illustration.
- If only a few photos are supplied, reduce the mosaic and omit optional photo sections. Use the best photo once prominently rather than repeating it across every screen.

Example **proposed** asset-manifest shape:

```json
{
  "id": "hero-community",
  "source": "uploaded-file-name.jpg",
  "output": "/images/hero-community.webp",
  "alt": "Write an accurate description after inspecting the image",
  "caption": null,
  "eventId": null,
  "focalPointDesktop": { "x": 50, "y": 50 },
  "focalPointMobile": { "x": 50, "y": 50 },
  "approvedForPublication": false
}
```

Approval is an asset-status field, not a request to interrupt implementation. Use uploads the user explicitly authorizes for the website. If publication status is unknown, build the preview and identify the unresolved asset before public launch.

## 4. Navigation and page structure

### Proposed navigation

Desktop, at 1100px and above: logo on the left; **Events, Prayer, Community, Resources, About** in the main navigation; a quieter **Donate** link and a primary **Join MSA** button on the right. If the real logo or text makes this crowded, switch to the mobile-style menu earlier rather than shrinking text.

Mobile: a 64px header with a compact logo/wordmark, a Join button, and a 44px menu control. Place a slim two-link utility row immediately below it: **Prayer & Jumu'ah** and **Upcoming events**. Only the main header stays sticky. Avoid a second floating bottom navigation bar.

The mobile menu opens as an accessible dialog with all destinations visible in one scrollable column. Include Join, Events, Prayer, Community, Resources, About, Donate, and Contact. Rows are at least 48px tall. Provide an explicit close button, Escape support, focus containment, background scroll locking, and focus return to the opener. Do not require hover or nested fly-out navigation.

### Proposed route map

| Route | Purpose |
| --- | --- |
| `/` | Welcome, near-term activities, community, and next steps |
| `/join` | Membership and group-access instructions |
| `/events` | Upcoming events and recurring programs |
| `/events/[slug]` | Event details when there is enough confirmed content |
| `/prayer` | Daily space, Jumu'ah information, and directions |
| `/community` | Curated photo stories and optional event recaps |
| `/resources` | Student-resource overview |
| `/resources/student-success` | Practical academic support |
| `/resources/transportation` | Verified commuting resources |
| `/resources/halal-food` | Food listings with verification context |
| `/resources/books` | Curated reading |
| `/resources/lectures` | Recorded talks |
| `/about` | Mission and approved organizational context |
| `/get-involved` | Committees and volunteering |
| `/ramadan` | Seasonal iftar information, with an off-season state |
| `/donate` | Approved donation destination and purpose |
| `/contact` | Direct contact and sponsorship inquiries |

The resource detail pages share one template. Event details are generated only for real records. The photo community page can begin as one curated page; individual album routes are optional, not a launch requirement.

### Footer

Use a navy background and cream/white text. Desktop: three groups for identity/contact, student links, and involvement/social links. Mobile: stack these groups with clear section labels and large touch targets. Include the public email as a link, current year, and a brief identity line.

Do not include an unused cart, empty social accounts, placeholder links, or a newsletter field that cannot submit. Contact must be visible without opening an About submenu.

## 5. Homepage blueprint

Build the sections in this order. The full homepage should feel complete with seven or eight deliberate sections, not a long sequence of promotional blocks.

### A. Optional current notice

Show a compact announcement only for a confirmed, time-limited item such as a prayer-room change or upcoming registration deadline. Use one sentence and a specific link. Store an expiry date. Hide the strip when there is nothing current; do not permanently promote a past Ramadan campaign.

### B. Hero

**Proposed copy:**

- Eyebrow: `MUSLIM STUDENTS ASSOCIATION · UIC`
- H1: `Find your community at UIC.`
- Supporting copy: `A space to connect, learn, and grow in faith together. Meet fellow students, join our events, and make MSA part of your time on campus.`
- Primary CTA: `Join MSA` → `/join`
- Secondary CTA: `Explore events` → `/events`

Set “your community” in the display serif if the line breaks remain balanced. Use the specified split photo composition. Do not add invented membership totals, campus rankings, sponsor logos, or testimonials to make the hero appear established.

### C. This week / upcoming events

Use a short heading and a visible “View all events” link. Show the next three confirmed occurrences, sorted by start date. If there is only one upcoming event, give it an intentional horizontal layout rather than leaving two empty cards.

Desktop: three columns for three events. Mobile: stack them as compact cards. Each card contains an optional image, a readable date, event title, time, location, and a specific action. Preserve event information as actual text even when a flyer is attached.

If there are no confirmed future events, show: **“New events will be posted here. Follow MSA on Instagram for announcements.”** Link to the observed MSA Instagram account. Do not manufacture sample future events in production. Fixtures used for development must be excluded from the public build.

### D. Prayer information

Use a light blue band. Put a heading and brief invitation on the left, with two concise information panels on the right: **Daily prayer space** and **Jumu'ah**. On phones, stack the heading and panels. The “Prayer details and directions” link goes to `/prayer`.

Only show confirmed current logistics. Until current data is approved, use “Check the latest prayer information” and a contact/announcement route. Never select an old time from conflicting source material. Avoid a real-time countdown or “open now” badge unless its schedule and timezone behavior are actually implemented.

### E. Community photo story

Use the mosaic in section 3. Lead with images, not a wall of mission copy. Add one short paragraph and a “See our community” link to `/community`. Let captions explain what is known about the moment. A date or event title is optional; do not invent one.

### F. A first step into MSA

Use a two-column layout on desktop: an approved candid image on one side and three short steps on the other. On mobile, put the steps first and omit the extra photo if the page is already image-heavy.

1. **Become a member.** Register through UIC CampusGroups.
2. **Connect with the community.** Follow the current group-access instructions.
3. **Come to an event.** Find a gathering that interests you.

Primary action: “How to join” → `/join`. A quieter action can lead to volunteering. Do not promise automatic or instant WhatsApp access.

### G. Student resources

Use a compact grid of text links for prayer, academic support, commuting, halal food, and recordings. Use restrained line icons only as supporting cues. Desktop can use three columns; phones use one column, or two only where labels fit comfortably without truncation.

Every tile has a concrete title, one short description, and a real destination. Avoid generic “Learn more” repeated across the entire section.

### H. Support and footer

Finish with a short navy support band: **“Help make these moments possible.”** Supporting copy should describe verified purposes such as community programming, without invented financial impact figures. Link to `/donate`; let that page manage current approved payment destinations.

If no donation destination is confirmed, the support page should offer a sponsorship/contact route. Do not put a nonfunctional payment button on the homepage.

## 6. Key interior-page designs

### Join MSA

Use a welcoming photo banner, a clear H1, and the three membership steps. Show eligibility and group-access instructions in ordinary text rather than in a graphic. Put the CampusGroups button beside step one and repeat it only at the end if the page is long.

Observed legacy membership destination: `https://uic.campusgroups.com/msa/club_signup`. The existing site instructs enrolled UIC students to register with MSA and complete the appropriate survey on the group's CampusGroups page for brothers' or sisters' WhatsApp access. Preserve this as a baseline to confirm before launch.

Add a small FAQ using accessible disclosure controls. Answer only established questions. For unresolved questions, provide the public email rather than writing a plausible policy. Do not collect membership data in a new custom form if CampusGroups already owns registration.

### Events and event detail

Default to an upcoming list grouped by date. Start with simple All / Upcoming / Past controls only if there are enough records to make them useful; otherwise omit filters. Do not build a calendar merely to fill space.

An event detail page puts title, date, time, room, audience, and RSVP above the long description. On mobile the logistics and action precede large artwork. Event photos use `object-fit: cover`; flyers use `contain` or natural dimensions so their text is not cropped. Include a tap-to-expand flyer with a labeled close control.

Past events become recaps and lose RSVP urgency. Cancelled or postponed events visibly show that status. Recurring programs need an effective term and exception dates. Use `America/Chicago`, including daylight-saving transitions. “Add to calendar” appears only when a valid occurrence and location exist.

### Prayer

Make this the fastest information page. Start with this week's verified Jumu'ah logistics, followed by daily prayer space and directions. Display a last-verified date and any active exception notice. Never bury a room change below a photograph.

Use large text for time and room, smaller supporting labels, and a map/directions link with a clear destination. Include indoor directions where an outdoor map cannot finish the journey. Preserve any approved accessibility directions as text. Use a photograph of the actual room/entrance only when confirmed.

If current data is missing, use a clear message and `mailto:uicmsa@gmail.com`. Do not hard-code the old site's conflicting summer schedule and flyer times. Do not infer congregation times from an astronomical prayer-time API.

### Community

Create a curated gallery that reads as a set of moments, with photo groups separated by concise captions or headings. Avoid an endless uncaptioned masonry wall. Show group interactions, meals, learning, service, and campus context when those subjects are actually supplied.

A photo may open in an accessible lightbox with next/previous controls, Escape, focus return, and alt text. The page must remain useful without opening the lightbox. No autoplay or mandatory swipe interactions. Do not associate an uploaded image with a named event unless metadata or the user confirms it.

### Resources

Use a practical directory, with a short introductory heading and category links. Resource detail pages have breadcrumbs, a readable text column, and an optional side list of related resources. On mobile, move related links below the article.

Food listings should separate the name/address, location link, verification basis, and review date. Commuting guidance should link to current official sources. Book recommendations should use short original descriptions. These pages should be easy to edit without redesigning them.

### Lectures

Show thumbnails and descriptive titles in a two-column desktop grid and a single-column phone list. A play action loads the responsive video or opens its verified external page. Add a descriptive iframe title. Do not preload six video players on initial page load. Include an unavailable-video fallback.

### About and involvement

About begins with community photography and a concise mission. Add organizational history or a board grid only if approved data exists. Avoid fabricated founder dates, officer names, biographies, and statistics.

The involvement page shows real opportunities, what help is needed, and whether applications are open. Closed applications should have a helpful contact option. All committee information comes from one record collection, including summaries on the homepage.

### Ramadan and donations

Ramadan has an active-season layout for confirmed upcoming iftars and an off-season layout explaining the program. Preserve past moments as recaps, with dates. Do not leave expired fundraising urgency active year-round.

Donation design should be simple and trustworthy: purpose, approved recipient/campaign, clear external payment action, and a contact for questions. Use an existing approved hosted payment page rather than implementing card handling. Do not invent totals, progress bars, donor counts, suggested-impact claims, tax status, or recipient details.

### Contact

Begin with “Get in touch” and a clear email action. Public email observed on the current site: `uicmsa@gmail.com`. Include a sponsorship inquiry link with an appropriate email subject.

A contact form is optional. If connected, use persistent labels for name, email, topic, and message; mark required fields; show inline errors; preserve input on failure; and confirm delivery only after the backend accepts the message. If no delivery backend exists, use the email route. A decorative form that always shows success is unacceptable.

## 7. Mobile behavior and accessibility requirements

### Responsive behavior matrix

| Component | 320–767px | 768–1099px | 1100px and above |
| --- | --- | --- | --- |
| Header | Compact header, Join, menu; two-link utility row | Same compact navigation | Full navigation if it fits |
| Hero | Copy, buttons, photo stacked | Stacked or balanced two-column layout if copy fits | 42/58 split |
| Event list | One column | Two columns | Up to three columns |
| Prayer panels | One column | Two panels under heading | Heading plus two panels |
| Community mosaic | Full-width sequence | Two columns | Seven/five column composition |
| Resource links | One or two readable columns | Two columns | Three columns |
| Forms | Single column; full-width controls | Single column | Constrained width, never stretched across the page |
| Footer | Stacked groups | Two/three groups | Three groups |

Breakpoints are design decisions, not device detection. Verify intermediate sizes and long content. CSS grid items need `min-width: 0` where appropriate. Do not hide overflow on the body to conceal a broken layout.

### Required interaction details

- Main buttons and icon controls have at least **44 × 44px** targets; use 48px height for major mobile actions. This is a project usability target, stricter than WCAG 2.2's 24px minimum target criterion with its exceptions.
- Body and form input text is at least 16px. Permit zoom and user font resizing.
- Include `width=device-width, initial-scale=1` in the viewport metadata; do not disable scaling.
- No essential information is available only on hover, inside a carousel, or in image text.
- No page-wide horizontal scrolling at 320px. Wide data tables should transform into readable stacked content where feasible.
- Use actual links for navigation and buttons for actions. Avoid nested links/buttons inside a whole-card link.
- Visible keyboard focus must remain clear on paper, white, navy, and photos. Use a dual-color focus treatment if necessary.
- Sticky headers must not cover anchor targets or focused elements; set appropriate scroll margins.
- Use semantic landmarks, one page H1, ordered headings, a skip link, descriptive link names, and properly labeled forms.
- Meet WCAG AA contrast targets: at least 4.5:1 for normal text and 3:1 for large text; check relevant non-text controls as well.
- Test keyboard-only navigation and a screen-reader pass through the menu, joining flow, prayer information, and forms. An automated score alone does not establish accessibility.
- Honor `prefers-reduced-motion`. Keep content visible if JavaScript or animation initialization fails.
- No autoplay background video, scroll hijacking, forced parallax, cursor effects, rotating hero slides, or animation that delays reading.

W3C references: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html), and [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). These are implementation targets; this brief is not a claim of existing-site conformance.

### Motion language

Use 150–220ms transitions for hover, menu opacity, and disclosure states. If a reveal animation is used, limit it to a subtle opacity change and at most 8px movement. Never hide the whole page until an animation runs. Optional photo hover scaling should be no more than 1.02 and disabled for reduced motion. Avoid applying hover transforms on touch-only devices.

## 8. Reusable components and empty states

| Component | Contract |
| --- | --- |
| `SiteHeader` | Same navigation data on every route; responsive menu; active page state |
| `ButtonLink` | Primary, secondary, and text-link variants; clear destination; no empty href |
| `Photo` | Responsive sources, dimensions, focal points, alt, optional caption |
| `EventCard` | Real title/date/location/status; optional image and RSVP |
| `PrayerSummary` | Verified schedule, applicability, exception, review date |
| `ResourceLink` | Title, short description, destination; optional source/review date |
| `PhotoStory` | Approved images and factual captions; no invented event association |
| `Disclosure` | Keyboard-accessible heading/button and controlled panel |
| `Notice` | Short message, type, optional action, and expiry |
| `SiteFooter` | Public contact, canonical links, approved socials |

| Missing / changed input | Required public behavior |
| --- | --- |
| No future events | Helpful no-events message and real announcement link |
| Prayer schedule unconfirmed | Clearly direct visitors to current information/contact; no guessed time |
| Committee applications closed | State closed and show contact option |
| No approved donation URL | Explain support/contact route; omit payment CTA |
| Missing secondary photos | Reduce gallery; maintain deliberate spacing |
| Missing logo asset | Use a clean text wordmark “MSA at UIC” without a fabricated official mark |
| Missing board details | Omit the board grid |
| Disconnected mailing/form provider | Show contact/social route; do not simulate success |
| Expired announcement | Remove automatically according to its end date |
| Unknown event venue | Label “Location to be confirmed” if the event itself is approved; do not make up a room |

## 9. Maintainability and low-cost implementation

### Default architecture

For a new project with no existing stack constraints, use **Astro with TypeScript, static pages, CSS, and structured content files**. Use small interactive components only for menus, disclosures, optional filters, and galleries. If the project already has a suitable stack, implement this design there instead of rewriting only to adopt Astro.

Astro's documentation supports prerendered pages and content collections. This recommendation is an architectural judgment based on a mostly informational site, not a requirement for visual quality. References: [routing](https://docs.astro.build/en/guides/routing/) and [content collections](https://docs.astro.build/en/guides/content-collections/).

Keep membership in CampusGroups, videos on YouTube, and giving with an approved payment provider. Store page copy, events, prayer details, links, and asset mappings separately from layout components. Do not require a database, user accounts, custom authentication, a shopping cart, or an admin dashboard for the first release.

Use organization-owned accounts with more than one authorized maintainer. Document how the next board updates an event, changes a room, replaces a photo, checks a donation destination, and reverts a bad update. Choose a simple editorial interface later if maintainers cannot comfortably edit structured files.

### Freshness on a static site

A build-time filter does not update itself after deployment. Implement a daily scheduled rebuild, or another explicit refresh mechanism, for expiring announcements and moving past events out of upcoming lists. All displayed dates use the campus timezone. Review recurring programs at each semester transition. Show last-verified dates for prayer details and practical resources.

Keep static content usable without JavaScript. Do not ship private member records, mailing-list exports, or secrets in the repository or public build. Put any server credentials in the hosting environment only if a real server integration is needed.

### Cost direction

Target a static-hosting setup with minimal recurring services. For example, Cloudflare Pages documentation states that static asset requests are free and unlimited, while dynamic Functions have separate billing/limits. That makes a static site a plausible low-cost option, subject to current plan limits and MSA's chosen workflow. It does **not** make the entire operation cost-free: domain renewal, email services, form/email providers, payment processing, and maintenance may still cost money.

Reference: [Cloudflare Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/), checked September 11, 2026. Confirm current terms before committing. Actual savings cannot be calculated without the existing bill.

### Performance budgets for the build

These are proposed engineering targets, not measured current-site results:

- Keep the initial mobile page transfer around 1MB or less, excluding media loaded after interaction.
- Aim for a hero image below roughly 250KB on mobile and 450KB on desktop where acceptable image quality allows.
- Aim for no more than 75KB of compressed first-party JavaScript on the homepage; justify exceptions.
- Avoid live Instagram embeds, background video, large animation libraries, and eagerly loaded video players.
- Limit font families and weights. Render useful content while fonts and images load.
- Test on a throttled mobile connection, not only a fast local desktop. Fix oversized images and unnecessary scripts before introducing complicated caching.

## 10. Redirect and consolidation plan

Implement permanent redirects on the selected host, and test their actual responses. Keep a legacy URL only if it remains canonical. Avoid redirect chains.

| Existing path | Proposed destination |
| --- | --- |
| `/general` | `/join` |
| `/jummah` | `/prayer` |
| `/activities` | `/events` |
| `/weekly-events` | `/events` |
| `/programs` | `/events` |
| `/get-involved-1` | `/get-involved` |
| `/volunteer-index-impact` | `/get-involved` |
| `/new-page-3` | `/ramadan` |
| `/donate-index-impact` | `/donate` |
| `/Media` | `/resources/lectures` |
| `/lectures` | `/resources/lectures` |
| `/miscellene` | `/resources` |
| `/student-success` | `/resources/student-success` |
| `/public-transportation` | `/resources/transportation` |
| `/halal-food-spots` | `/resources/halal-food` |
| `/miscellaneous` | `/resources/books` |
| `/mission-index-impact` | `/about` |

Keep `/`, `/about`, `/contact`, and `/donate` as functioning canonical pages. Replace all internal old links directly. Provide a helpful 404 with Events, Prayer, Join, and Contact. If the old search route is retired, serve an explanatory resource-finder page at `/search` rather than silently losing visitors who followed a saved search URL.

## 11. Acceptance criteria

### Design review

- The homepage is recognizably an MSA student community site within the first screen.
- A real supplied photo is a major part of the opening composition when one is available.
- The imagery shows varied MSA moments; no generic stock community or fabricated event imagery is used.
- Typography, colors, spacing, radii, and button styles are consistent across every page.
- Community photos receive sufficient size to show people and interactions clearly.
- Essential logistics are written in HTML text, even when a flyer is attached.
- The page feels deliberately composed at both 390px and 1440px, including when fewer photos are supplied.

### Mobile and functional review

- Inspect at widths **320, 390, 430, 768, 1024, and 1440px**, plus intermediate widths where the layout changes.
- Test on iPhone Safari and Android Chrome if available; identify any untested browser explicitly.
- A student can reach membership, prayer information, or the events list within two taps from the header/home entry points.
- No clipped headings, sideways page scrolling, off-screen form controls, covered focus targets, or inaccessible menu items.
- Long event names, missing photos, empty schedules, closed applications, and unconfirmed prayer data have deliberate layouts.
- All displayed upcoming events are genuinely upcoming in the campus timezone.
- All internal links and redirects work; external destinations are verified before launch.
- Form submission and payment links are never simulated. Calendar files, if provided, contain valid dates and times.
- Navigation, primary content, and ordinary links remain usable when nonessential JavaScript fails.
- Photo crops are reviewed individually on mobile and desktop.
- Keyboard, contrast, alt text, heading order, and reduced-motion checks are complete.
- No invented statistics, people, testimonials, room assignments, schedules, or financial claims appear in the public build.

### Handover

Deliver source code, structured content, optimized assets, an asset manifest, redirects, and a short maintenance README. Include the commands needed to install, preview, build, and deploy using the project's actual toolchain. List unresolved publication facts clearly and record which tests were actually performed. A polished preview can be complete while a few live operational details still need MSA confirmation.

## 12. Ready-to-use implementation prompt

Copy the following prompt into the coding tool with this Markdown file and your MSA photos. You may also attach `site-analysis.md` for migration details.

```text
Build the replacement UIC Muslim Students Association website described in
improvements.md. Treat that file as the design and behavior specification.
Use site-analysis.md, if supplied, as legacy context and migration evidence;
do not reproduce its documented problems or treat dated facts as current.

Implement the site, not just a plan. First inspect all supplied photos and
map them to the defined image roles. Build the complete responsive design
using the warm paper/navy palette, DM Sans with selective Libre Baskerville,
split photo hero, community mosaic, practical event/prayer sections, and
mobile navigation specified in the brief. Use the provided font fallbacks
if the font assets are unavailable. Use a text wordmark if no logo is supplied.

The result must feel specific to a real UIC Muslim student community.
Give candid MSA photographs substantial visual space. Use deliberate mobile
crops, natural image color, factual captions, and accessible alt text.
Do not use stock people, generated event photos, giant flyer-only sections,
generic gradient cards, autoplay media, or decorative nonfunctional controls.

Use the existing project stack when appropriate; for a new unconstrained
project use the static-first Astro/TypeScript approach in the brief.
Implement the proposed pages, reusable components, structured content,
legacy redirects, and specified empty/error states. Keep membership,
payments, and video with approved external providers. Do not invent a
backend or show fake form success.

Make reasonable implementation decisions without waiting for more visual
direction. Missing photos should simplify the composition, not block it.
Missing operational facts should use the specified truthful fallback states.
Do not invent event dates, prayer times, committee openings, board members,
donation recipients, statistics, testimonials, or image/event associations.
Keep development fixtures out of the public build.

Review the result at 320, 390, 430, 768, 1024, and 1440px. Check photo crops,
navigation, touch targets, long text, keyboard access, contrast, reduced
motion, links, and empty states. Fix observed issues before handing it over.
Report tests actually performed and remaining unverified publication facts.
Provide the working site preview, source, optimized assets, asset manifest,
redirect configuration, and maintenance instructions. Prepare the site for
launch; do not change the existing public domain or cancel services unless
that action is separately authorized.
```

## 13. Source and decision notes

The visual system, photo treatment, layouts, copy proposals, component contracts, and engineering budgets in this file are original recommendations. They are not descriptions of the current site. Current-site context came from public inspection of https://msaatuic.org/ and the routes documented in `site-analysis.md` on September 10–11, 2026.

Observed external baseline links are https://uic.campusgroups.com/msa/club_signup and https://www.instagram.com/msa.at.uic/; current policy and account destinations should be checked before launch. Accessibility, framework, and hosting references are linked alongside the recommendations they support.
