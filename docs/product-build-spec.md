# Party Crashers — Product Build Specification

## 0. Purpose of this document

This document is the source of truth for building **Party Crashers**, a Lagos-first event discovery web app.

The app should help people quickly discover what is happening around them, understand the details, save events, register externally, and post their own events for free.

It should support a broad event universe, including:

- parties
- tech meetups
- startup events
- business events
- career events
- campus events
- concerts
- church services
- weddings
- art and design events
- food events
- sports events
- community gatherings
- workshops
- conferences
- hangouts
- online/hybrid events

The MVP should focus on Lagos.

Do not treat this as a nightlife-only app.

Do not treat this as a ticketing platform.

Party Crashers is primarily a **discovery layer** with strong location awareness, external registration links, organizer submissions, and later automated aggregation.

---

# 1. Product positioning

## Core statement

**Party Crashers helps people find events worth showing up for.**

## Product promise

Open the app, tell it what you like, and immediately see relevant things happening around Lagos.

## Key differentiation

Party Crashers combines:

- curated event discovery
- nearby map discovery
- campus-aware recommendations
- external registration links
- community-submitted events
- organizer profiles
- saved events
- later AI-assisted event extraction from URLs and flyers

## Product tone

The app should feel:

- energetic
- youthful
- modern
- urban
- useful
- editorial
- playful without being childish
- culturally grounded without using clichés
- polished enough for business and tech events
- fun enough for parties and campus events

---

# 2. Design direction

## 2.1 Visual principles

The product should not look like generic AI-generated SaaS UI.

Avoid:

- random floating 3D blobs
- overused purple-blue gradients
- glassmorphism on every card
- oversized rounded rectangles everywhere
- repeated fade-up animation on every section
- generic stock illustrations
- fake dashboard metrics
- nightclub-only visual language
- over-decoration

Use:

- bold editorial typography
- strong event posters
- high-quality photography
- clear spacing
- strong hierarchy
- restrained use of liquid-glass controls
- GSAP kinetic typography
- location/map visuals
- varied card composition
- strong dark mode
- strong mobile-first layouts

## 2.2 Typography

Primary display direction:

- Artific or a similarly expressive display face if licensing is unavailable

UI font:

- Space Grotesk

Use display typography for:

- onboarding
- page transitions
- location names
- large headings
- campaign moments

Use Space Grotesk for:

- metadata
- form labels
- buttons
- filters
- event details
- map labels
- body copy

## 2.3 Color

The onboarding art uses:

- sky blue
- deep yellow
- orange
- white
- dark navy/black
- green road-sign accents

The main app should support dark mode as a first-class experience.

Dark mode should use:

- near-black background
- warm white text
- orange accent
- subtle neutral borders
- event imagery as the main source of color

Use category colors carefully in:

- tags
- map pins
- badges
- small highlights

Avoid coloring the whole interface per category.

## 2.4 Motion

Use GSAP for branded motion.

Preferred techniques:

- SplitText line/word reveals
- masked text reveals
- horizontal page transitions
- subtle parallax
- route/path drawing
- poster-to-detail transitions
- text swaps
- restrained scale/opacity

Do not use:

- heavy bouncing
- random floating
- constant looping motion
- excessive springs
- decorative motion with no purpose

Motion must respect `prefers-reduced-motion`.

---

# 3. Onboarding

The app starts with a 5-screen illustrated onboarding sequence.

All text must remain editable in React.

The artwork should be treated as background/reference art only.

Do not bake the actual production copy into the background images.

## Screen 1

Headline:

**Find events happening around you**

Visual:

- 2D illustrated Black characters
- friends in motion
- scooter
- map
- phone
- action lines
- Lagos bridge far in the background
- sky blue upper area
- deep yellow/orange lower area
- small Mainland / Island sign

CTA:

**Next**

Secondary:

**Skip**

## Screen 2

Headline:

**See what’s happening near you**

