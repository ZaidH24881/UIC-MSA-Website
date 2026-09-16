# UIC MSA website: current-site analysis and rebuild reference

**Website:** https://msaatuic.org/  
**Prepared for:** UIC Muslim Students Association redevelopment  
**Inspection dates:** September 10–11, 2026  
**Companion file:** `improvements.md`, the proposed design and implementation specification.

## 1. Purpose and how to use this document

This document records the public site's structure, content types, dependencies, and important migration issues. Give it to the developer or coding LLM rebuilding the site alongside `improvements.md` and MSA-owned photographs. Use this file to understand what exists; use the companion file to decide what the replacement should look like and how it should behave.

The existing site is a student organization information hub. Its essential jobs are helping students join MSA, find prayer information, attend activities, volunteer, access resources, watch lectures, and support the organization. The public functionality observed does not establish a need for a complex custom application.

The user reports that the current site is expensive. Actual invoices, subscription tier, domain registration, email billing, administrative access, and contractor costs were not available. This review therefore cannot quantify current spending or promise a specific saving.

### Evidence and limitations

- **Observed:** Content, links, rendered desktop screenshots, and public page DOM inspected during this review.
- **Inference:** Architectural or usability conclusions drawn from that evidence, labeled as such where needed.
- **Needs confirmation:** Time-sensitive operational information that should not become production truth merely because it appears on the old website.

Desktop inspection used a viewport of approximately 1363 × 936 CSS pixels. Mobile-related markup was inspected, but the current site was **not tested on a physical phone or at a controlled mobile viewport**. Mobile risks below are consequently not claims of measured mobile failures. No Lighthouse, accessibility conformance, analytics, or load-testing report was produced. Forms were not submitted, videos were not watched end to end, and no donation was made. Search results sometimes contained older snapshots; live browser observations take precedence where the two differ.

This is a public-site inventory, not a CMS export. Unlinked pages, private records, mailing-list configuration, analytics, and unpublished content remain outside the inspected scope.

## 2. Existing information architecture

### Main navigation

The logo links to `/`. The desktop header has eight top-level labels plus search. Several labels are folders whose URLs resolve to a first child rather than a distinct landing page.

| Top-level label | URL in navigation | Children / observed destination |
| --- | --- | --- |
| General | `/general` | Flyer-based general information |
| Salah | `/jummah` | Prayer information |
| Activities | `/activities` | Weekly Events, Get Involved; folder URL resolves to `/weekly-events` |
| Iftars | `/new-page-3` | Ramadan iftar information |
| Donate | `/donate` | Donation information |
| Media | `/Media` | Lectures; folder URL resolves to `/lectures` |
| Miscellaneous | `/miscellene` | Student Success, Public Transportation, Halal Food Spots, Book Recommendations; folder URL resolves to `/student-success` |
| About | `/about` | Mission, Contact; folder URL resolves to `/mission-index-impact` in the retrieved page |

The mobile DOM includes a top bar, branding, menu button, overlay, and nested folder navigation. Template classes indicate a fixed top bar and an overlay configured to slide from the left. Presence of this implementation is evidence of responsive intent, not proof of usable phone behavior.

### Public route inventory

| Route | Current role | Inspection finding |
| --- | --- | --- |
| `/` | Homepage | Multi-section landing page with membership, announcements, mission, community claims, and action links |
| `/general` | General information | Four image records; almost no descriptive body text beyond the welcome heading |
| `/jummah` | Salah | Daily prayer location and opening hours; Jumu'ah information with conflicting text and flyer details |
| `/weekly-events` | Weekly activities | Three flyer subjects represented by image/gallery markup; no structured event descriptions in extracted body text |
| `/get-involved-1` | Committee involvement | Spring 2026 signups described as closed; email fallback |
| `/new-page-3` | Iftars | Short explanation of the Ramadan program and donations |
| `/donate` | Donations | Stripe campaign link and manually listed payment methods |
| `/lectures` | Recorded talks | Six YouTube embeds, including a playlist, under topic headings |
| `/student-success` | Academic advice | Nine numbered study and university-life tips |
| `/public-transportation` | Commuting guide | Bus directions involving UIC, Union Station, and Ogilvie; transit-app suggestions |
| `/halal-food-spots` | Food directory | Restaurant/address list, additional food suggestions, and an external certification-directory link |
| `/miscellaneous` | Book recommendations | Six books with descriptive text |
| `/mission-index-impact` | Mission / about | Welcome, community purpose, imagery, and a quotation attributed to Qur'an 3:103 |
| `/contact` | Contact / sponsorship | Email and invitation to contact; no main-content form or iframe was observed |
| `/volunteer-index-impact` | Older volunteer page | Separate page still referring to closed Spring 2025 signups |
| `/programs` | Homepage RSVP destination | Returned a 404 in web retrieval |
| `/donate-index-impact` | Older homepage donation destination | Browser rendered site header/footer and an empty main area; web retrieval did not resolve it successfully |
| `/search` | Site search | Header form submits a query through `q`; search results were not tested |

