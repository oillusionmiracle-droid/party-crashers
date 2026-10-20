# Organizer monitoring and indexed social discovery

Current route does not require a Facebook Page. Existing organizer collectors, web search, user flyer upload/OCR, and event-link suggestions remain connected to the Supabase event catalogue. Source images and provenance remain attached to event records. Only confirmed event records reach Discover/Map; a search result is not proof of an upcoming event.

October 2026 update:
- Search queries use current and following month/year instead of hard-coded year strings. Year-boundary behavior is covered by tests.
- Indexed social searches request the past-month search window. This filters search freshness, not event dates; dates are still checked by event extraction.
- Existing six-hour collection cron jobs remain active. Missing venue pins are resolved by the separate venue worker when a confident match is available.
- Existing For You category filtering and opt-in device location ranking remain in use. User flyers are editable drafts; imported organizer events retain original artwork.
- Last checked: 73 published records and 3 pending candidates. These are a snapshot, not a guarantee that 73 events match any user's location, interests or date filter.
- Design Week Lagos remained unavailable to the robots-aware collector; no bypass was added.

Newly discovered official cultural source for bounded review: Goethe-Institut Nigeria programme https://www.goethe.de/ins/ng/en/veranstaltungen.cfm . Its events span more than one city. Event-specific location must be established before publication; generic Nigeria listings must not be relabelled as Lagos.

Tests: `node tests/discovery-freshness.cjs`, `node tests/discovery-regression.cjs`, `node tests/social-discovery.cjs`.
