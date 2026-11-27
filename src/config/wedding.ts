// ============================================================
//  Pankaj & Muskan — wedding details.
//  Shared content at the top; each side's own days, travel and FAQ in `sides`.
//  Name order, monogram and sign-offs per side: src/config/sides.ts
// ============================================================

const groomResidenceMaps = 'https://maps.app.goo.gl/6UJ8oXXEKtmpPcca9'
const brideResidenceMaps = 'https://maps.app.goo.gl/QDX5FNppwdpBdMwb6'
const mataChowkiMaps =
  'https://www.google.com/maps/search/?api=1&query=Krishnapuri+Darbar%2C+Near+Railway+Station%2C+Narmadapuram+461001'
const resortMaps = 'https://maps.app.goo.gl/bhRWUMtVq6xUDRfB8'

const resortAddress = 'Dhruva Club & Resort, Indore – Bhopal Road, Khajoori Sadak, Bhopal 462030'

const venues = {
  residence: {
    name: "Groom's Residence",
    pinTitle: "Groom's Residence",
    address: 'A 53 D, BDA Colony, Teela Jamalpura, Bhopal 462001',
    shortAddress: 'Teela Jamalpura, Bhopal',
    lat: 23.277375,
    lng: 77.393889,
    mapUrl: groomResidenceMaps,
    appleMapsUrl:
      'https://maps.apple.com/?ll=23.277375,77.393889&q=Residence%20%C2%B7%20BDA%20Colony%2C%20Teela%20Jamalpura',
    googleMapsUrl: groomResidenceMaps,
  },
  brideResidence: {
    name: "Bride's Residence",
    pinTitle: "Bride's Residence",
    address: 'H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001',
    shortAddress: 'Fefartal, Narmadapuram',
    lat: 22.7339524,
    lng: 77.7125525,
    mapUrl: brideResidenceMaps,
    appleMapsUrl:
      'https://maps.apple.com/?ll=22.7339524,77.7125525&q=Pink%20Avenue%20Annex%2C%20Narmadapuram',
    googleMapsUrl: brideResidenceMaps,
  },
  mataChowki: {
    name: 'Krishnapuri Darbar',
    pinTitle: 'Mata Ki Chowki · Krishnapuri Darbar',
    address: 'Krishnapuri Darbar, Near Railway Station, Narmadapuram 461001',
    shortAddress: 'Near Railway Station, Narmadapuram',
    lat: 22.7532,
    lng: 77.7174,
    mapUrl: mataChowkiMaps,
    appleMapsUrl:
      'https://maps.apple.com/?q=Krishnapuri%20Darbar%2C%20Near%20Railway%20Station%2C%20Narmadapuram%20461001',
    googleMapsUrl: mataChowkiMaps,
  },
  resort: {
    name: 'Dhruva Club & Resort',
    pinTitle: 'Dhruva Club & Resort',
    address: 'Indore – Bhopal Road, Khajoori Sadak, Bhopal, Madhya Pradesh 462030',
    shortAddress: 'Khajoori Sadak, Bhopal',
    lat: 23.24713,
    lng: 77.244417,
    mapUrl: resortMaps,
    appleMapsUrl:
      'https://maps.apple.com/?ll=23.24713,77.244417&q=Dhruva%20Resort%2C%20Khajoori%20Sadak',
    googleMapsUrl: resortMaps,
  },
}

/** 22 & 23 January at Dhruva Resort — the same on both sides */
const resortDays = [
  {
    day: 22,
    date: 'Friday, 22 January 2027',
    dateShort: '22 January',
    venueKey: 'resort',
    city: 'Bhopal',
    events: [
      {
        name: 'Haldi & Reception',
        time: '12:00 PM',
        sessions: [
          { label: 'Haldi', time: '12:00 PM' },
          { label: 'Reception', time: '9:00 PM' },
        ],
        blurb:
          'Request your presence for a day of vibrant celebrations—from golden morning hues of Haldi to an evening of music, dinner, and joy.',
      },
    ],
  },
  {
    day: 23,
    date: 'Saturday, 23 January 2027',
    dateShort: '23 January',
    venueKey: 'resort',
    city: 'Bhopal',
    events: [
      {
        name: 'Baraat & Wedding',
        time: '11:00 AM',
        sessions: [
          { label: 'Baraat', time: '11:00 AM' },
          { label: 'Wedding', time: '2:00 PM' },
        ],
        blurb:
          'Request your gracious presence as we dance in celebration with the royal Baraat and witness the couple unite in sacred matrimony.',
      },
    ],
  },
]

