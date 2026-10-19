# Web discovery and flyer drafts

## What works without a new key

The existing organizer collectors remain active at `17 */6 * * *` UTC. A separate `pc-discover` worker now runs at `43 */6 * * *` UTC, with its own expiring lease and bounded workload. Four additional approved organizer sites are seeded: AFRIFF, Aké Festival, ART X Lagos and Lagos Fashion Week. It reads robots policy, checks public DNS addresses, limits redirects to the approved host, caps page bytes and request time, and follows up to four relevant same-host event/programme links per page. At most eight queued pages are considered per run, with a 90-second worker budget. Search results on unknown hosts remain pending until a source is approved.

The first live run successfully checked all four organizer sites, discovered ten additional links and created two text-derived event drafts for private review. It published no unreviewed records. Source data without JSON-LD may be converted into a conservative draft only when an explicit full upcoming date and event-like heading exist. This is a heuristic, not an AI claim or verification. No year, venue, coordinate or ticket price is invented. The review form can correct title, description, dates, artwork, registration link and venue coordinates.

In Post > Upload a flyer, the user can choose **Read flyer text**. Pinned Tesseract.js runs in a Web Worker on the device. Worker and WebAssembly loaders are served by the app; English language data (about 2 MB compressed) downloads on first use from tessdata.projectnaptha.com. This processing does not send the flyer to a model provider. Typography, blur and stylized artwork affect recognition quality. Users may paste/correct the recognized text, apply conservative draft fields, complete missing details and tick the confirmation box before publishing. An actual OCR run recognized the title, date and venue in a synthetic test flyer; real Android browser testing remains necessary. Cancelling/unmounting terminates workers, and loading is deferred until a user taps the action.

Users can also submit a public event/organizer URL for source review. Suggestions require Clerk sign-in, are limited atomically to ten per user per day, and never trigger an unapproved URL fetch. Duplicate URLs retain the existing decision.

## Activate wider web search

1. Obtain an API key from https://www.firecrawl.dev/.
2. Open https://supabase.com/dashboard/project/aqwnluhpnqsrofmvtngp/functions/secrets.
3. Add `FIRECRAWL_API_KEY` as a server-side Edge Function secret. Do not use NEXT_PUBLIC_, commit it or send it in chat.
4. The next scheduled discovery run will perform up to two rotating Lagos search queries, at most six results each. The schedule is 01:43, 07:43, 13:43 and 19:43 Lagos time.
5. Approve each new organizer website before collected pages can be fetched. The dashboard’s source form records permission notes, host, review/publishing policy and per-source AI extraction permission.
6. Optional: enable AI extraction globally **and** for selected approved sources. It uses Firecrawl’s structured JSON extraction only when no schema.org/Event data is present, at most two pages per run. Provider search/extraction usage may be billed. Adding a key does not enable AI extraction automatically.

`GET pc-api?status=integrations` reports readiness booleans, never secrets. A run without the search key explicitly records `partial / needs FIRECRAWL_API_KEY`, while approved-site monitoring still runs. Do not describe that state as active internet-wide search.

## Owner review access

`pc_admins` remains empty until the owner confirms their Clerk account. Identify the owner’s exact Clerk user ID, then add it to this service-only table through the Supabase dashboard. This grants powerful approval/source controls; never infer ownership from a display name. After activation, sign out/in or reload the app, then Profile > Event sources & review. Review controls include discovered-link approvals, adding a permitted organizer, pausing sources, global/per-source extraction switches, draft corrections and publication decisions.

Monitoring auto-publishes only when explicitly enabled per source and the structured record passes complete event/coordinate validation. Defaults put new sources in review. Text-derived drafts always require review. Prefer review for new sources before enabling automatic publication. Known venue matching and conservative duplicate checks reuse the existing collector system. Explicit cancellation signals remove the identified source record; when no active source remains, the canonical event is archived. Generic pages lacking stable provider IDs have limited rescheduling/cancellation reconciliation and need review.

## Social accounts and images

A normal Instagram, Facebook or TikTok URL is not an authorized social integration. The source form blocks these platforms as generic monitors. A production social-account connection still needs a registered provider application, approved permissions, account-owner OAuth and a token lifecycle. This release does not claim those connections are complete. Organizers may submit their flyer or public website now. Firecrawl is not a grant of permission to scrape a restricted platform.

Original schema/provider images are retained with their source/credit. No fake official poster is generated. Missing images, unknown dates and uncertain venues require correction. Remote poster URLs can expire; hosting a copy needs permission from the organizer.

## Verification and limits

Automated checks cover private/reserved URLs and DNS, redirect escape, robots denials, bounded responses, structured extraction, incomplete/past records, conservative flyer dates/times and user confirmation. Existing auth/location/collector checks still pass. Private discovery tables have RLS and no anon/authenticated grants; authenticated API ownership comes from verified Clerk JWTs. Atomic quotas and approval decisions are service-role-only functions.

This is an initial bounded discovery system, not complete coverage of every Lagos event or every social account. Catalogue reads/sitemap retain the current 250-event limit. Email/push source alerts, advanced embedding matching, recurring-series IDs and credentialed social connectors remain future integrations. The GDELT news API was evaluated but not enabled after an HTTP 503; it is not presented as a working search source.