Also retain the folder aliases `/activities`, `/Media`, `/miscellene`, and `/about` in migration planning. The exact legacy spelling and capitalization matter when accounting for existing links.

## 3. Shared layout and visual language

### Header and footer

The desktop header is a substantial blue band, approximately 200 pixels tall in the inspected screenshot. A circular MSA logo with Chicago skyline imagery sits left, navigation is centered, and search appears at right. The footer repeats the blue background and contains organization/address details, a small information column, volunteer/donation links, and social icons.

Observed public contact details:

| Field | Value |
| --- | --- |
| Organization email | `uicmsa@gmail.com` |
| Address shown | 750 S Halsted St, Chicago, IL 60607 |
| Instagram | `https://www.instagram.com/msa.at.uic/` |
| Twitter / X | `https://twitter.com/MSAatUIC` |
| Facebook | `https://www.facebook.com/MSAatUIC` |
| TikTok | `https://www.tiktok.com/@msaatuic` |
| YouTube | `https://www.youtube.com/@msaatuic` |

These are observed destinations, not independently verified account-ownership claims. The address is not enough by itself to direct a student to a particular prayer room.

### Design observations

The site uses a muted blue, pale neutral page backgrounds, large centered headings, generous vertical spacing, and a mix of sans-serif headings and serif-looking body text. Computed homepage heading styles included `sofia-pro`, blue `rgb(74, 92, 140)` / `#4A5C8C`, 40px second-level headings, and 120px first-level headings at the inspected desktop width. These are sampled values, not a complete design-token extraction.

The membership section uses an image with an overlapping white text panel. Other areas combine photographic backgrounds, image blocks, galleries, and large statements. Existing imagery supplies some community identity, but registration graphics and information flyers carry much of the prominent content.

**Design assessment:** The strongest reusable element is recognizable MSA identity. The main visual weakness is hierarchy: large navigation, broad whitespace, oversized display text, and flyer graphics compete for attention. A newcomer has to interpret several different presentation styles before reaching a clear next step.

### Mailing-list overlay

A near-full-screen mailing-list overlay appeared during the initial homepage visit. It displayed a prayer photograph, an email field, a subscribe control, explanatory copy, and a close control. It obscured the underlying homepage until dismissed.

Its existence must be accounted for in migration, but delivery destination, subscriber storage, consent records, frequency settings, and success/error behavior were not verified. The replacement should not imply newsletter signup works until an actual provider is connected.

## 4. Page-by-page content and migration notes

### 4.1 Homepage

**Source:** https://msaatuic.org/

Observed section order: welcome and Ramadan donation CTA; membership instructions; current announcements presented as flyers; social links; a large mission statement; another mission block; community statistics; a closing set of RSVP, volunteer, and donation actions.

Membership currently routes through CampusGroups. Students must be enrolled at UIC and registered with MSA to request access to the respective brothers' or sisters' WhatsApp group through a survey on the MSA group page.

The site asserts 3k+ Instagram followers, 50+ years of service, and a 15% Muslim student share / over 5,000 Muslims, alongside a national size claim. Treat all of these as **unverified legacy claims**, not approved replacement copy.

The closing RSVP points to `/programs`, volunteering to `/volunteer-index-impact`, and donation to `/donate-index-impact`. These differ from the main navigation destinations and need reconciliation.

**Migration requirement:** Preserve the membership pathway and useful calls to action; consolidate duplicate mission material and verify time-sensitive claims before reuse.

### 4.2 General information

**Source:** https://msaatuic.org/general

The main body is effectively a gallery. Image records include older and newer screenshots. A settled desktop screenshot showed payment/WhatsApp information, a Jumu'ah flyer, and part of a WhatsApp QR graphic across the gallery. Details are embedded in images, with little corresponding semantic text.

**Migration requirement:** Classify each flyer by its actual purpose. Membership instructions belong with joining, donation instructions with giving, and prayer information with Salah. Extract facts into editable fields after verification. Do not require a student viewing the site on a phone to scan a QR code displayed on that same phone.

### 4.3 Salah / Jumu'ah

**Source:** https://msaatuic.org/jummah; flyer also visually inspected on `/general`.

