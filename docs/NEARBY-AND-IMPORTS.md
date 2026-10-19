# Nearby and automated event imports

## Test the map

Open https://party-crashers-seven.vercel.app/#map. A loaded Mapbox map shows `Mapbox · connected`. The location arrow prompts for browser location; it is optional and requested only on a tap. Discover's Nearby filter shares the same coordinates and 5/15/30/100 km radius with Map. Coordinates stay in memory and are sent to the Party Crashers nearby API for this query, not saved to the profile. Venue distances are approximate, straight-line distances, not driving routes.

Mapbox's style endpoint returned HTTP 200 using the public token in the production bundle on 19 October 2026. This confirms that the token can fetch a style; it does not replace a real-device WebGL/tile-rendering test. Errors distinguish token rejection (401), denied scopes/website restrictions (403), and general connectivity. If changing NEXT_PUBLIC_MAPBOX_TOKEN in Vercel, redeploy because Next.js embeds public variables at build time. Add the variable separately for Preview if needed; currently it was configured only for Production. Never place a Mapbox secret token in NEXT_PUBLIC_.

## What is automated now

Supabase `pc-collect` reads one allowlisted public organizer source: TECHFEAST's WordPress Events Calendar JSON feed. `pc-event-import` runs at minute 17 every six hours UTC. One immediate import succeeded. Repeat imports update the source ID rather than duplicate the listing, and preserve its first-discovered timestamp. Existing Moonshot and ART X records remain separate organizer-sourced entries; they are not automatically refreshed by this adapter.

The source poster, registration URL, dates and venue are retained. Free exhibition options plus paid passes are described as mixed access, not a wholly free conference. Only complete upcoming published Lagos/VI entries that this adapter can locate are accepted. Its map coordinate is explicitly an approximate VI area center, not a geocoded hotel entrance. A source failure preserves prior listings. Past listings are excluded from discovery and the nearby SQL query. Missing records are not treated as cancellations; source cancellation reconciliation remains future work.

The bounded importer fetches at most 50 records / 2 MB per run and does not follow redirects. The source URL cannot be provided by a browser or request. A random scheduler credential lives in Supabase Vault; only its SHA-256 hash is in service-role-only configuration. Import logs and config have RLS, no client grants, no public policies. No service-role key or scheduler credential is in frontend code or repository files.

Inspect `public.pc_import_runs` for last success, imported/skipped counts and failures. Toggle `public.pc_collector_config.enabled` to disable this source, or pause the cron job. The collector rejects requests without its private scheduler credential. Add further sources through reviewed, provider-specific adapters and tests; don't turn a public endpoint into an arbitrary-URL crawler.

## Growing coverage

Mapbox provides maps, not a database of nearby events. Public organizer feeds, authorized ticketing APIs, community posts and organizer submissions populate the shared event database; PostGIS answers location/radius queries. Broader coverage requires adding those sources. An API credential does not grant rights to every platform's listings. Social integrations require supported APIs, appropriate permissions and organizers connecting accounts. No global Instagram/TikTok/private-account crawler is implemented. DOT TIX explicitly prohibits automated scraping without written authorization and is not included.

Future work: more approved source adapters, cancellation reconciliation, source-health alerts, review tools for uncertain imports, venue geocoding, cross-source deduplication and dynamic public detail pages/sitemaps for imported records. Imported events currently use the app's hash detail route; only the original static event pages are generated at build time.
