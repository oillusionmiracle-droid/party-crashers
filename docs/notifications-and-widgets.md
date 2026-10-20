# Event notifications and Android widgets

## Browser push

Profile → Enable notifications is the only browser permission request entry point. Sign-in and at least one interest are required. Enabling stores this device's push subscription, explicit consent and selected coarse area/interests behind the authenticated API. Browser permission by itself does not mean the server subscription is active. Profile offers an own-device test and unsubscribe. Signing out attempts to remove the subscription.

Supabase `pc-push` initializes VAPID keys once. The private key is stored in Vault; public clients receive only the public key. Three private RLS tables store configuration, subscriptions and queued deliveries. Authenticated endpoints enforce account ownership, HTTPS push-provider allowlists, encryption-key shape, consent and per-account rate/device limits.

A database trigger queues an event only when it becomes publicly published. Existing catalogue events and later edits do not create alerts. The minute dispatcher rechecks current subscription, current event status/end date, interests and selected area before delivery. It uses encrypted Web Push, bounded retries and event-specific notification tags; permanent endpoint expiry removes the subscription. Delivery logs are pruned after 30 days. Push provider acceptance is not proof a user saw an alert: browser, battery, network and OS settings control actual display.

An event must first be discovered and published before it can generate an alert. The existing six-hour web discovery schedule remains unchanged to avoid silently increasing paid search usage. This is not an instant scan of social-media platforms.

`public/sw.js` handles push and same-origin notification navigation only. It does not cache authenticated pages or API responses. Service-worker HTTP headers prevent stale worker caching. Notification permission is never requested on mount.

Verification: `node tests/push-regression.cjs`, `node tests/notification-consent.cjs`, `npm run test:auth`, `npm run check`, `npm run build`. A real browser opt-in plus Profile → Send a test notification remains the device delivery check; do not fabricate a real subscription or enable notifications on another person's behalf.

## Android home-screen widget

The native companion is under `android-widget/`; its README documents pinned build tooling. The APK fetches the public events endpoint and filters by the widget's own local coarse area and interests. It needs neither account credentials nor GPS. Profile's setup link pre-fills area/interests for confirmation in Android. Each instance can have different preferences. Resizing adjusts visible rows. The widget honours system light/dark colours, uses the existing app icon and opens the web event detail on tap.

Android JobScheduler controls periodic refresh (30-minute request, potentially delayed); the manual Refresh button schedules an earlier request. The widget shows cached plans and offline status when a request fails. Browser notification delivery and native widget refresh are independent.

The Android workflow tests, lints and assembles a development APK. Preview APKs are not Play Store production releases. Production needs stable release signing, store distribution and device/launcher QA. Do not claim on-device widget validation from a successful compile alone.