The text lists SCE 315 for daily prayer, Monday–Friday 11:00 a.m.–9:00 p.m., with indoor directions and separate brothers' and sisters' entrances. It describes room 301 for Jumu'ah and labels a 1:00 p.m. time as a summer schedule.

The visible Jumu'ah flyer instead says first prayer at **1:05 p.m.**, second at **3:05 p.m.**, with the **location announced weekly**. This is a concrete content conflict. It must be resolved with current MSA information before launch; do not choose one version based only on apparent recency.

**Migration requirement:** Separate daily prayer space, this week's Jumu'ah schedule, location exceptions, and indoor directions. Preserve explicit season/date context. A calculated prayer-time widget would not establish the organization's actual congregation schedule.

### 4.4 Weekly events

**Source:** https://msaatuic.org/weekly-events

The page is a flyer gallery rather than a structured schedule. Current browser inspection found three distinct subjects, with repeated image elements supporting the gallery. Repeated DOM records do not establish duplicate events.

**Migration requirement:** Create editable records containing title, date or recurrence, start/end time, room, audience, short description, and registration destination. Keep the flyer as supplemental artwork. A filename timestamp is not an event date.

### 4.5 Getting involved and the older volunteer page

**Sources:** https://msaatuic.org/get-involved-1 and https://msaatuic.org/volunteer-index-impact

The primary involvement page explains committees led by Shura members other than the presidents, then says Spring 2026 committee registration is closed and provides an email fallback. The separate volunteer page says Spring 2025 signups are closed and remains linked from the homepage/footer.

**Migration requirement:** One canonical involvement page should supply the same open/closed status everywhere. Preserve a useful next action while registration is closed. Do not invent current committee names, vacancies, application dates, or officers.

### 4.6 Iftars

**Source:** https://msaatuic.org/new-page-3

This is a short informational page about donated support for Ramadan iftars. It describes two iftars per week serving university and wider Chicagoland community members.

**Migration requirement:** Retain the program's purpose, but confirm future frequency, eligibility, dates, venue, and donation campaign. The page currently lacks the structured logistics needed to treat it as a current event schedule.

### 4.7 Donations

**Source:** https://msaatuic.org/donate

The page combines an appeal, an image, a 2026 iftar Stripe link, and Zelle/QuickPay, Venmo, and PayPal instructions tied to a named treasurer. The published manual recipient details require MSA confirmation before being carried forward; this document intentionally does not make them production configuration.

**Migration requirement:** Preserve the ability to give through an approved external destination. Record current recipient/campaign ownership, accounting responsibility, and validity period. Do not build a payment backend or shopping cart merely because the old template includes commerce infrastructure. Do not invent tax-deductibility statements or impact-per-dollar figures.

### 4.8 Lectures

**Source:** https://msaatuic.org/lectures

Six topical headings organize YouTube content: Nawawi sessions, Jumu'ah khutbahs, Qur'an exploration, tafseer, a Gaza talk, and Thursday talks. The browser exposed five individual-video embeds and one playlist. One playlist iframe had no title attribute. Playback and continuing availability were not validated.

Observed video identifiers, useful for recovery: `YMnviZwJcHE`, `h9lVJnCdN78`, `KJnwgr3j2rs`, `3iU7MPpjplA`, `cnI-El9cLWU`. Playlist: `PLW9e0tJf9Uln3LoYMBUgsJQmfAnaYjvoZ`.

**Migration requirement:** Retain the source identifiers and verify the heading-to-video associations. Use descriptive records and responsive players; load embeds only when needed. Keep recordings hosted on the video platform.

### 4.9 Student success

**Source:** https://msaatuic.org/student-success

Nine tips cover attendance, advice from experienced students, planning, consistent routines, office hours, suitable study methods, using time well, avoiding procrastination, and campus study spaces. The page ends by positioning MSA as a source of support.

**Migration requirement:** Preserve the practical intent in short, readable sections. Replace extensive all-caps presentation with normal text. Confirm any university-resource links added during rebuilding.

### 4.10 Public transportation

**Source:** https://msaatuic.org/public-transportation

The guide describes routes involving CTA buses 7, 8, 60, and 157, UIC, Union Station, and Ogilvie. It also discusses U-Pass and map/transit apps.

**Migration requirement:** Do not present these legacy instructions as current transit advice without checking official sources. Keep destinations and commuter needs as the content model; store updated directions, sources, and last-checked dates. The page's U-Pass description should not replace current UIC eligibility rules.

### 4.11 Halal food

**Source:** https://msaatuic.org/halal-food-spots