Supporting copy:

**Find events around your area and know where to go next.**

Visual:

- 3 Black characters
- one holding phone with the back of the phone visible
- one pointing
- one on orange scooter
- green Lagos-style road signs
- labels:
  - Lekki ←
  - Yaba ←
  - Apapa →
- simple sky background
- restrained environment
- no clutter

CTA:

**Next**

Secondary:

**Skip**

## Screen 3

Headline:

**More than just parties**

Supporting copy:

**Tech meetups, weddings, church services, business events, campus events, hangouts and more.**

Visual:

- central group looking at phone
- event-world collage around them
- tech
- wedding
- church
- business
- music/social
- campus/community
- same illustration language

CTA:

**Next**

Secondary:

**Skip**

## Screen 4

Headline:

**Go straight to the event**

Supporting copy:

**See the time, venue, price and registration link — then jump straight in.**

Visual:

- event entrance
- phone with event details
- QR/ticket
- check-in or scan interaction
- nighttime event lighting
- still in the same 2D editorial style

CTA:

**Next**

Secondary:

**Skip**

## Screen 5

Headline:

**Put your event on the map**

Supporting copy:

**Post your own event for free and help people discover what you’re hosting.**

Visual:

- sky blue background
- fewer characters
- organizer pinning or posting a flyer to a map/board
- second person holding a phone with the back visible
- event pin/map idea
- same 2D illustration family

CTA:

**Get started**

Secondary:

**Browse first**

---

# 4. Auth and first-run setup

Authentication must use **Clerk**, not Supabase Auth.

## 4.1 Auth responsibilities

Clerk owns:

- authentication
- sessions
- Google sign-in
- email sign-in
- auth security
- profile photo
- email
- basic account identity

Supabase/Postgres owns:

- Party Crashers profile data
- interests
- campus
- area
- saved events
- organizer state
- events created
- follows
- history
- preferences

## 4.2 Sign-in screen

Headline:

**Save the ones you don’t want to miss**

Support:

**Sign in to save events, follow organizers and post your own.**

Actions:

- Continue with Google
- Continue with email
- Browse first

Do not force sign-in before browsing.

Anonymous users should still be able to:

- browse events
- search
- view map
- open event detail
- register externally

Authentication should be required for:

- save
- post event
- follow organizer
- organizer dashboard
- profile sync

---

# 5. Preference onboarding after auth

## 5.1 Interests

Headline:

**What are you into?**

Support:

**Pick a few to get better recommendations.**

Recommended categories:

- Tech
- Startups
- Business
- Career
- Design
- Music
- Parties
- Gaming
- Fashion
- Art
- Sports
- Faith
- Education
- Food
- Campus
- Community

Allow multiple selection.

Require at least 3 before continuing.

Use large visual tiles, not generic pills only.

## 5.2 Area

Headline:

**Where should we look first?**

Support:

**Choose your preferred area.**

Suggested areas:

- Yaba
- Ikeja
- Surulere
- VI
- Lekki
- Ajah
- Ojo
- Festac
- Mainland
- Anywhere in Lagos

Do not ask for precise GPS permission yet.

Optional button later:

**Use my location**

## 5.3 Campus

Headline:

**Are you on a campus?**

Options:

- UNILAG
- LASU
- YABATECH
- LASUSTECH
- Pan-Atlantic
- Other
- None

Campus is optional.

---

# 6. Main navigation

Use five primary navigation items:

- Discover
- Map
- Post
- Saved
- Profile

`Post` should be visually emphasized in the center.

Dark mode must work across all tabs.

---

# 7. Discover

## 7.1 Purpose

Discover is the main personalized event feed.

It should feel more like an editorial city guide than a directory.

## 7.2 Header

Suggested structure:

- current location scope: Lagos
- greeting optional
- search icon
- filter icon

Possible headline:

**What are you crashing today?**

## 7.3 Search bar

Placeholder examples:

- Search events, places or interests
- Tech in Yaba
- Free events this weekend
- Events near me

## 7.4 Filter chips

Suggested:

- For You
- Today
- Tonight
- Weekend
- Free
- Nearby
- Campus
- Tech
- Parties

## 7.5 Feed layout

Do not use one identical card repeatedly.

Mix:

- large feature poster card
- compact agenda rows
- two-up cards
- neighborhood sections
- campus section
- map preview
- editor picks
- deadline cards
- free-event highlights

## 7.6 Event card data

Each event card can show:

- image/poster
- title
- category
- date
- time
- location
- price
- save button
- optional “interested” count
- optional verified badge
- optional urgency/deadline

Primary action:

**View**

Event details page contains the main external registration CTA.

---

# 8. Map

## 8.1 Purpose

Show events spatially around Lagos.

## 8.2 Map behavior

Use Mapbox.

Features:

- event pins
- category-aware pin accents
- clustering
- selected pin state
- draggable bottom sheet
- visible event preview
- map filters

Suggested top filters:

- Tonight
- Weekend
- Free
- Campus

## 8.3 Location behavior

Do not require GPS immediately.

Support:

- browsing Lagos manually
- preferred area
- search by area
- optional precise location later

When location access is allowed, support:

- events within X km
- nearby first
- distance sorting

Use PostGIS for spatial queries.

---

# 9. Event detail

## 9.1 Layout

Top:

- large poster/image

Then:

- title
- tags
- date and time
- venue
- address
- price
- organizer
- verified/community-posted badge

Main CTA:

**Register**
or
**Get tickets**

Registration remains external in V1.

## 9.2 Sections

- About
- Who should attend
- Venue
- Map
- Organizer
- Similar events

Optional:

- registration deadline
- save
- share
- report

---

# 10. Post event

## 10.1 Entry

Two choices:

### Upload a flyer

Label:

**Upload a flyer**

Support:

**We’ll fill the details for you.**

This feature can be manual in V1 and AI-assisted later.

### Create manually

Manual fields:

- event name
- category
- tags
- start date/time
- end date/time
- venue name
- address
- area
- price type
- min price
- max price
- registration link
- flyer/poster
- description
- organizer
- registration deadline
- format: physical / online / hybrid

## 10.2 Publish success

After publishing:

**You’re on the map.**

Then:

- event preview
- copy link
- share to WhatsApp
- share to Instagram
- share to X

---

# 11. Saved

Saved should not be a generic gallery.

Organize by:

- upcoming
- this week
- later
- past

Detect schedule conflicts if possible.

Example:

**You’re trying to be in 3 places at once 😭**

---

# 12. Profile

## 12.1 User profile

Show:

- display name
- avatar
- area
- campus
- interests
- saved
- interested
- my events

## 12.2 Organizer profile

If user has posted events:

Show:

- organizer status
- events posted
- views
- registration clicks
- followers
- profile verification status

Later monetization can use this area.

---

# 13. Data architecture

Use PostgreSQL through Supabase.

Do not use Supabase Auth.

## 13.1 Core event schema

```ts
Event {
  id
  title
  description

  category
  tags[]

  startDate
  endDate
  timezone

  format: "physical" | "online" | "hybrid"

  venueName
  address
  latitude
  longitude

  city
  country

  priceType: "free" | "paid"
  minPrice
  maxPrice
  currency

  registrationUrl
  sourceUrl
  sourceName

  organizerId
  imageUrl

  registrationDeadline

  confidenceScore
  popularityScore

  firstDiscoveredAt
  lastVerifiedAt
}
```

## 13.2 Tables

Recommended:

- profiles
- events
- organizers
- venues
- campuses
- categories
- event_categories
- saved_events
- followed_organizers
- event_reports
- event_sources
- profile_interests
- profile_areas
- event_attendance_interest

## 13.3 Profile table

