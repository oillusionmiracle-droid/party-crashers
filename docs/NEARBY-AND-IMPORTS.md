# Nearby and automated event imports

## Test the map

Open https://party-crashers-seven.vercel.app/#map. A loaded Mapbox map shows `Mapbox · connected`. The location arrow prompts for browser location; it is optional and requested only on a tap. Discover's Nearby filter shares the same coordinates and 5/15/30/100 km radius with Map. Coordinates stay in memory and are sent to the Party Crashers nearby API for this query, not saved to the profile. Venue distances are approximate, straight-line distances, not driving routes.

Mapbox's style endpoint returned HTTP 200 using the public token in the production bundle on 19 October 2026. This confirms that the token can fetch a style; it does not replace a real-device WebGL/tile-rendering test. Errors distinguish token rejection (401), denied scopes/website restrictions (403), and general connectivity. If changing NEXT_PUBLIC_MAPBOX_TOKEN in Vercel, redeploy because Next.js embeds public variables at build time. Add the variable separately for Preview if needed; currently it was configured only for Production. Never place a Mapbox secret token in NEXT_PUBLIC_.

## What is automated now

Supabase `pc-collect` reads three allowlisted organizer sources: TECHFEAST’s public JSON feed, Lagos Fringe’s published programme and Lagos AI Summit’s official page. `pc-event-import` runs at minute 17 every six hours UTC. One immediate import succeeded. Repeat imports update the source ID rather than duplicate the listing, and preserve its first-discovered timestamp. Existing Moonshot and ART X records remain separate organizer-sourced entries; they are not automatically refreshed by this adapter.

The source poster, registration URL, dates and venue are retained. Free exhibition options plus paid passes are described as mixed access, not a wholly free conference. Only complete upcoming Lagos entries with an identifiable venue are automatically published. Known venue matching now uses sourced venue-centre coordinates for Oriental Hotel and Freedom Park. Coordinates remain approximate, not entrance or driving-route coordinates. Unknown stage names go to a private review queue. A source failure preserves prior listings. Past listings are excluded from discovery and the nearby SQL query. Explicit organizer cancellation signals withdraw that source’s listing; the canonical event is archived only when no other source remains active. Listings missing from two complete successful imports enter review; absence never automatically means cancellation.

The bounded importer fetches at most 50 records / 2 MB per run and does not follow redirects. The source URL cannot be provided by a browser or request. A random scheduler credential lives in Supabase Vault; only its SHA-256 hash is in service-role-only configuration. Import logs and config have RLS, no client grants, no public policies. No service-role key or scheduler credential is in frontend code or repository files.

Inspect `public.pc_import_runs` for last success, imported/skipped counts and failures. Toggle `public.pc_collector_config.enabled` to disable this source, or pause the cron job. The collector rejects requests without its private scheduler credential. Add further sources through reviewed, provider-specific adapters and tests; don't turn a public endpoint into an arbitrary-URL crawler.

## Growing coverage

Mapbox provides maps, not a database of nearby events. Public organizer feeds, authorized ticketing APIs, community posts and organizer submissions populate the shared event database; PostGIS answers location/radius queries. Broader coverage requires adding those sources. An API credential does not grant rights to every platform's listings. Social integrations require supported APIs, appropriate permissions and organizers connecting accounts. No global Instagram/TikTok/private-account crawler is implemented. DOT TIX explicitly prohibits automated scraping without written authorization and is not included.

## Operations added

Three enabled sources now run every six hours, independently recording success/failure. A failed source does not stop others. A three-minute database lease prevents concurrent collectors. The HTTP job timeout is 120 seconds. Failed fetches do not remove existing listings; run/source logs make failures visible.

Discover > “Where these events come from” displays public source health and the last successful update. Profile > “Event sources & review” is visible only to administrator accounts. Administrators can pause/resume a source, approve venue-corrected candidates, reject an import, or keep/archive a missing listing. Alerts are in-app (failed updates or success older than 18 hours); email/push alerts have not been configured.

The private tables `pc_sources`, `pc_import_candidates`, `pc_event_sources` and `pc_admins` are service-role-only. Candidate approval runs in a transaction, locks the row, checks the administrator’s Clerk ID, validates Lagos coordinates and complete details, protects community-owned records and rejects repeat decisions. No owner account was granted admin privileges based only on a display name. To activate, the project owner must identify their Clerk user ID and add exactly that ID to `public.pc_admins` through the Supabase dashboard. Never accept administrator IDs from a browser request as authorization; the Edge API derives the caller ID from a verified Clerk token.

Cross-source matching requires the same calendar date plus high title and venue similarity; accepted matches retain one canonical event ID and source provenance. Different dates/venues remain separate. This is conservative text matching, not embedding or AI extraction. The first source’s canonical fields take priority on a cross-source match; conflicting schedules/venues still need human review.

## Public URLs

The Next.js site now runs on Vercel’s Next.js runtime rather than static export. `/events/[id]/` fetches a published record on demand, including new imports and community posts. `/events/` and `/sitemap.xml` use the database catalogue with five-minute revalidation. No privileged keys are used for these server reads. App sharing uses these public URLs for all published records. Catalogue reads and sitemap currently have the API’s 250-record cap. Unknown/archived records return 404; API failures produce a retryable error rather than pretending the event does not exist.

## Remaining integrations

More approved sources, broader venue resolution, owner administrator activation, real-device browser testing, social-account OAuth permissions, embedding matching, flyer vision extraction and out-of-app alert delivery remain separate work. No unrestricted social-media crawler is implemented. Organizer HTML adapters intentionally stop and flag errors if the reviewed programme format changes. Official festival identity artwork is credited as such; it is not described as a poster created for an individual performance.

## Web discovery and flyer reading update

A separate approved-site discovery worker and on-device flyer OCR are now implemented. See `WEB-DISCOVERY-SETUP.md` for current capabilities, Firecrawl secret setup, owner activation and provider limits. Four additional organizer monitors are active; internet-wide search still needs its provider key. This supersedes the earlier statement that flyer extraction and broader website monitoring were wholly future work.
