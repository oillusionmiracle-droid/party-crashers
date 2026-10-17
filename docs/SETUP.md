# Party Crashers: ownership, integrations and deployment

Source: https://github.com/oillusionmiracle-droid/party-crashers (private).

## Local setup

Use Node 22+. Run `npm ci`, copy `.env.example` to `.env.local`, add the public configuration below, then `npm run dev`. Run `npm run check` and `npm run build` before deploying. This Next.js app exports static pages to `out/`. The API is the Supabase Edge Function in `supabase/functions/pc-api/index.ts`; it is not a Next.js server route.

Never commit `.env.local`, `.clerk/`, secret API keys, service-role keys or downloaded credentials. The environment example contains names only. `NEXT_PUBLIC_*` values are shipped to browsers and must be safe to expose.

## What is connected now

- Clerk development authentication is wired through `src/product/Auth.tsx`.
- A dedicated Party Crashers Supabase project stores events, profiles, saved plans, follows, reports and uploaded posters. Publishing uses authenticated Clerk sessions verified at the API.
- The map uses MapLibre/OpenStreetMap-based tiles without a Mapbox token, and switches to Mapbox when `NEXT_PUBLIC_MAPBOX_TOKEN` is supplied.
- Poster uploads currently use Supabase Storage. Cloudinary is optional and is **not implemented or connected**.
- Real user sign-in/publish flows still need an owner-run end-to-end check. Automated checks do not establish that Google OAuth or email delivery work in your account.

## 1. Clerk: claim the app and enable authentication

In the project checkout, run `npx clerk auth login` and follow the official Clerk CLI's account/app claim flow for the existing accountless development application. Its local claim metadata is intentionally excluded from GitHub; if you clone elsewhere, use the original checkout or choose/create your own application in the Clerk dashboard.

In Clerk, enable Google and your preferred email sign-in method, then configure the production application and allowed application domain. This client uses Clerk's hosted/modal sign-in rather than a hard-coded OAuth client secret. If Clerk requests Google credentials for production, create them in Google Cloud and paste them into Clerk's Google connection settings, never into this React app.

Copy the **publishable key** to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. The development app currently uses a `pk_test_` key. For production use the matching production publishable key. A secret key belongs only in a protected server environment; this static frontend does not need it to render sign-in.

Important: changing Clerk applications also requires changing `ISSUER` in `supabase/functions/pc-api/index.ts` to that application's exact Frontend API URL and redeploying `pc-api`. The verifier fetches the issuer's `/.well-known/jwks.json` and checks the signature, issuer, subject and allowed origin. Do not just replace the browser key and leave the old issuer. When moving hosting, update `ORIGIN`/`TRUSTED` to the exact new origin, not a wildcard.

Official references:
- https://clerk.com/docs/nextjs/getting-started/quickstart#configure-your-clerk-api-keys
- https://clerk.com/docs/guides/development/deployment/production

## 2. Mapbox token

Create a public access token in your Mapbox account. Give it only the public scopes required to display maps and restrict its allowed URLs to your real app domains; create a separate development token for localhost if needed. Put it in:

```dotenv
NEXT_PUBLIC_MAPBOX_TOKEN=your_public_mapbox_token
```

Add the same value to the build environment of your hosting provider and rebuild. `src/product/MapView.tsx` detects it automatically. A public map token is expected to appear in browser requests; never substitute a Mapbox secret token. Without a token, the existing MapLibre map continues to work.

Reference: https://docs.mapbox.com/help/dive-deeper/access-tokens/

## 3. Supabase backend

Add the public URL and publishable key to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never expose `SUPABASE_SERVICE_ROLE_KEY`. The Edge Function derives ownership from the verified Clerk user; browser-supplied user IDs do not grant access. Keep the table grants/RLS and schema in the provided migrations. The function handles uploads in the `pc-posters` bucket with type/size checks and per-user paths.

For a new Supabase project, apply the SQL from `database/` in order, create the required bucket/policies, set server-only environment secrets, and deploy the provided Edge Function. Review these files rather than applying migrations to an unrelated existing application.

## 4. Cloudinary, if you prefer it for poster uploads

You do not need Cloudinary for the current implementation. Supabase already hosts posters. To switch providers, add a signed upload action to `pc-api`, and update the upload function in `src/product/services.ts`; merely adding credentials does not change the app's upload provider.

Use server-only `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in Supabase Edge Function secrets. After authenticating the Clerk user, validate the requested file, generate a short-lived Cloudinary signature server-side and upload with a scoped folder and preset. Return the resulting `secure_url` and persist it as the event poster. Never put the API secret in any `NEXT_PUBLIC_*` variable. Keep the current 5 MB JPEG/PNG/WebP limit, reject other formats, use unique per-user public IDs and define deletion behavior.

A restricted unsigned preset is an alternative for direct browser uploads, but anyone who learns it can submit uploads within those restrictions. Signed uploads are the recommended path for authenticated event publishing.

References:
- https://cloudinary.com/documentation/upload_images
- https://cloudinary.com/documentation/authentication_signatures
- https://cloudinary.com/documentation/upload_presets

## 5. Hosting and public launch

In Sites, set public build variables in the project's environment settings and rebuild/redeploy. The existing `.openai/hosting.json` remains tied to the current Site. For Vercel or another static-capable host, import this GitHub repository, use `npm run build`, and output `out/`. Public variables must exist at build time. Add the deployed origin to Clerk and the backend's explicit allowlist. GitHub updates do not automatically update the existing Sites deployment; publish a new version from the matching source commit.

Set `NEXT_PUBLIC_SUPPORT_EMAIL` to a monitored support address before public launch. Review `/terms/` and `/privacy/` with the real operator identity, contact, provider choices, retention schedule and legal requirements; the included copy reflects the current private preview, not a legal review. Keep Cloudinary out of the policy until it is connected.

## Visual system

Mobile is the primary composition. Desktop has a persistent sidebar, wider event cards, a two-column setup flow, and a split sign-in view. Appearance initially follows the operating system; explicit choices live only under Profile > Appearance. Five introductory screens remain data-driven and all text is editable. Navigation symbols are custom SVG components in `src/product/NavIcon.tsx`; new 3D interest assets are in `public/assets/interests/`. The celebration WebP has an alpha channel and no baked text.

## Editing workflow

Edit this repository, run checks/build, commit and push. Configure any future CI deploy deliberately for the selected host; no deploy workflow is installed by this change. `.openai/hosting.json` supports the current Sites workflow. The source, assets and legal pages are in GitHub; generated builds, obsolete exported `dist/`, private credentials and runtime checks are excluded.
