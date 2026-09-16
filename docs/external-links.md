# External-link verification

**Reviewed:** September 11, 2026, 00:36 America/Chicago (05:36 UTC).  
**Inputs:** Actual destinations exported by `src/data/site.ts` and `src/data/resources.ts` in `work/msawebsite2026`.  
**Method:** Read-only HTTP GET with redirects, response-title/content inspection, and YouTube's public oEmbed metadata. The web reader independently retrieved the Macmillan book page. No forms were submitted, groups joined, messages sent, or payments initiated. No Site checkout files changed.

**Result:** 33 distinct HTTPS URLs checked, including the two capitalization variants of the YouTube channel URL. No confirmed dead destinations. Sign-in requirements and platform limits are detailed below. An HTTP 200 alone was not treated as proof that a form, account, or payment can be used successfully.

## Membership, community, and giving

| Destination | Status | Evidence and practical limit |
| --- | --- | --- |
| [MSA membership signup](https://uic.campusgroups.com/msa/club_signup) | Working public page | HTTP 200; displays the Muslim Student Association group and registration controls. Registration was not attempted. |
| [Brothers/sisters group-access form](https://cglink.me/2gA/s94866) | Authentication required | Redirects to UIC CampusGroups login with `Login Required` and a preserved MSA survey destination. No authenticated form content inspected. |
| [WhatsApp announcements](https://chat.whatsapp.com/CiVJsIGeJBnEqopCHOceMv?mode=ems_wa_c) | Working public invitation | HTTP 200; invitation identifies **MSA at UIC** and offers a join action. No join attempted. |
| [Official Linktree](https://linktr.ee/msaatuic) | Working public page | HTTP 200; MSA identity and membership/social destinations present. |
| [PayPal](https://paypal.me/sjpark83) | Reachable; application-limited | Redirects to `https://www.paypal.com/paypalme/sjpark83`, HTTP 200. Returned PayPal.Me's JavaScript application shell. Recipient-profile rendering and payment functionality were not independently verified. This does not invalidate the user-authorized destination. |

The survey login's preserved destination is `/msa/survey?survey_uid=590520c8-5994-11ef-8274-0e2b5028887f`. Keep the configured short link rather than hardcoding the login URL.

Zelle and Venmo are recipient instructions with no configured HTTPS destination. Their user-authorized email/handle values were not tested through a bank or payment account. `mailto:uicmsa@gmail.com` is correctly formed and matches the [official contact page](https://msaatuic.org/contact); inbox deliverability was not tested.

## Social destinations

| Destination | Status | Evidence and practical limit |
| --- | --- | --- |
| [Instagram: @msa.at.uic](https://www.instagram.com/msa.at.uic/) | Public identity verified; platform-limited content | HTTP 200 with the MSA account identity in the page title. Returned body emphasizes login; full feed and follower count were not reverified. |
| [YouTube: @msaatuic](https://www.youtube.com/@msaatuic) | Working public channel | HTTP 200, MSA at UIC channel title. Uppercase variant used in resources, `https://www.youtube.com/@MSAatUIC`, also returns the same title. |
| [Facebook: MSAatUIC](https://www.facebook.com/MSAatUIC) | Public identity verified | HTTP 200; title identifies the Muslim Student Association at UIC in Chicago. Interaction availability not tested. |
| [TikTok: @msaatuic](https://www.tiktok.com/@msaatuic) | Platform-limited; not confirmed dead | HTTP 200 with only a generic TikTok application shell. The exact destination is corroborated by the [legacy official site](https://msaatuic.org/) and [official Linktree](https://linktr.ee/msaatuic); profile content was not independently inspectable. |
| [X/Twitter: @MSAatUIC](https://twitter.com/MSAatUIC) | Working public profile | Redirects to `https://x.com/MSAatUIC`, HTTP 200. MSA name, exact handle, biography, and posts visible. |
| [LinkedIn group](https://www.linkedin.com/groups/11829083/) | Authentication required | Redirects to LinkedIn login with the configured group URL preserved. Group contents not inspected; destination also matches official Linktree. |

Social login screens, restricted content, and generic application shells are not evidence of deleted accounts. The 5,000+ Instagram figure remains a user-supplied fact, not a result of this link check.

## Practical student resources

All nine destinations below returned HTTP 200 with matching official page identities and relevant resource content. Listings, schedules, and eligibility remain managed by their respective organizations.

| Destination | Status / source |
| --- | --- |
| [Tutoring by subject](https://tutoring.uic.edu/tutoring-by-subject/) | Working public UIC tutoring directory |
| [Writing Center](https://writingcenter.uic.edu/) | Working public UIC resource |
| [Academic Center for Excellence](https://ace.uic.edu/) | Working public UIC resource |
| [U-PASS information](https://idcenter.uic.edu/cta-u-pass/about-u-pass/) | Working public UIC ID Center page; confirms optional/opt-in program |
| [CTA trip planning](https://www.transitchicago.com/planatrip/) | Working public CTA planning page |
| [UIC Transportation](https://transportation.uic.edu/) | Working public university transport information |
| [HFSAA Chicago](https://www.hfsaa.org/chicago) | Working public certifier's regional directory page |
| [HFSAA regions](https://www.hfsaa.org/chapters) | Working public certifier's directory index |
| [HMS Chicago-area directory](https://hmsusa.org/halal/chicago-il) | Working public certifier's listings, addresses, and certification details |

## Book destinations

| Destination | Status |
| --- | --- |
| [The Sealed Nectar — Darussalam](https://darussalam.com/the-sealed-nectar-deluxe-colour/) | Working public publisher page, HTTP 200 |
| [Milestones — digitized edition](https://books.google.com/books?id=NPnXAAAAMAAJ) | Working public Google Books record, HTTP 200 |
| [Don't Forget Us Here — Hachette](https://www.hachettebookgroup.com/titles/mansoor-adayfi/dont-forget-us-here/9780306923869/) | Working public publisher page, HTTP 200 |
| [The Autobiography of Malcolm X — Penguin Random House](https://www.penguinrandomhouse.com/books/106490/the-autobiography-of-malcolm-x-by-malcolm-x-as-told-to-alex-haley/) | Working public publisher page, HTTP 200 |
| [A Peace to End All Peace — Macmillan](https://us.macmillan.com/books/9780805088090/apeacetoendallpeace/) | Direct automated GET received HTTP 403 with a browser-check page. The web reader successfully returned this exact publisher page, title, and author on this review. Platform restriction; not a dead link. |
| [Revolution by the Book — book preview](https://books.google.com/books?id=QJS95M97ljcC) | Working public Google Books record, HTTP 200 |

Book purchasing, stock, pricing, and full-preview access were not tested.

## Recordings

All six configured recording destinations returned HTTP 200 with matching page titles. YouTube oEmbed also returned HTTP 200 for every item and attributed each to **MSA at UIC**. This verifies public pages and metadata; it does not constitute a playback test or a guarantee of future availability.

| Recording | Verified destination |
| --- | --- |
| Nawawi hadith session | [Watch](https://www.youtube.com/watch?v=YMnviZwJcHE) |
| Friday khutbah | [Watch](https://www.youtube.com/watch?v=h9lVJnCdN78) |
| Quran Exploration, Fall 2022 | [Playlist](https://www.youtube.com/playlist?list=PLW9e0tJf9Uln3LoYMBUgsJQmfAnaYjvoZ) |
| Tafseer session | [Watch](https://www.youtube.com/watch?v=3iU7MPpjplA) |
| Dr. Abdur Rafay's talk | [Watch](https://www.youtube.com/watch?v=KJnwgr3j2rs) |
| Shaykh Shirazi's talk | [Watch](https://www.youtube.com/watch?v=cnI-El9cLWU) |

Keep the external watch links and [channel fallback](https://www.youtube.com/@MSAatUIC). The playlist is an archive, not an upcoming event.

## Integration notes

- No destination replacement is indicated by this review.
- Retain clear sign-in expectations for CampusGroups and LinkedIn.
- Keep the PayPal recipient as supplied by the user; do not claim an independently tested payment flow.
- Raw HTTP evidence is retained outside the checkout in `work/external-links-raw.json`; the read-only checker is `work/check-external-links.mjs`.
