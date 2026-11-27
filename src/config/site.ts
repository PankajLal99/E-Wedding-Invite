import { lockedDaySet, type InviteDaySet } from './daySet'
import { hostFamilies, type HostFamily } from './sides'
import { weddingConfig } from './wedding'

export type SiteVenue = {
  name: string
  pinTitle: string
  address: string
  shortAddress: string
  lat: number
  lng: number
  mapUrl: string
  appleMapsUrl: string
  googleMapsUrl: string
}

export type SiteEventSession = {
  label: string
  time: string
}

export type SiteEvent = {
  name: string
  /** Primary time, or first session time for combined cards */
  time: string
  /** When set, shown as one common timings line (e.g. Haldi · Reception) */
  sessions?: readonly SiteEventSession[]
  /** Overrides the day's venue when two events share a date */
  venueKey?: string
  note?: string
  blurb?: string
}

export type SiteDay = {
  day: number
  date: string
  dateShort: string
  venueKey: string
  city: string
  events: readonly SiteEvent[]
}

export type SiteCalendarEvent = {
  day: number
  title: string
  start: string
  end: string
  location: string
  description: string
}

export type SiteDeparture = {
  label: string
  from: string
  to: string
  distance: string
  route: string
  text: string
  link?: string
}

export type SiteTravel = {
  title: string
  note: string
  departure: SiteDeparture | null
  pinKeys: readonly string[]
}

const dayChoices = {
  groom: [
    { id: 'all' as const, title: 'All days', sub: '21, 22 & 23 January' },
    { id: 'reception' as const, title: 'Reception only', sub: '22 January · 9:00 PM' },
    { id: '22' as const, title: '22 only', sub: 'Haldi & Reception' },
    { id: '22-23' as const, title: '22 & 23 only', sub: 'Dhruva Club & Resort · Haldi to Wedding' },
    { id: '23' as const, title: '23 only', sub: 'Wedding day' },
  ],
  bride: [
    { id: 'all' as const, title: 'All days', sub: '20, 22 & 23 January' },
    { id: '22-23' as const, title: '22 & 23 only', sub: 'Dhruva Club & Resort · Haldi to Wedding' },
    { id: '23' as const, title: '23 only', sub: 'Wedding day' },
  ],
}

const receptionEvent: SiteEvent = {
  name: 'Reception',
  time: '9:00 PM',
  blurb:
    'Request your gracious presence for an evening of music, dinner, and joy as we celebrate with family and friends.',
}

const receptionFaq = {
  faqSubtitle: 'Venue, arrival time, and getting to Dhruva Club & Resort',
  faqTip: {
    label: 'Reception · 22 January',
    text: 'Please join us at Dhruva Club & Resort on the Indore – Bhopal Road for the Reception from 9:00 PM. Arrive 15–30 minutes early.',
  },
  faq: [
    {
      q: 'What time should I arrive?',
      a: 'Reception begins at 9:00 PM on 22 January. Please arrive 15–30 minutes early.',
    },
    {
      q: 'Where is the Reception?',
      a: 'Dhruva Club & Resort, Indore – Bhopal Road, Khajoori Sadak, Bhopal 462030. A pinned map is in the Travel section.',
    },
    {
      q: 'What should I wear?',
      a: 'Elegant ethnic or formal wear for the Reception.',
    },
    {
      q: 'Is there parking?',
      a: 'Yes — Dhruva Club & Resort has parking for guests.',
    },
    {
      q: 'Are kids welcome?',
      a: 'Absolutely — little ones are part of the celebration. An early exit from the late-evening reception is completely fine.',
    },
    {
      q: 'Who do I call if I’m lost?',
      a: 'Reach out to the family member who invited you. The Travel section has a pinned map for the venue.',
    },
  ],
} as const

function daysForSet(
  celebrationDays: readonly SiteDay[],
  daySet: InviteDaySet
): SiteDay[] {
  if (daySet === 'all') return [...celebrationDays]
  if (daySet === 'reception') {
    const day22 = celebrationDays.find((d) => d.day === 22)
    if (!day22) return []
    return [{ ...day22, events: [receptionEvent] }]
  }
  if (daySet === '22') return celebrationDays.filter((d) => d.day === 22)
  if (daySet === '22-23') return celebrationDays.filter((d) => d.day === 22 || d.day === 23)
  if (daySet === '23') return celebrationDays.filter((d) => d.day === 23)
  return [...celebrationDays]
}

function calendarForSet(
  calendarEvents: readonly SiteCalendarEvent[],
  daySet: InviteDaySet,
  pair: string,
  resortAddress: string
): SiteCalendarEvent[] {
  if (daySet === 'reception') {
    return [
      {
        day: 22,
        title: `${pair} — Reception`,
        start: '20270122T210000',
        end: '20270122T235900',
        location: resortAddress,
        description: 'Reception 9:00 PM',
      },
    ]
  }
  if (daySet === 'all') return [...calendarEvents]
  const allowed =
    daySet === '22'
      ? new Set([22])
      : daySet === '22-23'
        ? new Set([22, 23])
        : new Set([23])
  return calendarEvents.filter((e) => allowed.has(e.day))
}

