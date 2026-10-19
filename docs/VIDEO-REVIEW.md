# Review of the four supplied launch videos

Reviewed the uploaded recordings `1000865921.mp4` (41 seconds), `1000865924.mp4` (33 seconds), `1000865958.mp4` (24 seconds), and `1000865959.mp4` (56 seconds) through timestamped frames spanning their full durations and the visible captions/checklists.

## Applied in this revision

- Supporting text changes from Space Grotesk to Inter; Outfit display typography stays. This explicitly supersedes the provisional Space Grotesk choice in the Design Bible for UI copy.
- Profile uses Clerk's actual full/first/last name. No invented explorer identity. Signed-out visitors see Your profile. Signed-in users have Manage account/Add your name through Clerk's account UI.
- All ten area choices now use genuine Wikimedia Commons photographs, including Ajah, Festac, Mainland and Anywhere in Lagos. Sources, photographers, licence links and WebP conversion disclosures are shown under Photo credits. Images are resized/compressed; district names remain editable code rather than baked screenshot labels.
- Root metadata, canonical URLs, Open Graph/Twitter sharing metadata, robots.txt and sitemap.xml.
- Static, crawlable event list and detail pages for the two existing organizer-sourced listings. Each detail page has its own title, canonical, descriptive body, heading and Event JSON-LD. Unknown ticket prices/opening hours are not invented. Share links for these events use the public pages.
- Vercel response headers: nosniff, frame embedding denial, strict-origin referrers, HTTPS HSTS, permissions restricted to same-origin geolocation with camera/microphone disabled, and CSP object/base/frame-ancestor restrictions. This CSP does not yet restrict script/connect sources; a complete allowlist requires browser testing against Clerk and both map providers.
- Manifest colours match the app, standalone mode remains enabled, and Discover/Saved home-screen shortcuts are defined.
- Automated checks cover account loading, names, completed preferences, explicit editing and ten real photo tiles. No physical-device performance measurement or live Google sign-in is claimed.

## Existing security controls, reviewed in source

Private app API actions verify the Clerk JWT signature, issuer and allowed authorized party, then derive ownership from its subject. They do not trust browser user IDs. Input lengths/date/format/price/URL protocols are validated server-side. Database operations use Supabase client query APIs; user text is rendered as React text. Poster uploads allow only JPEG/PNG/WebP, inspect signatures, cap size at 5 MB and use user-specific paths. Event/report/upload count limits exist. Database schema previously enabled RLS and revoked direct access to private tables. Secret environment files remain excluded from GitHub; browser publishable keys are intentionally public.

These statements describe inspected code, not a penetration-test certification. They do not verify current Clerk dashboard bot/rate-limit settings or live database grants in this revision.

## Work still required before a broader public launch

- Owner tests Google/email sign-in, reload persistence and an authenticated save/publish/upload flow. Production Clerk custom-domain/OAuth configuration remains an owner setup task.
- Configure/verify Clerk bot protection and authentication throttling; passwords and password hashing stay with Clerk, not this app.
- Add durable request-level throttling/abuse controls to the API. Existing daily action limits are not comprehensive rate limiting. CORS origin checks are not authentication or an anti-bot system.
- Complete the security-header allowlist with real browser testing, and test private-table access through read-only security checks/advisors before changes.
- Owner fills the monitored support contact/operator details and reviews legal copy before public access.
- Live organizer collection, moderation, real event poster imports, cancellation refresh, distance feed wiring and a versioned external developer API remain separate work.
- The two static event URLs are generated from the checked-in catalogue at build time. Newly posted cloud events still use in-app hash links until dynamic public event pages or build-time catalogue synchronization is implemented.
- Search Console ownership verification/backlinks require the owner's domain/account; sitemap metadata does not guarantee Google indexing. Review SEO after a stable custom domain is selected.
- Native Android/iOS home-screen widgets from the first recording are not supported merely by a React website. PWA installation and shortcuts are included; native widgets require a native wrapper/app and platform-specific code. No native widget is claimed.

## Photo sources

The full machine-readable mapping lives in `src/product/locationPhotos.ts`. The same credits and licence links appear in the app. Files are under `public/assets/places/`. All are authentic photographs, not newly generated illustrations. The interest illustrations remain decorative artwork.

## Follow-up: new 1000865913.mp4 and icon correction

Reviewed timestamped frames through the new 83-second recording. Its theme is social sharing that lets users express identity/achievement, illustrated by Wordle, Strava and Spotify. Dedicated downloadable event/weekly-plan share cards and native home-screen widgets are **not implemented**. Current features are ordinary event-link sharing, metadata for previews, the installable web manifest and Discover/Saved shortcuts. These are not equivalent to a native widget or a share-card system.

Replaced the custom navigation paths with unmodified downloaded Tabler SVGs (MIT licence included). Reduced mobile symbols from 32px to 24px and their visual containers; touch targets remain at least 44px. Replaced the monochrome icon-library Google symbol with the official full-colour Google asset downloaded from Google's branding page. Neither change configures Google OAuth credentials.

The earlier pending security work remains pending: complete request-level API throttling, verified Clerk bot/auth throttling settings, live account/authorization tests, and full browser-tested CSP. SEO metadata/headers/input checks alone do not finish all video advice.
