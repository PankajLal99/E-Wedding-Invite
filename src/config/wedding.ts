// ============================================================
//  Pankaj & Muskan — wedding details.
//  Shared content at the top; each side's own days, travel and FAQ in `sides`.
//  Name order, monogram and sign-offs per side: src/config/sides.ts
// ============================================================

const groomResidenceMaps = 'https://maps.app.goo.gl/6UJ8oXXEKtmpPcca9'
const brideResidenceMaps = 'https://maps.app.goo.gl/QDX5FNppwdpBdMwb6'
const resortMaps = 'https://maps.app.goo.gl/bhRWUMtVq6xUDRfB8'
const brideToResortRoute = 'https://maps.app.goo.gl/pxf6XmaEqYnsVWWK6'

const resortAddress = 'Dhruva Resort, Indore – Bhopal Road, Khajoori Sadak, Bhopal 462030'

const venues = {
  residence: {
    name: 'Residence',
    address: 'A 53 D, BDA Colony, Teela Jamalpura, Bhopal 462001',
    shortAddress: 'Teela Jamalpura, Bhopal',
    mapUrl: groomResidenceMaps,
    appleMapsUrl:
      'https://maps.apple.com/?ll=23.277375,77.393889&q=Residence%20%C2%B7%20BDA%20Colony%2C%20Teela%20Jamalpura',
    googleMapsUrl: groomResidenceMaps,
  },
  brideResidence: {
    name: 'Residence',
    address: 'H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001',
    shortAddress: 'Fefartal, Narmadapuram',
    mapUrl: brideResidenceMaps,
    appleMapsUrl:
      'https://maps.apple.com/?ll=22.7339524,77.7125525&q=Pink%20Avenue%20Annex%2C%20Narmadapuram',
    googleMapsUrl: brideResidenceMaps,
  },
  resort: {
    name: 'Dhruva Resort',
    address: 'Indore – Bhopal Road, Khajoori Sadak, Bhopal, Madhya Pradesh 462030',
    shortAddress: 'Khajoori Sadak, Bhopal',
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
      { name: 'Haldi', time: '12:00 PM' },
      {
        name: 'Ring Ceremony & Reception',
        time: '9:00 PM',
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
      { name: 'Barat', time: '11:00 AM' },
      { name: 'Lunch', time: '2:00 PM' },
      { name: 'Shubh Lagn', time: '2:00 PM' },
    ],
  },
]

const resortCalendar = [
  {
    day: 22,
    title: 'Haldi, Ring Ceremony & Reception',
    start: '20270122T120000',
    end: '20270122T235900',
    location: resortAddress,
    description: 'Haldi 12:00 PM · Ring Ceremony & Reception 9:00 PM',
  },
  {
    day: 23,
    title: 'Barat & Wedding',
    start: '20270123T110000',
    end: '20270123T200000',
    location: resortAddress,
    description: 'Barat 11:00 AM · Lunch 2:00 PM · Shubh Lagn 2:00 PM',
  },
]

