# Revision One Feedback: MSA at UIC Website

**Report date:** September 11, 2026  
**Source:** readable messages in the supplied screenshot, `IMG_2981.jpeg`.  
**Purpose:** turn the reviewer’s feedback into a practical brief for the next website revision.

## Summary

The feedback calls for a Meet the Board page, more MSA photography, an events calendar, and easier access to nested pages. Books is the clearest navigation example: the reviewer reports having to go three levels deep to reach it. They also suggest hover menus, while acknowledging that this behavior might already exist.

The next revision should make useful pages easier to find and add the people, photos, and event information that help visitors understand and participate in MSA.

This report documents feedback and proposes implementation details. It does not claim that the current website has been independently audited or that the changes are implemented. The screenshot is cropped at the bottom; only readable messages are included.

## Feedback inventory

| ID | Screenshot feedback | Intended outcome | Suggested priority |
| --- | --- | --- | --- |
| R1 | “For enhancements maybe we can have a meet the board page” | Visitors can learn who leads MSA. | Medium |
| R2 | “Get some more pictures from msa” | The site shows more of the actual MSA community. | Medium |
| R3 | “Calendar of events” | Visitors can find upcoming activities and their dates. | High |
| R4 | “Some subtabs are a bit hard to find I feel” and “Like for example books, have to go 3 indexes deep” | Visitors can reach nested resources through a shorter, clearer path. | High |
| R5 | “Maybe we can hover over tabs to see subtabs, maybe its alr a feature I havent looked at it in a few hours” | Subpages are visible from parent navigation items. | High, coordinated with R4 |

Priorities are recommendations for planning, not rankings supplied by the reviewer. All items remain open pending verification or implementation.

## R1. Meet the Board page

### Request and purpose

Add a dedicated page introducing the MSA board. This would give visitors a clear place to learn who holds each role and help new students recognize the people organizing the community.

### Recommended implementation

- Add a clearly labeled **Meet the Board** destination within the existing navigation structure.
- Show the applicable academic year or board term so visitors know whether the information is current.
- Use consistent member cards with each person’s confirmed name and board role.
- Include portraits and short introductions when supplied. Do not invent biographies or fill gaps with assumed information.
- Present members with consistent visual treatment and an ordering agreed with the board.
- Keep the page usable on narrow screens, with readable text and appropriately cropped portraits.

A suggested placement is under an existing About section, if that matches the current site hierarchy. The exact route and menu location should be chosen after reviewing the implementation.

### Content dependencies

Obtain the current roster, exact role titles, board term, and any portraits or introductions intended for publication. Confirm who will update this information when the board changes.

### Acceptance criteria

- [ ] A dedicated Meet the Board page is reachable through the site navigation.
- [ ] The board term and all displayed names and roles are confirmed.
- [ ] Missing portraits or biographies do not create broken images or fabricated content.
- [ ] Member cards remain readable and consistent on mobile and desktop.
- [ ] Annual roster updates have a documented content location.

## R2. More MSA photography

### Request and purpose

Obtain more pictures from MSA. The request is for additional community imagery; it does not specify a separate gallery or a full visual redesign.

### Recommended implementation

- Request a selection of existing MSA event and community photographs.
- Choose photos that support the surrounding content, such as community images on introductory pages and relevant event images near event information.
- Review existing imagery before choosing replacements or additions, avoiding unnecessary repetition.
- Use real MSA photos rather than introducing unrelated stock imagery.
- Prepare appropriately sized images and intentional crops so faces and meaningful details remain visible.
- Add descriptive alternative text where images convey information. Decorative images should not create repetitive screen-reader announcements.
- Keep loading performance in mind when adding larger photographs.

A standalone gallery is optional and should not be treated as a requirement from this feedback.

### Content dependencies

Obtain the image files, basic event/context information, and confirmation that the selected photos are suitable for website use. Specific placements and the number of additions depend on the available material.

### Acceptance criteria

- [ ] Additional MSA photographs have been obtained and incorporated where they support the content.
- [ ] Images display without distortion or awkward cropping across screen sizes.
- [ ] Informative images have meaningful alternative text.
- [ ] Added photography does not introduce broken assets or unnecessarily large downloads.
- [ ] The content source and relevant photo context are recorded for future maintainers.

## R3. Calendar of events

### Request and purpose

Add a calendar of events. Visitors should be able to determine what is coming up, when it happens, and where to find details.

The screenshot does not specify a calendar provider, an integration, a month-grid layout, or additional features such as RSVP management.

### Recommended implementation

- Make the calendar easy to reach from the primary navigation or the existing Events destination.
- Select a display and maintenance approach that fits the current website and the board’s workflow.
- Show confirmed event titles, dates, start times, and locations. Include end times, descriptions, and registration links when available.
- Make the time zone clear where needed, particularly for online events or external calendar links.
- Provide a readable agenda/list presentation on mobile; a month grid should not force visitors to read tiny text or scroll sideways.
- Distinguish upcoming and past events so outdated information does not appear current.
- Show an honest empty state when no upcoming events are confirmed.
- Define how cancellations, rescheduling, and new events will be reflected.

