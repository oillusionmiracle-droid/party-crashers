# Party Crashers

Lagos-first event discovery. Next.js 16 + TypeScript + React. Built from the supplied design bible, product spec, onboarding artwork and canonical sunglasses-pin logo.

## Run and build

`npm ci`, `npm run dev`, `npm run check`, `npm run build`. Next.js exports the client application to `out/`. The Sites manifest serves `out/`. `.env.local` and `.clerk/` are ignored; credentials are stored in the Site environment. Do not commit secrets. The browser receives only the Clerk public key and Supabase URL/publishable key.

## Implemented

- Existing five-screen illustrated onboarding, editable text in `src/onboarding/screens.js`, GSAP choreography and reduced motion.
- Illustrated sign-in reference with editable logo, copy and actions; Clerk development instance and prebuilt secure sign-in modal. Browse first does not require authentication. The Google and email entrance buttons open Clerk's sign-in modal, which presents the configured methods.
- Visual interest tiles, minimum three selection, preferred area, optional campus, completion screen. The image references provide artwork crops only; all control labels and selection states are React.
- Discover with editorial poster/agenda rhythm, search, quick and advanced filters, external registration, event detail, original-source links and organizer page.
- Five Phosphor navigation controls: Discover, Map, emphasized Post, Saved, Profile. Icons are bundled from the installed MIT-licensed `@phosphor-icons/react` package.
- Intentional light/dark/system themes across product surfaces. Outfit is the unlicensed-font fallback for display; Space Grotesk is UI. Artific is not bundled.
- Live map: Mapbox when `NEXT_PUBLIC_MAPBOX_TOKEN` is set; MapLibre with OpenStreetMap tiles otherwise. Event pins, optional browser geolocation, area jumps, free filter and expandable event sheet. Pins are approximate venue/area locations, not navigation directions.
- Saved events grouped by This week, Later and Past; overlap warning only when both events have confirmed times.
- Manual submissions, poster upload, local draft persistence and cloud publishing for authenticated users. Uploaded flyers require manual details; AI extraction is not connected.
- Profiles, account preferences, follows, reports and authenticated outbound registration-click records.

## Backend

Dedicated Supabase project `aqwnluhpnqsrofmvtngp` (Party Crashers) in silkstudios. Supabase quoted $0/month at creation. PostgreSQL + PostGIS, private tables protected by revoked direct grants and RLS. Only published events are anonymously readable. Poster storage bucket is public for event artwork.

`supabase/functions/pc-api/index.ts` checks Clerk session JWT signatures against the explicitly trusted Clerk issuer's JWKS, expiration and authorized party. All private ownership comes from the verified `sub`. Public reads are allowed; every write and private read requires a verified session. The service-role credential stays inside the Edge Function runtime. This is Clerk authentication; Supabase Auth is not used. When replacing the development Clerk instance, update the function's issuer and deploy it with the new frontend key.

`database/party-crashers.sql` and `database/search-and-nearby.sql` record deployed schema changes, full-text indexing and invoker-safe spatial search. The deployed Edge endpoint supports query text and radius search. UI filtering uses the loaded event set (up to 250 records).

Seeded organizer-sourced listings:
- Moonshot: https://moonshot.techcabal.com/ — 28–29 October 2026, National Theatre.
- ART X Lagos: https://www.artxlagos.com/tickets — 5–8 November 2026, Federal Palace.

Times and prices are explicitly unconfirmed. The supplied Moonshot artwork is used. ART X uses editable editorial type treatment, rather than misrepresenting invented photography as organizer artwork.

## Deployment configuration

See `.env.example`. Clerk development keys were provisioned by the official CLI in this session. Claim the Clerk application with `npx clerk auth login` from the linked project when ready; this build does not claim the account or upgrade to production. Development authentication is not a production rollout. Mapbox is optional until a token is provided. No offline service-worker support is claimed.

## Verification

Next.js static build, TypeScript, simulated DOM interaction checks, public API reads, missing/forged-session rejection, PostGIS queries and Supabase advisors. No browser rendering or physical Android performance measurement was available. Live Clerk test-account creation and authenticated publication tests were blocked by automatic approval review; they have not been claimed as passing. No test event was inserted.

The security advisor reports informational `RLS enabled/no policy` for private tables: intentionally no direct client privileges; writes and private reads go through the JWT-verifying Edge API. There were no warning/error findings in that run.

## October 2026 UI revision

System-first appearance with controls in Profile only, a custom larger SVG navigation system, unclipped headline descenders, clean Moonshot art, alpha celebration art, four matching 3D interest illustrations, desktop sign-in/setup layouts, and editable Terms/Privacy routes are included. See [docs/SETUP.md](docs/SETUP.md) for Clerk ownership, Mapbox, Supabase, optional Cloudinary and deployment instructions. Source is maintained at https://github.com/oillusionmiracle-droid/party-crashers.
