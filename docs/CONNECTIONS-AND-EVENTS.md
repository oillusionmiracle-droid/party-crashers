# Party Crashers connections and event data

## Mapbox: phone-friendly setup

1. Open https://account.mapbox.com/access-tokens/ and sign in.
2. Create a public web token; use Mapbox's public map scopes. Do not create a secret token for the browser.
3. Restrict allowed URLs to `https://party-crashers-seven.vercel.app` and the exact other app URLs you use. The default public token cannot have URL restrictions; create your own token to restrict it.
4. Open https://vercel.com/oillusionmiracle-droids-projects/party-crashers/settings/environment-variables.
5. Add `NEXT_PUBLIC_MAPBOX_TOKEN` with that public token. Select Production and Preview (and Development if you use it locally).
6. Redeploy the latest commit, or push the next code change. Public Next.js variables are baked into the build, so saving a variable without rebuilding does not change an existing deployment.
7. Open Map. The app automatically selects Mapbox when this variable is present. Browser location permission is separate and does not require a Mapbox key.

Official references: https://docs.mapbox.com/accounts/guides/tokens/ and https://docs.mapbox.com/help/dive-deeper/how-to-use-mapbox-securely/.

## Google sign-in: OAuth credentials, not an API token

In production you are correct: Google Cloud gives you an OAuth **Client ID and Client Secret**, which you put in Clerk. These are not a Maps API key or a short-lived Google access token.

1. In Clerk, select your application/instance, open SSO connections, add Google for all users, and enable sign-up/sign-in.
2. For production enable custom credentials. Copy the exact Authorized Redirect URI shown by Clerk.
3. In Google Cloud configure Google Auth Platform/consent, then create an OAuth client of type Web application.
4. Add the real application origin to Authorized JavaScript origins. Add Clerk's exact callback URL to Authorized Redirect URIs; do not invent an app `/callback` URL.
5. Paste the Client ID and Client Secret into Clerk's Google connection and save.
6. During Google's Testing stage configure permitted test users as required. Configure publishing/verification for your actual launch and requested scopes.
7. Test in Chrome or another full browser. Google disallows authentication inside embedded WebViews.

Development Clerk instances can use shared Google credentials, so custom Google credentials are not required just for development. Production Clerk requires a domain you control and its DNS setup. The current app still uses development Clerk keys; a Vercel production deployment is not the same as a Clerk production instance.

If you create another Clerk application or switch to its production instance, update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in Vercel and update the API's exact `ISSUER` to match. Do not put Google or Clerk secret keys in `NEXT_PUBLIC_*`, GitHub, screenshots, or chat. The Supabase API checks Clerk sessions through JWKS and does not need the Google client secret.

References: https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google and https://clerk.com/docs/guides/development/deployment/production.

## Why sign-in repeated setup

The previous login callback always forced `#setup/interests`. The corrected flow returns through `#auth/complete`, waits for Clerk session loading and account preference resolution, and sends completed users to their previous page. A partial cloud profile no longer replaces locally completed setup; completed local preferences are uploaded when needed. Explicit Profile > Edit remains available. Failed authentication is shown as failed authentication, never a fabricated signed-in user.

Device storage belongs to an origin. The `chatgpt.site` and `vercel.app` deployments cannot directly read each other's local preferences. Signed-in cloud profiles provide continuity between origins; anonymous local preferences cannot cross domains automatically.

## Our existing app API

Party Crashers already has a Supabase Edge Function API backed by its own database:

`https://aqwnluhpnqsrofmvtngp.supabase.co/functions/v1/pc-api`

- `GET /pc-api`: published events (currently capped at 250).
- `GET /pc-api?q=design`: full-text search.
- `GET /pc-api?area=Yaba`: area filter.
- `GET /pc-api?lat=6.50&lon=3.38&km=10`: nearby events through PostGIS.
- Authenticated `POST` actions: profiles, saved events, follows, publishing, reports, poster uploads and registration-click records.

Requests from our app use an explicit origin allowlist; private actions verify Clerk JWTs. This is currently an application API, not a released third-party developer API. Before offering external API keys, add proper rate limits/quotas, versioned URLs, stable pagination, API-key issuance/revocation, usage tracking, documented error contracts and an OpenAPI specification. Do not grant external applications direct service-role access to the database.

An API exposes data; it does not create an event catalogue. Organizers create events on Eventbrite, and Eventbrite exposes records through its API. For Party Crashers the catalogue should combine organizer submissions, authorized feeds/partnerships and permitted organizer-page imports. A collector would extract facts, validate dates and venue, preserve the source link, deduplicate and refresh cancellations. Three organizer sources now have scheduled imports; see `NEARBY-AND-IMPORTS.md` for the implemented scope and remaining integrations. This is not citywide or global coverage.

## Actual event images

Event records already have `imageUrl`; uploads return a hosted URL. Import the organizer's genuine event poster/image when access and reuse are permitted, record its source, and display it directly. Do not generate artwork and present it as an official event poster. An absent image currently uses an editorial text fallback. Importers should preserve original image URL, hosted image URL if copied with permission, image credit and source URL. Use organizer uploads or an approved provider image field; a Mapbox key cannot supply event posters.

The interest and area illustrations are separate decorative UI assets, not official event photographs.

## Suggested next build order

1. Owner test of Google/email sign-in, reload persistence, account profile and saving an event.
2. Connect the location action to the existing radius query, expose a radius selector and keep manual area selection when permission is denied.
3. Organizer submission review and an admin verification queue.
4. Link/flyer import into a reviewable draft, including the genuine poster and image attribution.
5. Scheduled permitted source collectors, deduplication and cancellation checks.
6. Developer API access only after the catalogue and access controls are reliable.

## Artwork generation record

Built-in image generation produced transparent 3D miniature illustrations for Ajah (coastal neighbourhood), Festac (estate and festival-inspired monument), and Mainland (danfo, flyover and bridge). The reference was the existing orange/yellow/purple/blue location artwork. All prompts required no text, labels, controls or UI; the illustrations represent districts rather than exact architectural surveys. Assets: `public/assets/locations/ajah.webp`, `festac.webp`, `mainland.webp`. Existing Design/Education/Community/Startups illustrations remain in `public/assets/interests/`.