The page lists Chicago restaurants and addresses, includes other food/dessert suggestions, advises visitors to do their own checking, and links to the HFSAA directory. Examples include Cairo Kebab, I Dream of Falafel, Ghareeb Nawaz, and a campus Wazwan listing.

**Migration requirement:** Check operating status, address, campus availability, and the basis for any halal claim. Distinguish a restaurant's own statement from independent certification. Do not infer that every item or every business mentioned on the page is certified halal. Retain verification dates and source links.

### 4.12 Books

**Source:** https://msaatuic.org/miscellaneous

The page lists The Sealed Nectar, Milestones, Don't Forget Us Here, The Autobiography of Malcolm X, A Peace to End All Peace, and Revolution by the Book. Descriptions are lengthy compared with the otherwise simple resource structure.

**Migration requirement:** Preserve an inventory of titles and authors for editorial review. Use concise original descriptions rather than automatically copying long publisher blurbs. The misleading legacy slug should redirect to a clearly named books route.

### 4.13 Mission

**Source:** https://msaatuic.org/mission-index-impact

The page welcomes prospective, first-year, and transfer students, emphasizes unity and faith, and describes an inclusive campus community. It states that non-Muslims are welcome and includes community imagery and a translation attributed to Qur'an 3:103.

**Migration requirement:** Keep the faith-centered and welcoming character. If using scripture, verify the exact wording and translation attribution. Use real community images and approved organizational history. No public board roster was established by this review.

### 4.14 Contact

**Source:** https://msaatuic.org/contact

The page invites questions and sponsorship inquiries and displays `uicmsa@gmail.com`. Despite language asking visitors to provide information below, the inspected main content contained no form or iframe, and the full-page screenshot showed no input fields.

**Migration requirement:** Provide an explicit usable contact route. A visible email link is sufficient for a basic launch. If a form is added, it needs a real delivery mechanism, labeled fields, validation, error handling, and a verified submission test.

## 5. Platform and integration inventory

### Confirmed public evidence

Squarespace infrastructure is visible through image CDN URLs, Squarespace CSS assets, `sqs-*` components, and template classes. Pages use galleries, image blocks, buttons, footer components, and a promotional signup overlay. Sampled homepage images use `srcset` and Squarespace size variants. Some image alternative text is empty or a camera/screenshot filename.

The public markup also includes commerce-related styles/classes and search extraction exposes `Cart 0`; the inspected desktop header hides the cart. This **does not establish an active online store**. Similarly, template class names suggesting parallax, autoplay, or animation are configuration evidence, not a measurement of every runtime effect.

The sampled homepage description metadata was empty. Social-sharing title and image metadata existed. Heading order includes several H1s and uses H3s for long prose. Those observations support content/semantic cleanup; they do not constitute a complete SEO or accessibility audit.

### External dependency map

| Capability | Observed destination / implementation | What must survive a migration |
| --- | --- | --- |
| Official membership | `https://uic.campusgroups.com/msa/club_signup` | Working membership destination and understandable instructions |
| WhatsApp access | Instructions through CampusGroups surveys; QR artwork also exists | Confirmed current access policy; do not expose private invite links by default |
| 2026 iftar donations | `https://donate.stripe.com/cNi28r90X2H1bIZ72f9ws00` | Retain as a legacy reference; treasurer must confirm active campaign before production use |
| Other giving methods | Manually published recipient details | Current approved recipients, maintained in one place |
| Mailing list | Squarespace-style overlay and email input | Existing provider/subscriber ownership must be established if retained |
| Recorded lectures | YouTube embeds and playlist | Verified identifiers, titles, and external fallback links |
| Social presence | Five linked social accounts | Approved current account URLs |
| Contact | Published Gmail address | Tested contact path and responsible officer |
| Site search | Header GET form to `/search?q=...` | Explicit replacement or deliberate retirement after navigation is simplified |

These destinations were extracted from the site. Unless stated otherwise, their external workflows were not followed or tested.

## 6. Findings that affect the rebuild

