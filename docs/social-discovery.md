# Social event discovery

Public indexed Instagram, Facebook and X links are searched through Firecrawl on the existing six-hour discovery schedule. These are leads, not full platform coverage. Posts behind sign-in are not scraped. Organizer pages still require approved sources, robots access, deduplication and complete event validation before automatic publication.

## X API collector (implemented, requires credentials)

1. Create an app at https://console.x.com/ and review its current API pricing and use terms.
2. Set a spending limit in the X console. The application cap limits volume, not the provider's prices.
3. In Supabase project aqwnluhpnqsrofmvtngp → Edge Functions → Secrets add `X_BEARER_TOKEN` using the app bearer credential. Never put it in NEXT_PUBLIC variables, browser code or a commit.
4. Add `X_DISCOVERY_ENABLED=true` to explicitly permit paid searches. Omit it or set it to false to disable collection.
5. The scheduled pc-discover worker requests at most 10 posts per search, with at most two requests per rolling daily quota window across the entire application. Requests that fail still consume the application quota. Start with this small cap.
6. Admin Sources & review displays connection status and up to 20 recent post leads. Original photo URLs and source permalinks are retained in service-only pc_social_posts for 30 days. Existing rows deduplicate by platform/post id.
7. Outgoing registration/organizer links feed the existing URL discovery pipeline. Only links on approved source domains are eligible for collection. Social captions alone never become published events and dates, venues or prices are never fabricated.

Status: GET pc-api?status=integrations reports booleans only; it never returns credentials. No real X request has been tested without owner-supplied credentials.

## Instagram and Facebook

These account integrations are NOT implemented or connected in this change. Use a Meta developer app with the relevant reviewed permissions and organizer authorization. Hashtag/Public Content Access does not mean unrestricted collection or automatic permission to redistribute flyers. Determine the approved product/use case before building account OAuth and token refresh. Do not substitute login-wall scraping.

Official references:
- https://docs.x.com/x-api/posts/search/introduction
- https://docs.x.com/x-api/getting-started/pricing
- https://developers.facebook.com/documentation/instagram-platform/overview
- https://developers.facebook.com/docs/features-reference/instagram-public-content-access/
- https://developers.facebook.com/docs/features-reference/page-public-content-access/

## Website sources added

Freedom Park Lagos https://freedomparklagos.com/events.php
MUSON https://muson.org/upcoming-event/
Terra Kulture https://tickets.terrakulture.com/

Official public listings were checked 20 October 2026. Runtime robots/DNS and public-access checks remain mandatory. Enabling a monitor does not guarantee a source exposes complete Event structured data or grants artwork reuse rights.