const resortCalendar = [
  {
    day: 22,
    title: 'Haldi & Reception',
    start: '20270122T120000',
    end: '20270122T235900',
    location: resortAddress,
    description: 'Haldi 12:00 PM · Reception 9:00 PM',
  },
  {
    day: 23,
    title: 'Baraat & Wedding',
    start: '20270123T110000',
    end: '20270123T200000',
    location: resortAddress,
    description: 'Baraat 11:00 AM · Wedding 2:00 PM',
  },
]

const sharedFaq = {
  wear: {
    q: 'What should I wear?',
    a: 'Traditional Indian attire is encouraged — bright yellows and festive colours for Haldi, elegant ethnic or formal wear for the Reception and the Wedding.',
  },
  kids: {
    q: 'Are kids welcome?',
    a: 'Absolutely — little ones are part of the celebration. For the late-evening reception, an early exit is completely fine.',
  },
  lost: {
    q: 'Who do I call if I’m lost?',
    a: 'Reach out to the family member who invited you. The Travel section has pinned maps for each venue.',
  },
}

export const weddingConfig = {
  date: {
    full: 'Saturday, 23 January 2027',
    weddingDay: '23 January',
    iso: '2027-01-23T14:00:00+05:30',
    foreverLabel: 'days to forever',
  },

  hero: {
    tagline:
      'Together with their families, joyfully invite you to the wedding celebrations',
    closing: 'As we begin our forever',
  },

  secret: {
    title: 'A note just for you',
    message:
      'If you found this — thank you for being part of our story. It began as a friendship and became a bond we cherish. See you at the mandap.',
  },

  credit: {
    line: 'Made with love for our families',
  },

  /** A short note from the couple */
  ours: {
    lines: [
      'This is no ordinary card — we made it just for you.',
      'Your presence will complete our happiness.',
    ],
  },

  story: {
    title: 'Our Story',
    subtitle: 'A story meant to bloom',
    paragraphs: [
      'It all started with “Hey Muskan”. Two numbers exchanged by our parents, one connection made on Jeevansathi, and a story neither of us expected.',
      'We weren’t quite ready for forever, until we started talking and somehow, couldn’t stop. On 1 June 2026 we had our first conversation. On 12 June, Pankaj travelled from Pune to Hyderabad for our first meeting — and that very day, we knew our yes.',
      'On 12 July 2026 we made it official with our Roka. A little unexpected, a little magical, and now, a lifetime to go.',
    ],
    milestones: [
      { year: '1 June 2026', event: 'Our first conversation' },
      { year: '12 June 2026', event: 'First meeting in Hyderabad' },
      { year: '12 July 2026', event: 'Roka ceremony' },
      { year: 'January 2027', event: 'Our wedding' },
    ],
  },

  parents: {
    bride: {
      who: 'Muskan',
      childOf: 'Daughter of',
      names: 'Mrs. Kiran & Mr. Rajesh Raj',
      label: 'Parents of the bride',
    },
    groom: {
      who: 'Pankaj',
      childOf: 'Son of',
      names: 'Mrs. Richa & Mr. Nitesh Lal',
      label: 'Parents of the groom',
    },
  },

  /** Shown on Muskan’s site — the hosts named on the family invite */
  brideFamily: {
    blessing:
      'With the blessings of Mrs Lajwanti Raj & Late Prof. Moolchand Raj, you are invited to the wedding of their granddaughter.',
    blessingPhoto: {
      src: '/gallery/bride-grandparents.webp',
      alt: 'Mrs Lajwanti Raj and Late Prof. Moolchand Raj',
    },
    hostsTitle: 'Awaiting to welcome you',
    hosts: [
      'Mrs. Gyanwanti Raj',
      'Mrs. Zarna & Dr. Dinesh Raj',
      'Mrs. Mukta & Mr. Deepak Raj',
      'Mrs. Simran & Mr. Lokesh Ahuja',
    ],
    awaitingTitle: 'Joyously awaiting',
    awaiting: 'Rutvika, Kanishka, Aayush and Dr Amulya Raj',
    memoryTitle: 'In loving memory',
    memory: 'Late Dr Ghyanshyam Das Raj & Late Dr Kavita Raj',
    workTitle: 'Establishment',
    work: ['Raj Scooters & Auto Parts', 'Raj Traders', 'Kalpnk AI Studio'],
    address: 'H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001',
  },

  /** Shown on Pankaj’s site — the hosts named on the family invite */
  groomFamily: {
    blessing:
      'With the blessings of Mrs Usha Lal & Late Mr. J.P Lal, you are invited to the wedding of their grandson.',
    blessingPhoto: {
      src: '/gallery/groom-grandparents.webp',
      alt: 'Mrs Usha Lal and Late Mr. J.P Lal',
    },
    hostsTitle: 'Awaiting to welcome you',
    hosts: [
      'Mrs. Karishma & Mr. Shubash Lal',
      'Mrs. Varsha & Mr. Pooran Menghwani',
      'Mrs. Muskan & Mr. Ajay Lal',
    ],
    awaitingTitle: 'Joyously awaiting',
    awaiting: 'Garima, Uday, Jay, Tanvi',
    nanihalTitle: "Groom's Nanihal",
    nanihal: 'Jaswani Family',
    memoryTitle: 'In loving memory',
    memory: 'Late Shri. Parasram Chabra',
    workTitle: 'Establishment',
    work: [
      'Paresh Traders',
      'Uday Enterprises',
      'UD Infra Developers Pvt. Ltd',
      'Intra Techno Solutions Pvt. Ltd.',
    ],
    address: 'A 53 D, BDA Colony, Teela Jamalpura, Bhopal 462001',
  },

  dressCode: {
    title: 'Dress code',
    subtitle: 'A little colour for each celebration',
    items: [
      {
        event: 'Haldi',
        wear: 'Bright yellows and festive colours',
      },
      {
        event: 'Reception',
        wear: 'Elegant ethnic or formal wear',
      },
      {
        event: 'Wedding',
        wear: 'Elegant ethnic or formal wear',
      },
    ],
  },

  venues,

  timeline: [
    { time: '11:00 AM', title: 'Baraat', description: 'The royal procession arrives' },
    { time: '2:00 PM', title: 'Wedding', description: 'Sacred matrimony · Shubh Lagn' },
  ],

  distanceNote: 'Distances and drive times are approximate and depend on traffic.',

  sides: {
    groom: {
      dateShort: '21 – 23 January 2027',
      dateRange: '21–23 January 2027',
      place: 'Bhopal',
      eventsSubtitle: 'Three days of rituals and joy in Bhopal · 21–23 January 2027',
      celebrationDays: [
        {
          day: 21,
          date: 'Thursday, 21 January 2027',
          dateShort: '21 January',
          venueKey: 'residence',
          city: 'Bhopal',
          events: [
            {
              name: 'Bairana Sahib',
              time: '10:00 AM',
              blurb:
                'Request your gracious presence as we invoke the divine blessings of Jhulelal Sain to mark the beginning of this auspicious union.',
            },
          ],
        },
        ...resortDays,
      ],
      calendarEvents: [
        {
          day: 21,
          title: 'Bairana Sahib',
          start: '20270121T100000',
          end: '20270121T150000',
          location: 'A 53 D, BDA Colony, Teela Jamalpura, Bhopal 462001',
          description: 'Bairana Sahib 10:00 AM',
        },
        ...resortCalendar,
      ],
      travel: {
        title: 'Travel',
        note: 'All celebrations are in Bhopal — at the residence on 21 January and Dhruva Club & Resort on 22–23 January.',
        departure: null,
        /** Order of pinned maps on the Travel section */
        pinKeys: ['residence', 'resort'] as const,
      },
      faqTip: {
        label: 'Two venues',
        text: '21 January is at the residence in Teela Jamalpura. 22 & 23 January are at Dhruva Club & Resort on the Indore – Bhopal Road, about 21 km (40 min) away — please plan your travel accordingly.',
      },
      faqSubtitle: 'Venues, arrival times, and getting around Bhopal',
      faq: [
        {
          q: 'What time should I arrive?',
          a: 'Please arrive 15–30 minutes early. Bairana Sahib (21 January) starts at 10:00 AM. On 22 January, Haldi is from 12:00 PM and Reception from 9:00 PM. On 23 January, Baraat begins at 11:00 AM, with the Wedding from 2:00 PM.',
        },
        {
          q: 'Where are the celebrations?',
          a: '21 January: Groom’s Residence — A 53 D, BDA Colony, Teela Jamalpura, Bhopal 462001. 22 & 23 January: Dhruva Club & Resort, Indore – Bhopal Road, Khajoori Sadak, Bhopal 462030. Pinned maps are in the Travel section.',
        },
        {
          q: 'How far is the residence from Dhruva Club & Resort?',
          a: 'About 21 km — roughly 35–45 minutes by car depending on city traffic.',
        },
        sharedFaq.wear,
        {
          q: 'Is there parking?',
          a: 'Dhruva Club & Resort has parking for guests. Parking near the residence is limited street parking, so sharing a cab or car is a good idea on 21 January.',
        },
        sharedFaq.kids,
        sharedFaq.lost,
      ],
    },

    bride: {
      dateShort: '20 – 23 January 2027',
      dateRange: '20–23 January 2027',
      place: 'Narmadapuram & Bhopal',
      eventsSubtitle: 'Three days of rituals and joy · Narmadapuram & Bhopal · 20–23 January 2027',
      celebrationDays: [
        {
          day: 20,
          date: 'Wednesday, 20 January 2027',
          dateShort: '20 January',
          venueKey: 'brideResidence',
          city: 'Narmadapuram',
          events: [
            { name: 'Mehndi', time: '2:00 PM' },
            {
              name: 'Mata Ki Chowki',
              time: 'Followed by dinner · 7:30 PM',
              venueKey: 'mataChowki',
            },
          ],
        },
        ...resortDays,
      ],
      calendarEvents: [
        {
          day: 20,
          title: 'Mehndi',
          start: '20270120T140000',
          end: '20270120T180000',
          location: 'H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001',
          description: 'Mehndi 2:00 PM',
        },
        {
          day: 20,
          title: 'Mata Ki Chowki',
          start: '20270120T193000',
          end: '20270120T220000',
          location: 'Krishnapuri Darbar, Near Railway Station, Narmadapuram 461001',
          description: 'Followed by dinner 7:30 PM',
        },
        {
          day: 22,
          title: 'Departure to Dhruva Club & Resort',
          start: '20270122T090000',
          end: '20270122T113000',
          location: 'H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001',
          description:
            'Leave the residence at 9:00 AM for Dhruva Club & Resort, Bhopal (~95 km via Bhopal).',
        },
        ...resortCalendar,
      ],
      travel: {
        title: 'Travel',
        note: '20 January: Mehndi at the residence, Mata Ki Chowki at Krishnapuri Darbar. 22 & 23 January are at Dhruva Club & Resort, Bhopal.',
        departure: {
          label: 'Departure · 22 January, 9:00 AM',
          from: 'Bride’s Residence, Pink Avenue Annex, Narmadapuram',
          to: 'Dhruva Club & Resort, Khajoori Sadak, Bhopal',
          distance: '~95 km · about 2 h 15 min by road',
          route: 'Narmadapuram → Budhni → Obaidullaganj (NH46) → Bhopal → Indore – Bhopal Road → Dhruva Club & Resort',
          text: 'We leave the residence together at 9:00 AM on 22 January so everyone reaches Dhruva Club & Resort in time for Haldi at 12:00 PM.',
        },
        /** Order of pinned maps on the Travel section */
        pinKeys: ['brideResidence', 'mataChowki', 'resort'] as const,
      },
      faqTip: {
        label: 'Departure · 22 January',
        text: 'We leave the residence in Narmadapuram at 9:00 AM on 22 January for Dhruva Club & Resort, Bhopal — about 95 km (2 h 15 min) via Obaidullaganj and Bhopal. Haldi begins at 12:00 PM.',
      },
      faqSubtitle: 'Venues, arrival times, and travelling between Narmadapuram and Bhopal',
      faq: [
        {
          q: 'What time should I arrive?',
          a: 'Please arrive 15–30 minutes early. On 20 January, Mehndi starts at 2:00 PM at the residence, and Mata Ki Chowki is followed by dinner at 7:30 PM at Krishnapuri Darbar. On 22 January, Haldi is from 12:00 PM and Reception from 9:00 PM. On 23 January, Baraat begins at 11:00 AM, with the Wedding from 2:00 PM.',
        },
        {
          q: 'Where are the celebrations?',
          a: '20 January, Mehndi: Bride’s Residence — H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001. 20 January, Mata Ki Chowki: Krishnapuri Darbar, Near Railway Station, Narmadapuram 461001. 22 & 23 January: Dhruva Club & Resort, Indore – Bhopal Road, Khajoori Sadak, Bhopal 462030. Pinned maps are in the Travel section.',
        },
        {
          q: 'When do we leave for Bhopal?',
          a: 'On 22 January at 9:00 AM from the residence in Narmadapuram. The drive to Dhruva Club & Resort is about 95 km (2 h 15 min) via Budhni, Obaidullaganj and Bhopal.',
        },
        sharedFaq.wear,
        {
          q: 'Is there parking?',
          a: 'Dhruva Club & Resort has parking for guests. Parking near the residence and Krishnapuri Darbar in Narmadapuram is limited, so sharing a car is a good idea on 20 January.',
        },
        sharedFaq.kids,
        sharedFaq.lost,
      ],
    },
  },

  blessings: {
    title: 'Blessings Wall',
    subtitle: 'Leave a few words for the couple — your love is the gift',
    seed: [
      {
        name: 'Family',
        message: 'May your life together be filled with laughter, health, and endless chai.',
      },
      {
        name: 'A friend',
        message: 'From friendship to forever — so happy for you both.',
      },
    ],
  },

  footer: {
    message: 'Join us in celebrating as we begin our forever.',
  },

  /**
   * WhatsApp numbers for quick queries, digits with country code.
   * The schedule-to-self button does not use these.
   */
  queryPhone: {
    bride: '918827428074',
    groom: '917000977422',
  },

  /**
   * Gallery photos under public/gallery/. Grouped by filename section.
   * Empty sections array hides the gallery.
   */
  gallery: {
    kicker: 'Our journey',
    title: 'Moments We Cherish',
    sections: [
      {
        id: 'how-it-all-started',
        title: 'How it all started',
        subtitle: '1 June 2026 · The first hello',
        photos: [
          {
            src: '/gallery/how-it-all-started-v2.webp',
            alt: 'The first WhatsApp conversation — “Hey Muskan”',
            orientation: 'portrait' as const,
          },
        ],
      },
      {
        id: '1st-meet',
        title: '1st meet',
        subtitle: '12 June 2026 · Hyderabad',
        photos: [
          {
            src: '/gallery/1st-meet.webp',
            alt: 'Muskan and Pankaj on their first meet',
            orientation: 'landscape' as const,
          },
        ],
      },
      {
        id: 'roka',
        title: 'Roka',
        subtitle: '12 July 2026 · Families come together',
        photos: [
          {
            src: '/gallery/roka.webp',
            alt: 'Muskan and Pankaj at their Roka',
            orientation: 'portrait' as const,
          },
        ],
      },
      {
        id: 'our-story',
        title: 'Our story',
        subtitle: 'Moments from our journey',
        photos: [
          {
            src: '/gallery/our-story-1.webp',
            alt: 'Our story — moment one',
            orientation: 'landscape' as const,
          },
          {
            src: '/gallery/our-story-2.webp',
            alt: 'Our story — moment two',
            orientation: 'landscape' as const,
          },
          {
            src: '/gallery/our-story-3.webp',
            alt: 'Our story — moment three',
            orientation: 'portrait' as const,
          },
          {
            src: '/gallery/our-story-4.webp',
            alt: 'Our story — moment four',
            orientation: 'landscape' as const,
          },
        ],
      },
      {
        id: 'gallery',
        title: 'Gallery',
        subtitle: 'More moments we cherish',
        photos: [
          {
            src: '/gallery/gallery-1.webp',
            alt: 'Gallery moment one',
            orientation: 'landscape' as const,
          },
          {
            src: '/gallery/gallery-2.webp',
            alt: 'Gallery moment two',
            orientation: 'portrait' as const,
          },
          {
            src: '/gallery/gallery-3.webp',
            alt: 'Gallery moment three',
            orientation: 'landscape' as const,
          },
          {
            src: '/gallery/gallery-4.webp',
            alt: 'Gallery moment four',
            orientation: 'portrait' as const,
          },
        ],
      },
    ],
  },
} as const

export type WeddingConfig = typeof weddingConfig