| Priority | Finding | Evidence | Consequence |
| --- | --- | --- | --- |
| High | Conflicting prayer information | Summer text vs current gallery flyer | Students could rely on the wrong time or room |
| High | Broken or ineffective primary actions | `/programs` 404; empty main area at `/donate-index-impact` | Interest may not lead to participation or giving |
| High | Duplicate volunteer information | Spring 2025 and Spring 2026 pages | Navigation determines which outdated message a student sees |
| High | Information trapped inside images | General and weekly-event galleries | Key facts are harder to scan, search, update, and access assistively |
| High | Contact instructions lack an observed form | Browser DOM and screenshot | Page suggests an interaction it does not visibly provide |
| Medium | Entry overlay precedes homepage | Initial browser visit | Membership and practical tasks are interrupted |
| Medium | Weak naming and legacy URLs | General, Miscellaneous, `new-page-3`, multiple `index-impact` routes | Harder to predict destinations and maintain links |
| Medium | Heavy visual scale | Tall header and oversized sampled headings | Content competes for space and attention |
| Medium | Dated claims and instructions | Statistics, seasonal campaigns, transport and restaurant lists | Migration can accidentally republish unsupported information |
| Medium | Multiple third-party video embeds | Lectures DOM | Potential loading overhead; no measured performance result available |

## 7. Content model to carry into the rebuild

This is an inferred implementation model, not a description of the current CMS database.

| Record | Minimum useful fields |
| --- | --- |
| Organization | Name, short description, public email, logo, social links |
| Announcement | Title, summary, destination, start/end visibility, owner |
| Event | ID/slug, title, description, start/end date-time, timezone, location, audience, RSVP URL, photo/flyer, status |
| Recurring program | Schedule, effective date range, exception dates, cancellation status, contact |
| Prayer information | Daily space, hours, directions, Jumu'ah sessions, date applicability, exceptions, verification date |
| Involvement opportunity | Committee/name, description, availability, deadline, application or contact URL |
| Donation campaign | Purpose, approved external URL, recipient owner, validity, review date |
| Lecture | Title, topic, speaker when verified, date when known, video/playlist ID, thumbnail |
| Student resource | Category, title, summary, destination, source, last reviewed date |
| Photograph | File, dimensions, alt text, factual caption, event association if known, focal point, publication approval |

Use `America/Chicago` for campus scheduling. Keep unknown dates, locations, names, and URLs empty in source records rather than inventing them to satisfy a layout.

## 8. Migration preservation checklist

1. Obtain organization-controlled access to the domain, existing hosting, source assets, mailing provider, and relevant external accounts.
2. Export available pages/content and retain original photos, logo files, flyers, and the current URL inventory before canceling anything.
3. Resolve the prayer schedule conflict and validate membership, volunteer, and payment destinations.
4. Separate evergreen descriptions from expired announcements and historical event records.
5. Replace Squarespace-hosted image dependencies with owned copies where MSA has rights to use the assets.
6. Implement the new routes and the redirect map in `improvements.md`; test real HTTP behavior.
7. Preserve necessary DNS records, especially email records, during a hosting change. Domain registration and website hosting are different responsibilities.
8. Verify forms and links, mobile layouts, accessibility, and student tasks on the replacement before switching the domain.
9. Keep a rollback path and a named maintainer. Cancel the old paid service only after the new site and any dependent services work.

## 9. What still needs MSA confirmation

These are publication and operations inputs, not blockers to implementing the proposed visual design.

- Current daily prayer hours, this week's Jumu'ah times, rooms, and exception process.
- Current event records and committee status.
- Official membership/group-access policy and current external destinations.
- Donation recipient and campaign authorization.
- Whether the mailing list is active and must be migrated.
- Approved photos, caption context, logo source, and any brand restrictions.
- Which statistics and organizational-history claims can be substantiated.
- Content-update ownership after annual board turnover.
- Actual cost breakdown and cancellation dependencies.

## 10. Source register

Public sources were inspected September 10–11, 2026. Page-specific findings above identify their source. Browser-only findings include screenshots, computed heading styles, mobile markup, the mailing overlay, exact navigation targets, YouTube iframe identifiers, the absent observed contact form, and the empty donation-alias main area.

| Source group | URLs |
| --- | --- |
| Main entry | https://msaatuic.org/ ; https://msaatuic.org/general |
| Prayer and programs | https://msaatuic.org/jummah ; https://msaatuic.org/weekly-events ; https://msaatuic.org/get-involved-1 |
| Giving | https://msaatuic.org/new-page-3 ; https://msaatuic.org/donate |
| Media | https://msaatuic.org/lectures |
| Resources | https://msaatuic.org/student-success ; https://msaatuic.org/public-transportation ; https://msaatuic.org/halal-food-spots ; https://msaatuic.org/miscellaneous |
| Organization | https://msaatuic.org/mission-index-impact ; https://msaatuic.org/contact |
| Legacy destinations | https://msaatuic.org/volunteer-index-impact ; https://msaatuic.org/programs ; https://msaatuic.org/donate-index-impact |

The findings are a dated snapshot. Use them as migration evidence, not as a substitute for confirming current campus operations.