```ts
profiles {
  id
  clerk_user_id
  username
  display_name
  avatar_url
  bio
  campus_id
  preferred_area
  is_organizer
  is_verified
  created_at
  updated_at
}
```

Clerk user ID is the auth linkage.

---

# 14. Event sources and normalization

Every event should be normalized into the same canonical event schema.

Potential future source adapters:

- Ticketmaster
- Meetup
- organizer websites
- generic event webpages
- flyer uploads
- user submissions
- organizer submissions
- Luma organizer integrations
- Eventbrite where appropriate

Do not build one giant scraper.

Build adapters.

Pipeline:

```text
Source
  ↓
Collector / Submission
  ↓
Raw event
  ↓
Extraction / parsing
  ↓
Normalization
  ↓
Deduplication
  ↓
Verification
  ↓
Canonical event
  ↓
Discover / Map / Search
```

---

# 15. Generic webpage extraction

Future feature.

If a public event page exists:

1. fetch page
2. inspect schema.org/Event JSON-LD
3. extract structured fields
4. if incomplete, use an LLM for structured extraction
5. store source URL
6. normalize to canonical event

Always respect site terms, robots directives, and applicable content/data rights.

---

# 16. Flyer extraction

Future feature.

Flow:

1. user uploads flyer
2. vision model extracts:
   - title
   - date
   - time
   - venue
   - price
   - registration link
   - organizer
   - category
3. pre-fill form
4. user confirms
5. publish

Do not auto-publish without confirmation.

---

# 17. Deduplication

Same event can appear from multiple sources.

Use weighted matching.

Example:

```text
same/similar title      30%
same date               25%
same venue/location     20%
same organizer          10%
similar description     10%
same registration URL    5%
```

Above a threshold, merge to one canonical event.

Later use embeddings for semantic title/description similarity.

Maintain `event_sources` to preserve provenance.

---

# 18. Verification

Each event can have a confidence score.

Possible scoring:

```text
Official organizer      +30
Registration works      +20
Venue confirmed         +15
Date clearly stated     +15
Multiple sources        +10
Recently verified       +10
```

UI states:

- Verified details
- Community posted
- Details may have changed
- Registration closed
- Unable to verify

Background jobs should periodically revisit source pages.

---

# 19. Search

## 19.1 V1

Use Postgres search and filters.

Search by:

- title
- tags
- organizer
- venue
- area
- category

## 19.2 AI search later

User query:

**Find free startup and AI events happening in Lagos next week**

AI converts to structured filters:

```json
{
  "city": "Lagos",
  "categories": ["AI", "Startup", "Technology"],
  "price": "free",
  "date_range": "next_week"
}
```

Then query the database.

Do not make the LLM directly search all events every time.

---

# 20. Ranking

Future personalized Crash Score:

```text
35% personal relevance
20% popularity
15% freshness
15% location
10% deadline urgency
 5% source trust
```

Personalization inputs:

- interests
- campus
- preferred area
- saves
- clicks
- follows
- registrations
- event categories viewed

---

# 21. Registration

V1 registration remains external.

Possible destinations:

- organizer website
- Luma
- Eventbrite
- Meetup
- Google Forms
- Ticketmaster
- other ticketing provider

Track outbound registration clicks.

Do not build native ticketing in V1.

---

# 22. Organizer growth loop

Core loop:

```text
Party Crashers discovers event
      ↓
users discover event
      ↓
organizer receives traffic
      ↓
organizer claims profile
      ↓
organizer submits more events
      ↓
Party Crashers data improves
      ↓
more users
```

Potential future monetization:

- promoted events
- sponsored placements
- analytics
- verified organizer profiles
- enhanced organizer pages
- premium event tools

---

# 23. Tech stack

## Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS
- GSAP

## Auth

- Clerk

## Database

- Supabase Postgres

## Geospatial

- PostGIS

## Storage

- Supabase Storage

## Maps

- Mapbox

## Background jobs

