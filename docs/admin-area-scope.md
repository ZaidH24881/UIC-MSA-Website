# Admin scope — implementation status

The original scope is now implemented as the board workspace. See [Admin workspace](admin-workspace.md) for features, local demo login, data model, production setup, and verification limits.

The menu has a bottom Admin section. Prayer/location, event, khutbah, donation-method, and giving-campaign editors include drafts, preview, publication, archival, revision history, and restore. The old event-page login and Decap CMS entry are retired.

The local demo password is `password`, isolated to the preview server. Production uses approved Firebase Google accounts and a separate treasurer/admin claim for financial publishing. This checkout lacks Firebase credentials, so production configuration and access-rule verification remain rollout prerequisites.
