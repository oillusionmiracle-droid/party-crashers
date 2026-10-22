# Party Crashers launch motion v2

## Direction

This is a code-driven launch-film package, not a stack of prerecorded MP4 clips.

The authoring model follows the same pattern used by `nexu-io/motion-anything` and the current MotionVideo ecosystem:

1. Storyboard beats first.
2. Keep the film as editable scene data + code.
3. Treat real product UI/screens as composited motion layers.
4. Animate type, shapes, screenshots, masks, camera-like transforms and transitions in code.
5. Keep the timeline seekable/frame-deterministic.
6. Render MP4 only at the end (HyperFrames/Chrome/FFmpeg or WebCodecs).

The self-contained preview created during this pass is `Party-Crashers-Launch-V2.html`. Its source composition is represented here by `film-spec.json` and `scene-render.js`.

## Launch story

**Question:** “What’s the plan?”

**Answer:** “Lagos has plans. Find the ones that are yours.”

The 30-second cut is:

- 0.0–3.2 — **WHAT’S THE PLAN?** The familiar Lagos group-chat question.
- 3.2–6.0 — **LAGOS HAS PLANS.** Tech, music, art, campus, business and parties cycle as one visual system.
- 6.0–11.0 — **YOUR KIND OF PLAN.** Real Discover/Search UI shows personalized discovery, quick filters and search.
- 11.0–15.2 — **AROUND YOU.** Real map UI, optional nearby discovery and distance choices.
- 15.2–20.5 — **CHECK IT BEFORE YOU GO.** Real event details, date/time/venue/price, shortlist action and external organizer registration.
- 20.5–24.4 — **GOT AN EVENT? PUT IT ON.** Free posting; start with a flyer or create manually. OCR only helps populate the draft and does not auto-publish.
- 24.4–30.0 — **Lagos has plans. Find the ones that are yours.** Product lockup + CTA.

## Accuracy guardrails

- Browsing does not require an account.
- Personalization means interests + preferred Lagos area + optional campus; do not imply a personality-reading AI assistant.
- Precise location is only requested when the user chooses nearby discovery. Preferred-area browsing works without it.
- Map pins may be approximate.
- Registration happens on the organizer/ticketing website.
- Flyer upload uses OCR to help fill a draft. The user reviews and confirms it.
- Community-submitted links go through review/import and are not automatically published.
- Browser event alerts are optional and depend on support, permission and service availability.
- Do not imply universal social scraping, private-event access, discounts, guaranteed attendance or untested account flows.

## Motion grammar

Use the motion-anything restraint rules: one dominant attention move per beat, no more than three simultaneous entrances, 40–80ms stagger, transform/opacity first, and one ambient loop maximum. The cut uses orange wipes, clipped UI morphs, kinetic word/character reveals, screenshot cards, subtle depth and spatial continuity instead of generic fade-up transitions.

## Assets

The working capture pack contains 108 Party Crashers screenshots across mobile/desktop and light/dark. The v2 film deliberately uses only a small set of real screens so viewers can understand each action:

- `07-discover.webp`
- `14-search-results.webp`
- `08-map.webp`
- `16-event-details-viewport.webp`
- `09-post-event.webp`
- event artwork + canonical Party Crashers logo

The screenshots are source material, not the authoring format. They are composed as motion layers inside the scene code.

## Rendering

The source should remain editable HTML/canvas + JSON. For a high-fidelity final render, expose a deterministic seek hook and render with HyperFrames/real Chrome, then mux through FFmpeg. MP4 is the delivery output, not the motion source.
