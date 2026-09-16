# MSA website implementation

The authoritative brief is [improvements.md](../improvements.md). [site-analysis.md](../site-analysis.md) is the migration inventory. The direct implementation request supplies approved connection links, donation recipients, the 5,000+ Instagram figure, and both posters.

## Architecture and design

Astro 7 and TypeScript generate static HTML. Shared layouts and small progressive enhancements keep membership, giving, and recordings with their existing external providers. No database, custom authentication, shopping cart, or simulated form is included.

Use the brief’s warm paper #F7F4ED, white #FFFFFF, ink #18243B, navy #21365A, blue-soft #E7ECF3, muted #536075, line #D9DDE3, gold #B78B46 and error #A32D32. DM Sans and Libre Baskerville are self-hosted with their font licenses. The desktop homepage pairs a 42/58 copy/photo hero with practical events, prayer, real community photographs, joining steps, student links, and a navy support/footer finish. Mobile stacks the same content in reading order.

## Implementation coverage

- Complete static routes: Home, Join, Events, Prayer, Community, Resources and five resource details, About, Get involved, Ramadan, Donate, Contact, resource finder, and 404.
- Conditional event details: generated only from approved records; no sample event appears in production.
- Accessible mobile dialog navigation, visible focus, Escape and focus return, native FAQ disclosures, real clipboard feedback, and expandable original posters.
- Four genuine MSA archive photographs, optimized responsive variants, separate focal points, factual alt text/captions, visible credits, original masters, and source-only provenance metadata.
- Central content for organization links, prayer, recipients, committees, resources, events, notices, and photos. Prayer/daily/exception, event/cancellation/past, committee/closed, and Ramadan seasonal states are supported.
- Current unconfirmed daily prayer logistics, future events, and committee openings use the brief’s contact/announcement fallbacks.
- The supplied Friday schedule is presented as supplied information, with weekly location unknown; no fixed room or old summer time is carried forward.
- All supplied payment identifiers and six social platforms are retained. X points to the existing verified MSA profile rather than a generic platform homepage.
- Nineteen permanent redirect mappings include all seventeen required legacy routes plus the old home/gallery aliases.
- GitHub Actions builds/tests, creates deployable artifacts, and runs daily. A configured provider deployment hook is required to refresh a future live host.
- Maintainer documentation covers content updates, recipients, photo rights, hosting, DNS cutover boundaries, annual handover, and rollback.

## Verification and launch boundary

See [verification.md](verification.md) for actual test results and limits. The required rendered-width matrix, keyboard interactions, image fallback, real internal links/redirects, date handling, and payload measurements are checked against the generated build.

The repository is the requested delivery destination. No current-domain DNS records, existing hosting, mail services, or payments are changed by this implementation. Choosing and connecting a public host and confirming live operational details remain the explicitly separate launch process described in the brief.

