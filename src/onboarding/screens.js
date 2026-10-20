/** Edit every piece of onboarding copy here. One headlinePart = one masked line.
 * accentWord is semantic metadata; each part controls its own accent colour.
 * Image coordinates, cutouts and choreography are independent of the copy.
 */
export const onboardingScreens = [
  {
    id: 'discover', label: 'Discover', caption: 'Events across Lagos', artColor: '#ffc12e', artViewBox:'0 360 941 1080', image: '/assets/onboarding/01-discover.webp',
    headlineParts: [{ text: 'Find events', accent: true }, { text: 'happening' }, { text: 'around you' }],
    body: 'Find something worth showing up for, from your neighbourhood to the other side of Lagos.', accentWord: 'Find events', buttonLabel: 'Next',
    secondaryAction: { label: 'Skip', action: 'browse' },
    alignment: 'center', choreography: 'discover',
    imageAlt: 'Four friends ride an orange scooter through Lagos beneath a blue sky.',
  },
  {
    id: 'nearby', label: 'Explore nearby', caption: 'Your area. Your next plan.', artColor: '#b7d8ef', image: '/assets/onboarding/02-nearby.webp',
    headlineParts: [{ text: 'See what’s' }, { text: 'happening', accent: true }, { text: 'near you' }],
    body: 'Find events around your area and know where to go next.',
    accentWord: 'happening', buttonLabel: 'Next', secondaryAction: { label: 'Skip', action: 'browse' },
    alignment: 'left', choreography: 'nearby', roadSignLabels: ['Lekki', 'Yaba', 'Apapa'],
    imageAlt: 'Friends use a phone beside an orange motorcycle and a Lagos direction signpost.',
  },
  {
    id: 'more', label: 'Your interests', caption: 'Music, art, tech, community & more', artColor: '#c5b4ee', image: '/assets/onboarding/03-more.webp',
    headlineParts: [{ text: 'More than' }, { text: 'just parties', accent: true }],
    body: 'Tech meetups, weddings, church services, business events, campus events, hangouts and more.',
    accentWord: 'just parties', buttonLabel: 'Next', secondaryAction: { label: 'Skip', action: 'browse' },
    alignment: 'center', choreography: 'worlds',
    imageAlt: 'Friends surrounded by tech meetups, a wedding, church, music, business and campus gatherings.',
  },
  {
    id: 'entry', label: 'The details', caption: 'Time, place, price. All together.', artColor: '#efb58c', image: '/assets/onboarding/04-entry.webp',
    headlineParts: [{ text: 'Go straight' }, { text: 'to the event', accent: true }],
    body: 'See the time, venue, price and registration link — then jump straight in.',
    accentWord: 'to the event', buttonLabel: 'Next', secondaryAction: { label: 'Skip', action: 'browse' },
    alignment: 'left', choreography: 'entry',
    imageAlt: 'A guest presents her phone ticket to a scanner at a warmly lit event entrance.',
  },
  {
    id: 'host', label: 'Host something', caption: 'Good plans deserve an audience.', artColor: '#bfd9ac', image: '/assets/onboarding/05-host.webp',
    headlineParts: [{ text: 'Put your event' }, { text: 'on the map', accent: true }],
    body: 'Post your own event for free and help people discover what you’re hosting.',
    accentWord: 'on the map', buttonLabel: 'Get started', secondaryAction: { label: 'Browse first', action: 'browse' },
    alignment: 'left', choreography: 'host', posterTitle: ['SUNSET', 'VIBES'],
    imageAlt: 'A host pins a sunset event poster to a city map while a friend holds a phone.',
  },
];