Before adding a new system, inspect any existing event content or calendar functionality. A maintained external calendar or the existing content structure may be sufficient; the feedback does not require a custom backend.

### Content dependencies

Confirm the event source, the person responsible for updates, the initial event details, and the preferred calendar presentation. The repository README notes that current event records depend on supplied information, so event content must be confirmed before publication.

### Acceptance criteria

- [ ] Visitors can easily locate the calendar or calendar-backed events view.
- [ ] Upcoming entries contain confirmed dates and enough information to attend or learn more.
- [ ] The presentation works on both mobile and desktop.
- [ ] Empty and past-event states are understandable.
- [ ] Links and any embedded calendar load correctly.
- [ ] The update process is documented and can be followed by the designated maintainer.

## R4. Easier discovery of nested pages, especially Books

### Reported problem

The reviewer finds some subtabs hard to locate and identifies Books as requiring navigation three levels deep. This is a reported experience, not a measured click count from a current-site audit.

### Recommended investigation

1. Trace the current route from the homepage to Books on desktop and mobile.
2. Record which parent pages or menus a visitor must open.
3. Check whether Books is already directly linked somewhere that is visually easy to miss.
4. Inspect other nested destinations for the same discoverability problem.

This distinguishes excessive page depth from unclear labels or hidden navigation controls, each of which may require a different adjustment.

### Recommended implementation

- Expose Books as a direct destination in the appropriate navigation submenu.
- Use explicit destination labels so visitors can predict where a link leads.
- Avoid requiring visitors to open successive intermediate pages solely to uncover the next link.
- Keep useful parent landing pages while providing direct links to their children.
- Apply the same navigation pattern consistently to related resources.
- Preserve existing working URLs when possible. If routes change, account for their old locations.

A suggested target is to let visitors open one top-level menu and select Books directly. This is an implementation target, not a requirement quoted from the screenshot.

### Acceptance criteria

- [ ] The current Books discovery path has been checked and documented.
- [ ] Books is visibly accessible through a short, understandable navigation path.
- [ ] Visitors do not have to traverse three nested content pages to reach it.
- [ ] Similar nested destinations follow a consistent pattern.
- [ ] Navigation remains usable on touch devices and with a keyboard.
- [ ] Existing destination links continue to work after any navigation changes.

## R5. Hover menus for subtabs

### Suggestion and uncertainty

The reviewer proposes showing subtabs when hovering over parent tabs, but explicitly says this may already be a feature. Verify the latest implementation before adding or replacing behavior.

Hover menus are a proposed way to address R4, not evidence that hover alone will solve the discoverability problem.

### Recommended implementation

- Inspect whether parent items already reveal submenus and whether that behavior is obvious to visitors.
- If appropriate, let pointer hover reveal a submenu on desktop.
- Use a visible indicator for items with child destinations.
- Keep the submenu open while the pointer moves from the parent into its options.
- Support click/tap and keyboard operation so access does not depend on hover.
- Ensure keyboard users can identify focus, open the submenu, select links, and dismiss it.
- Use a touch-friendly expandable menu on mobile, with clear controls and usable spacing.
- Avoid unnecessarily deep cascading menus that reproduce the original problem.

If hover behavior already exists, improve visibility or reliability only where review shows a problem.

### Acceptance criteria

- [ ] Existing hover behavior has been verified before new work is scoped.
- [ ] Parent navigation items with children are visually identifiable.
- [ ] Desktop submenu options are easy to open and select.
- [ ] Pointer movement into a submenu does not immediately close it.
- [ ] The same destinations are available using keyboard and tap/click.
- [ ] Mobile navigation exposes subpages without relying on hover.
- [ ] Books is easy to find through the revised navigation.

## Suggested implementation sequence

1. **Verify navigation first.** Check the reported Books path and existing hover behavior, then address R4 and R5 together.
2. **Collect content in parallel with implementation planning.** Request the board roster, photos, and current event details.
3. **Add the events calendar.** Confirm its source and maintenance process before publishing entries.
4. **Build Meet the Board and add photography.** Use confirmed material and the established visual style.
5. **Review the complete visitor experience.** Check navigation, readability, content accuracy, and links on desktop and mobile.

This sequence is a proposed work order. Content availability may change the order of delivery.

## Review and handoff

The next revision should be reviewed against the specific requests in this document. Capture the final navigation path to Books, the calendar location and update process, the Meet the Board location, and the pages that received new photography.

| Information to confirm | Why it matters |
| --- | --- |
| Current board roster, roles, and term | Prevents inaccurate leadership information. |
| Available MSA photos and intended use | Determines where meaningful imagery can be added. |
| Current event details and ongoing content owner | Keeps the calendar useful after launch. |
| Current Books route and menu structure | Identifies the actual navigation change needed. |
| Whether hover submenus already exist | Prevents treating an uncertain observation as a confirmed missing feature. |

**Completion standard:** each request is either implemented and checked against its acceptance criteria or recorded with its specific remaining content dependency. Existing functionality should be marked as verified when it already satisfies the feedback.