- Trigger.dev or Inngest

## AI later

- LLM for URL extraction/classification
- vision model for flyer extraction
- embeddings for dedupe/recommendations

## Hosting

- Vercel or Cloudflare

---

# 24. Dark mode

Dark mode is required.

Main product surfaces should be designed for both:

- dark mode
- light mode

Dark mode should feel intentional, not inverted.

Recommended dark tokens:

```css
--bg: #090B0D;
--surface: #111418;
--surface-2: #171B20;
--border: #252A31;
--text: #F6F7F8;
--muted: #9298A1;
--accent: #FF6A1A;
```

Maintain image contrast and readable metadata.

---

# 25. Responsive behavior

Mobile-first.

Primary target:

- Android phone
- iPhone

Desktop should adapt cleanly but should not dictate the mobile layout.

Important:

- lower-end Android performance matters
- avoid heavy shaders
- avoid excessive blur
- lazy-load images
- compress posters
- use responsive image sizes
- keep GSAP timelines small

---

# 26. MVP scope

Build first:

1. onboarding
2. Clerk auth
3. interests
4. area
5. campus
6. Discover
7. search
8. filters
9. map
10. event detail
11. save event
12. post event
13. external registration
14. profile
15. organizer basics
16. dark mode

Do not block launch on:

- AI search
- flyer extraction
- scraping
- dedupe engine
- verification engine
- native ticketing
- social graph
- calendar sync
- advanced organizer analytics

---

# 27. Suggested implementation order

## Phase 1 — foundation

- project setup
- design tokens
- dark/light theme
- Clerk
- Supabase client
- database schema
- storage

## Phase 2 — onboarding

- 5 onboarding screens
- GSAP transitions
- editable copy config
- Skip / Get started

## Phase 3 — personalization

- interests
- area
- campus
- profile creation

## Phase 4 — events

- event CRUD
- Discover
- event cards
- event detail
- save
- external register

## Phase 5 — map

- Mapbox
- pins
- selected event
- bottom sheet
- geospatial queries

## Phase 6 — posting

- manual event creation
- poster upload
- organizer association
- publish success

## Phase 7 — polish

- search
- filters
- dark mode
- performance
- accessibility
- empty states
- mobile testing

---

# 28. Product copy style

Copy should be short, casual, useful.

Examples:

- What are you crashing today?
- Worth leaving home for
- Happening near you
- Free tonight
- You’re on the map.
- You’re trying to be in 3 places at once 😭
- Browse first
- Save this one
- Register
- Details may have changed

Avoid corporate copy.

Avoid overusing slang.

---

# 29. Important build rules for GPT Work

1. Do not replace Clerk with Supabase Auth.
2. Do not build native ticketing in V1.
3. Do not force login before browsing.
4. Do not request GPS permission during first onboarding.
5. Do not make every component glassmorphic.
6. Do not use one repeated event-card layout everywhere.
7. Do not generate random decorative 3D assets.
8. Keep all text editable.
9. Keep onboarding copy in a configuration object.
10. Use real React components, not rasterized UI.
11. Use semantic HTML.
12. Respect reduced motion.
13. Build mobile-first.
14. Keep Lagos as the initial city.
15. Keep external register URLs visible and track clicks.
16. Preserve dark mode throughout.
17. Keep the visual language editorial and energetic.
18. Use actual event content and posters as primary visual material.
19. Keep the app fast.
20. Prefer clear useful interaction over visual gimmicks.

---

# 30. Definition of a good first release

The MVP is successful if a new user can:

1. open Party Crashers
2. understand what it does in under 30 seconds
3. browse without an account
4. sign in with Clerk
5. choose interests, area, and campus
6. discover relevant Lagos events
7. search and filter
8. explore nearby events on a map
9. open an event
10. save it
11. register externally
12. post an event
13. see that event on Party Crashers
14. use the app comfortably in dark mode

That is the first complete product.
