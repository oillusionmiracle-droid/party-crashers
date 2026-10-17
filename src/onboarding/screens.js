/** Edit every piece of onboarding copy here. One headlinePart = one masked line.
 * accentWord is semantic metadata; each part controls its own accent colour.
 * Image coordinates, cutouts and choreography are independent of the copy.
 */
export const onboardingScreens = [
  {
    id: 'discover', image: '/assets/onboarding/01-discover.webp',
    headlineParts: [{ text: 'Find events', accent: true }, { text: 'happening' }, { text: 'around you' }],
    body: '', accentWord: 'Find events', buttonLabel: 'Next',
    secondaryAction: { label: 'Skip', action: 'browse' },
    alignment: 'center', choreography: 'discover',
    imageAlt: 'Four friends ride an orange scooter through Lagos beneath a blue sky.',
  },
  {
    id: 'nearby', image: '/assets/onboarding/02-nearby.webp',
    headlineParts: [{ text: 'See what’s' }, { text: 'happening', accent: true }, { text: 'near you' }],
    body: 'Find events around your area and know where to go next.',
    accentWord: 'happening', buttonLabel: 'Next', secondaryAction: { label: 'Skip', action: 'browse' },
    alignment: 'left', choreography: 'nearby', roadSignLabels: ['Lekki', 'Yaba', 'Apapa'],
    imageAlt: 'Friends use a phone beside an orange motorcycle and a Lagos direction signpost.',
  },
  {
    id: 'more', image: '/assets/onboarding/03-more.webp',
    headlineParts: [{ text: 'More than' }, { text: 'just parties', accent: true }],
    body: 'Tech meetups, weddings, church services, business events, campus events, hangouts and more.',
    accentWord: 'just parties', buttonLabel: 'Next', secondaryAction: { label: 'Skip', action: 'browse' },
    alignment: 'center', choreography: 'worlds',
    imageAlt: 'Friends surrounded by tech meetups, a wedding, church, music, business and campus gatherings.',
  },
  {
    id: 'entry', image: '/assets/onboarding/04-entry.webp',
    headlineParts: [{ text: 'Go straight' }, { text: 'to the event', accent: true }],
    body: 'See the time, venue, price and registration link — then jump straight in.',
    accentWord: 'to the event', buttonLabel: 'Next', secondaryAction: { label: 'Skip', action: 'browse' },
    alignment: 'left', choreography: 'entry',
    imageAlt: 'A guest presents her phone ticket to a scanner at a warmly lit event entrance.',
  },
  {
    id: 'host', image: '/assets/onboarding/05-host.webp',
    headlineParts: [{ text: 'Put your event' }, { text: 'on the map', accent: true }],
    body: 'Post your own event for free and help people discover what you’re hosting.',
    accentWord: 'on the map', buttonLabel: 'Get started', secondaryAction: { label: 'Browse first', action: 'browse' },
    alignment: 'left', choreography: 'host', posterTitle: ['SUNSET', 'VIBES'],
    imageAlt: 'A host pins a sunset event poster to a city map while a friend holds a phone.',
  },
];