const bhopalTravel = {
  airport: {
    mode: 'Airport',
    name: 'Raja Bhoj Airport (BHO), Bhopal',
    link: 'https://www.google.com/maps/search/?api=1&query=Raja+Bhoj+Airport+Bhopal',
  },
  bpl: {
    mode: 'Railway',
    name: 'Bhopal Junction (BPL)',
    link: 'https://www.google.com/maps/search/?api=1&query=Bhopal+Junction+Railway+Station',
  },
  shrn: {
    mode: 'Railway',
    name: 'Sant Hirdaram Nagar (SHRN)',
    link: 'https://www.google.com/maps/search/?api=1&query=Sant+Hirdaram+Nagar+Railway+Station+Bhopal',
  },
  rkmp: {
    mode: 'Railway',
    name: 'Rani Kamlapati (RKMP)',
    link: 'https://www.google.com/maps/search/?api=1&query=Rani+Kamlapati+Railway+Station+Bhopal',
  },
}

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
    a: 'Reach out to the family member who invited you. The Google Maps and Apple Maps buttons on this site point straight to each venue.',
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
    subtitle: 'A friendship that became a caring bond',
    paragraphs: [
      'We met in June 2026, and what started as an easy friendship quickly became our favourite part of every day — long conversations, shared laughter, and a quiet comfort in each other’s company.',
      'Somewhere between the small moments, friendship turned into care, and care into a bond we didn’t want to let go of. On 12 July 2026, our families came together and blessed us at our Roka.',
      'Now, in January 2027, we begin forever — and having you with us would mean the world.',
    ],
    milestones: [
      { year: 'June 2026', event: 'First met as friends' },
      { year: '12 July 2026', event: 'Roka ceremony' },
      { year: 'January 2027', event: 'Our wedding' },
    ],
  },

  venues,

  timeline: [
    { time: '11:00 AM', title: 'Barat', description: 'The groom’s procession arrives' },
    { time: '2:00 PM', title: 'Lunch', description: 'Celebrate with family and friends' },
    { time: '2:00 PM', title: 'Shubh Lagn', description: 'The wedding ceremony' },
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
              name: 'Bairana Sahab',
              time: '10:00 AM',
              note: 'Followed by lunch',
            },
          ],
        },
        ...resortDays,
      ],
      calendarEvents: [
        {
          day: 21,
          title: 'Bairana Sahab & Lunch',
          start: '20270121T100000',
          end: '20270121T150000',
          location: 'A 53 D, BDA Colony, Teela Jamalpura, Bhopal 462001',
          description: 'Bairana Sahab 10:00 AM, followed by lunch',
        },
        ...resortCalendar,
      ],
      travel: {
        title: 'Travel',
        note: 'All celebrations are in Bhopal — at the residence on 21 January and Dhruva Resort on 22–23 January.',
        departure: null,
        modes: [
          {
            ...bhopalTravel.airport,
            detail: 'Closest airport for both venues. Cabs and app taxis are available at arrivals.',
            distances: [
              { to: 'Residence', value: '~12 km · 25–30 min' },
              { to: 'Dhruva Resort', value: '~15 km · 25–30 min' },
            ],
          },
          {
            ...bhopalTravel.bpl,
            detail: 'Main station in old Bhopal — the closest to the residence.',
            distances: [
              { to: 'Residence', value: '~3 km · 10 min' },
              { to: 'Dhruva Resort', value: '~22 km · 40 min' },
            ],
          },
          {
            ...bhopalTravel.shrn,
            detail: 'Bairagarh station on the Indore road side — the closest to Dhruva Resort.',
            distances: [
              { to: 'Residence', value: '~9 km · 20 min' },
              { to: 'Dhruva Resort', value: '~13 km · 20–25 min' },
            ],
          },
          {
            ...bhopalTravel.rkmp,
            detail: 'Formerly Habibganj — many express and Vande Bharat trains stop here.',
            distances: [
              { to: 'Residence', value: '~10 km · 25 min' },
              { to: 'Dhruva Resort', value: '~27 km · 45 min' },
            ],
          },
        ],
      },
      faqTip: {
        label: 'Two venues',
        text: '21 January is at the residence in Teela Jamalpura. 22 & 23 January are at Dhruva Resort on the Indore – Bhopal Road, about 21 km (40 min) away — please plan your travel accordingly.',
      },
      faqSubtitle: 'Venues, arrival times, and getting around Bhopal',
      faq: [
        {
          q: 'What time should I arrive?',
          a: 'Please arrive 15–30 minutes early. Bairana Sahab (21 January) starts at 10:00 AM. Haldi (22 January) from 12:00 PM, and the Ring Ceremony & Reception from 9:00 PM. On 23 January, Barat begins at 11:00 AM, with lunch and Shubh Lagn from 2:00 PM.',
        },
        {
          q: 'Where are the celebrations?',
          a: '21 January: Residence — A 53 D, BDA Colony, Teela Jamalpura, Bhopal 462001. 22 & 23 January: Dhruva Resort, Indore – Bhopal Road, Khajoori Sadak, Bhopal 462030. Map buttons are on every day in the Events section.',
        },
        {
          q: 'How far is the residence from Dhruva Resort?',
          a: 'About 21 km — roughly 35–45 minutes by car depending on city traffic.',
        },
        {
          q: 'Which station or airport should I choose?',
          a: 'For the residence, Bhopal Junction is closest (~3 km). For Dhruva Resort, Sant Hirdaram Nagar (~13 km) or Raja Bhoj Airport (~15 km) are the most convenient. Rani Kamlapati also works well for trains that don’t stop at Bhopal Junction.',
        },
        sharedFaq.wear,
        {
          q: 'Is there parking?',
          a: 'Dhruva Resort has parking for guests. Parking near the residence is limited street parking, so sharing a cab or car is a good idea on 21 January.',
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
            { name: 'Mata Chowki', time: '7:00 PM' },
          ],
        },
        ...resortDays,
      ],
      calendarEvents: [
        {
          day: 20,
          title: 'Mehndi & Mata Chowki',
          start: '20270120T140000',
          end: '20270120T230000',
          location: 'H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001',
          description: 'Mehndi 2:00 PM · Mata Chowki 7:00 PM',
        },
        {
          day: 22,
          title: 'Departure to Dhruva Resort',
          start: '20270122T090000',
          end: '20270122T113000',
          location: 'H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001',
          description: `Leave the residence at 9:00 AM for Dhruva Resort, Bhopal (~95 km via Bhopal). Route: ${brideToResortRoute}`,
        },
        ...resortCalendar,
      ],
      travel: {
        title: 'Travel',
        note: '20 January is at the residence in Narmadapuram. 22 & 23 January are at Dhruva Resort, Bhopal.',
        departure: {
          label: 'Departure · 22 January, 9:00 AM',
          from: 'Residence, Pink Avenue Annex, Narmadapuram',
          to: 'Dhruva Resort, Khajoori Sadak, Bhopal',
          distance: '~95 km · about 2 h 15 min by road',
          route: 'Narmadapuram → Budhni → Obaidullaganj (NH46) → Bhopal → Indore – Bhopal Road → Dhruva Resort',
          text: 'We leave the residence together at 9:00 AM on 22 January so everyone reaches Dhruva Resort in time for Haldi at 12:00 PM.',
          link: brideToResortRoute,
        },
        modes: [
          {
            mode: 'Railway',
            name: 'Narmadapuram (NMDB)',
            detail: 'For 20 January. Formerly Hoshangabad — the closest station to the residence.',
            link: 'https://www.google.com/maps/search/?api=1&query=Narmadapuram+Railway+Station',
            distances: [
              { to: 'Residence', value: '~4 km · 10–15 min' },
              { to: 'Dhruva Resort', value: '~95 km · 2 h 15 min' },
            ],
          },
          {
            ...bhopalTravel.rkmp,
            detail: 'For 22–23 January. Formerly Habibganj — on the Narmadapuram side of Bhopal, with many express and Vande Bharat trains.',
            distances: [
              { to: 'Residence', value: '~75 km · 1 h 45 min' },
              { to: 'Dhruva Resort', value: '~27 km · 45 min' },
            ],
          },
          {
            ...bhopalTravel.airport,
            detail: 'Closest airport for both venues. Cabs and app taxis are available at arrivals.',
            distances: [
              { to: 'Residence', value: '~95 km · 2 h 15 min' },
              { to: 'Dhruva Resort', value: '~15 km · 25–30 min' },
            ],
          },
          {
            ...bhopalTravel.shrn,
            detail: 'For 22–23 January. Bairagarh station on the Indore road side — the closest to Dhruva Resort.',
            distances: [
              { to: 'Residence', value: '~90 km · 2 h 10 min' },
              { to: 'Dhruva Resort', value: '~13 km · 20–25 min' },
            ],
          },
          {
            ...bhopalTravel.bpl,
            detail: 'For 22–23 January. Main station in old Bhopal.',
            distances: [
              { to: 'Residence', value: '~80 km · 2 h' },
              { to: 'Dhruva Resort', value: '~22 km · 40 min' },
            ],
          },
        ],
      },
      faqTip: {
        label: 'Departure · 22 January',
        text: 'We leave the residence in Narmadapuram at 9:00 AM on 22 January for Dhruva Resort, Bhopal — about 95 km (2 h 15 min) via Obaidullaganj and Bhopal. Haldi begins at 12:00 PM.',
      },
      faqSubtitle: 'Venues, arrival times, and travelling between Narmadapuram and Bhopal',
      faq: [
        {
          q: 'What time should I arrive?',
          a: 'Please arrive 15–30 minutes early. On 20 January, Mehndi starts at 2:00 PM and Mata Chowki at 7:00 PM at the residence. On 22 January, Haldi is from 12:00 PM and the Ring Ceremony & Reception from 9:00 PM. On 23 January, Barat begins at 11:00 AM, with lunch and Shubh Lagn from 2:00 PM.',
        },
        {
          q: 'Where are the celebrations?',
          a: '20 January: Residence — H 90, Pink Avenue Annex, Harda Road, Fefartal, Narmadapuram 461001. 22 & 23 January: Dhruva Resort, Indore – Bhopal Road, Khajoori Sadak, Bhopal 462030. Map buttons are on every day in the Events section.',
        },
        {
          q: 'When do we leave for Bhopal?',
          a: 'On 22 January at 9:00 AM from the residence in Narmadapuram. The drive to Dhruva Resort is about 95 km (2 h 15 min) via Budhni, Obaidullaganj and Bhopal. The route link is in the Travel section.',
        },
        {
          q: 'Which station or airport should I choose?',
          a: 'For 20 January, come to Narmadapuram (NMDB), about 4 km from the residence. If you are joining only on 22–23 January, Rani Kamlapati, Sant Hirdaram Nagar or Raja Bhoj Airport in Bhopal are much closer to Dhruva Resort.',
        },
        sharedFaq.wear,
        {
          q: 'Is there parking?',
          a: 'Dhruva Resort has parking for guests. Parking near the residence in Narmadapuram is limited, so sharing a car is a good idea on 20 January.',
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
} as const

export type WeddingConfig = typeof weddingConfig
