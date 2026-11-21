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
    { id: '22-23' as const, title: '22 & 23 only', sub: 'Dhruva Club & Resort · Haldi to Wedding' },
    { id: '23' as const, title: '23 only', sub: 'Wedding day' },
  ],
  bride: [
    { id: 'all' as const, title: 'All days', sub: '20, 22 & 23 January' },
    { id: '22-23' as const, title: '22 & 23 only', sub: 'Dhruva Club & Resort · Haldi to Wedding' },
    { id: '23' as const, title: '23 only', sub: 'Wedding day' },
  ],
}

export function getSiteContent(family: HostFamily) {
  const side = hostFamilies[family]
  const details = weddingConfig.sides[family]
  const pair = `${side.first} & ${side.second}`

  return {
    family,
    side,
    names: { first: side.first, second: side.second, pair },
    hashtag: side.hashtag,
    monogram: side.monogram,
    date: { ...weddingConfig.date, short: details.dateShort, range: details.dateRange },
    hero: weddingConfig.hero,
    story: weddingConfig.story,
    ours: { lines: weddingConfig.ours.lines, signOff: `— ${pair}` },
    secret: { ...weddingConfig.secret, signOff: `— ${pair}` },
    inviteFrom: side.inviteFrom,
    venues: weddingConfig.venues as Record<string, SiteVenue>,
    celebrationDays: details.celebrationDays as readonly SiteDay[],
    calendarEvents: (details.calendarEvents as readonly SiteCalendarEvent[]).map((event) => ({
      ...event,
      title: `${pair} — ${event.title}`,
    })),
    timeline: weddingConfig.timeline,
    timelineVenue: `${weddingConfig.venues.resort.name}, ${weddingConfig.venues.resort.shortAddress}`,
    travel: details.travel as SiteTravel,
    distanceNote: weddingConfig.distanceNote,
    faq: details.faq as readonly { q: string; a: string }[],
    faqTip: details.faqTip,
    faqSubtitle: details.faqSubtitle,
    share: {
      text: `You're invited to ${pair}'s wedding celebrations (${details.dateRange}, ${details.place}). All details here:`,
    },
    eventsTitle: 'Wedding Events',
    eventsSubtitle: details.eventsSubtitle,
    dayChoices: dayChoices[family],
    footer: weddingConfig.footer,
    credit: weddingConfig.credit,
    blessings: weddingConfig.blessings,
    parents: orderedParents(family),
    hostFamily:
      family === 'bride'
        ? weddingConfig.brideFamily
        : weddingConfig.groomFamily,
    dressCode: weddingConfig.dressCode,
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
