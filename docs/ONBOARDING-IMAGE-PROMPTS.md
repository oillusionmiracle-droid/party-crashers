# Party Crashers — responsive onboarding artwork

Generate these five scenes as **4:3, 2048 × 1536** images. They are illustration assets, not screenshots. The app provides the typography, buttons, captions, road-sign labels and progress indicators. Do not generate a complete UI. Use the same character reference and rendering style across all five. The current responsive redesign uses existing illustrations until these replacements are supplied.

## Shared art direction — include with every prompt

Editorial illustration for Party Crashers, a Lagos event-discovery app. Young adult Black Nigerian characters, distinct natural hairstyles, expressive faces, contemporary Lagos streetwear, believable hands and body proportions. Graphic 2D illustration with controlled dimensional shading, clean strong silhouettes and deliberate perspective. Cobalt blue, warm orange, golden yellow, deep violet, small pink accents. Warm Nigerian daylight or purposeful event lighting. Crafted and lively, with uncluttered geometry and a clear focal point. Not photorealistic and not a glossy generic corporate 3D render. Ground every person and object in the scene. Keep all faces, hands and key objects within the central 75% of the canvas, allowing light cropping at the edges. Build a compact 4:3 composition; do not leave a large empty sky area for headlines. No text, letters, numbers, logos, watermarks, UI, buttons, legible phone screens or QR codes. No floating decorative objects, confetti clouds or white rectangular backgrounds. Attach the same approved character/style reference when generating the next image.

## 01 — Discover Lagos

Create a lively editorial scene of four young Black Nigerian friends deciding where to go in Lagos. One friend leans against a parked orange scooter, one opens a folded city map, one holds a phone with the back of the device visible, and one points towards a destination. Keep the scooter parked with both wheels grounded. Use candid interaction, not four people smiling at the viewer. Put a simplified Lagos cable-stayed bridge in the distant background, a low city silhouette, and a broad golden-orange pavement across the lower composition. The friends and scooter fill the central scene. Cobalt clothing, violet overshirt, warm yellow accents; rich blue sky is a small part of the scene. The whole group must read clearly at a small mobile size. Apply the shared art direction. 4:3, 2048 × 1536. No typography.

## 02 — Find something nearby

The same friends at a Lagos street junction, checking directions together. Two main characters occupy the left and middle; a grounded dark-green three-arrow road-sign pole occupies the right. Two arrows point left and one points right. Leave all three sign faces completely blank, wide and flat enough for editable labels to be overlaid later. One friend studies a phone with its back facing the viewer, the other gestures down the street. Orange scooter parked behind them. Suggest Lagos with low shopfront shapes and a distant bridge, without invented landmark labels. Strong perspective and clear spacing between the people and signs. Cool pale-blue environment, cobalt and orange clothing. Apply the shared art direction. 4:3, 2048 × 1536. No text anywhere, including signs.

## 03 — More than parties

A connected editorial composition of six small event scenes arranged as adjoining grounded spaces, with two friends exploring the centre: a technology discussion around a laptop, an art exhibition with blank abstract canvases, a small live music performance, a campus study workshop, a community volunteering table, and a joyful wedding gathering. All people are young or adult Black Nigerians, with modest scene-appropriate clothing. Unite the spaces using a violet floor and architectural arches; do not use floating miniature planets, detached icons or circular bubbles. Clearly distinguish each event with its activity and props, using no text or logos. Make the scene spacious enough to read on mobile, with fewer well-drawn people rather than a dense crowd. Apply the shared art direction. 4:3, 2048 × 1536.

## 04 — The event details

An editorial close-to-medium scene at a Lagos cultural-event entrance at dusk. A young Black Nigerian woman presents her phone to a Black Nigerian attendant holding a small ticket scanner. Show the phone from an oblique angle with a blank illuminated screen; leave the scanner beam and any code for code-based animation, with no invented QR pattern. Both characters' faces and hands are fully visible and believable. The warm doorway behind them shows a small glimpse of an art-and-music venue, a short orderly queue and understated amber entrance lights. Use a deep cobalt evening background, amber-orange doorway and violet accents. The interaction, not the crowd, is the focal point. Apply the shared art direction. 4:3, 2048 × 1536. No text, branding or interface.

## 05 — Put your event on the map

An editorial scene of a young Black Nigerian event host pinning a completely blank warm-orange poster onto a large physical map board, while another friend holds a phone with its back towards the viewer. The map is a simplified schematic composition of Lagos roads and coastline, without labels or fabricated landmark names. The poster occupies a clear rectangular plane; one simple orange location pin is attached to the map nearby. Both people are grounded in the room. Emphasize the natural hand movement of attaching the poster, not a floating poster or giant unrelated mascot. Use a sage-green background, cobalt and violet clothing, golden highlights and carefully controlled soft shadows. Apply the shared art direction. 4:3, 2048 × 1536. No text on the poster or map.

## Export and integration

- Suggested names: `01-discover-scene.webp` through `05-host-scene.webp`.
- Deliver clean scenes without text. Export WebP, preferably under 450 KB per image, after keeping a full-resolution master.
- All text remains in `src/onboarding/screens.js`. Replace the relevant `image` path and add `artLayout: 'scene'`. The new artwork path uses contain-fit to preserve the composition on desktop and mobile; it does not stretch the illustration.
- The existing SVG animation masks correspond to the old portrait assets. They are automatically skipped for `artLayout: 'scene'`; replacement scenes receive a restrained mask/scale reveal. Animate individual signs or posters only after separate layers or accurate new coordinates are available.
- Do not regenerate real Lagos location photographs or event flyers. These prompts apply only to onboarding illustration.

## Responsive design references

- https://pageflows.com/post/desktop-web/onboarding/linear/ — publicly visible desktop flow preview and step breakdown; full flow is paywalled and was not watched.
- https://designerup.co/blog/i-studied-the-ux-ui-of-over-200-onboarding-flows-heres-everything-i-learned/ — onboarding pattern research.

The app keeps Party Crashers' existing branding and masked kinetic typography. Desktop uses a full-width split layout; mobile stacks the same editable text, art panel and controls. It follows system appearance and existing saved appearance preferences.