function dressForSet(daySet: InviteDaySet) {
  const items = weddingConfig.dressCode.items
  if (daySet === 'reception') {
    return {
      ...weddingConfig.dressCode,
      subtitle: 'Elegant looks for the evening',
      items: items.filter((item) => item.event === 'Reception'),
    }
  }
  if (daySet === '23') {
    return {
      ...weddingConfig.dressCode,
      items: items.filter((item) => item.event === 'Wedding'),
    }
  }
  if (daySet === '22') {
    return {
      ...weddingConfig.dressCode,
      items: items.filter((item) => item.event === 'Haldi' || item.event === 'Reception'),
    }
  }
  return weddingConfig.dressCode
}

export function getSiteContent(family: HostFamily) {
  const side = hostFamilies[family]
  const details = weddingConfig.sides[family]
  const pair = `${side.first} & ${side.second}`
  const daySet = lockedDaySet() ?? 'all'
  const resort = weddingConfig.venues.resort

  const celebrationDays = daysForSet(
    details.celebrationDays as readonly SiteDay[],
    daySet
  )

  const rawCalendar = (details.calendarEvents as readonly SiteCalendarEvent[]).map(
    (event) => ({
      ...event,
      title: `${pair} — ${event.title}`,
    })
  )

  const calendarEvents = calendarForSet(
    rawCalendar,
    daySet,
    pair,
    resort.address
  )

  const receptionLock = daySet === 'reception'

  const travel: SiteTravel = receptionLock
    ? {
        title: details.travel.title,
        note: `The Reception is at ${resort.name}, ${resort.shortAddress}.`,
        departure: null,
        pinKeys: ['resort'],
      }
    : (details.travel as SiteTravel)

  const date = receptionLock
    ? {
        ...weddingConfig.date,
        short: '22 January 2027',
        range: '22 January 2027',
        full: 'Friday, 22 January 2027',
        weddingDay: '22 January',
        iso: '2027-01-22T21:00:00+05:30',
        foreverLabel: 'days to the Reception',
      }
    : { ...weddingConfig.date, short: details.dateShort, range: details.dateRange }

  return {
    family,
    side,
    names: { first: side.first, second: side.second, pair },
    hashtag: side.hashtag,
    monogram: side.monogram,
    date,
    daySet,
    showTimeline: daySet === 'all' || daySet === '22-23' || daySet === '23',
    hero: weddingConfig.hero,
    story: weddingConfig.story,
    ours: { lines: weddingConfig.ours.lines, signOff: `— ${pair}` },
    secret: { ...weddingConfig.secret, signOff: `— ${pair}` },
    inviteFrom: side.inviteFrom,
    venues: weddingConfig.venues as Record<string, SiteVenue>,
    celebrationDays: celebrationDays as readonly SiteDay[],
    calendarEvents,
    timeline: weddingConfig.timeline,
    timelineVenue: `${resort.name}, ${resort.shortAddress}`,
    travel,
    distanceNote: weddingConfig.distanceNote,
    faq: (receptionLock ? receptionFaq.faq : details.faq) as readonly {
      q: string
      a: string
    }[],
    faqTip: receptionLock ? receptionFaq.faqTip : details.faqTip,
    faqSubtitle: receptionLock ? receptionFaq.faqSubtitle : details.faqSubtitle,
    share: {
      text: receptionLock
        ? `You're invited to ${pair}'s Reception (22 January 2027, Dhruva Club & Resort, Bhopal). Details here:`
        : `You're invited to ${pair}'s wedding celebrations (${details.dateRange}, ${details.place}). All details here:`,
    },
    eventsTitle: receptionLock ? 'Reception' : 'Wedding Events',
    eventsSubtitle: receptionLock
      ? 'Friday, 22 January 2027 · Dhruva Club & Resort, Bhopal'
      : details.eventsSubtitle,
    dayChoices: dayChoices[family],
    footer: weddingConfig.footer,
    credit: weddingConfig.credit,
    blessings: weddingConfig.blessings,
    parents: orderedParents(family),
    hostFamily:
      family === 'bride'
        ? weddingConfig.brideFamily
        : weddingConfig.groomFamily,
    dressCode: dressForSet(daySet),
    gallery: weddingConfig.gallery,
    queryPhone: weddingConfig.queryPhone[family].replace(/\D/g, ''),
  }
}

function orderedParents(family: HostFamily) {
  const { bride, groom } = weddingConfig.parents
  const own = family === 'bride' ? bride : groom
  const other = family === 'bride' ? groom : bride
  return {
    own: { ...own, heading: 'Parents' },
    inLaws: {
      ...other,
      heading: family === 'bride' ? 'Groom’s parents' : 'Bride’s parents',
    },
  }
}

export type SiteContent = ReturnType<typeof getSiteContent>
