import { getSiteContent } from '../config/site'
import { currentHostFamily } from '../config/sides'
import {
  filterCalendarEvents,
  type InviteDaySet,
} from './invite'

function icsEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Calendar times are Bhopal local time */
const TZ = 'Asia/Kolkata'

export function buildCalendarIcs(days?: InviteDaySet) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')

  const site = getSiteContent(currentHostFamily())
  const list = filterCalendarEvents(days)
  const events = list
    .map((event, i) => {
      return [
        'BEGIN:VEVENT',
        `UID:wedding-${event.day}-${i}@pankaj-muskan-wedding`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=${TZ}:${event.start}`,
        `DTEND;TZID=${TZ}:${event.end}`,
        `SUMMARY:${icsEscape(event.title)}`,
        `LOCATION:${icsEscape(event.location)}`,
        `DESCRIPTION:${icsEscape(event.description)}`,
        'END:VEVENT',
      ].join('\r\n')
    })
    .join('\r\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${site.names.pair} Wedding//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadCalendar(days?: InviteDaySet) {
  const site = getSiteContent(currentHostFamily())
  const ics = buildCalendarIcs(days)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${site.names.first}-${site.names.second}-wedding.ics`.toLowerCase()
  a.click()
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl(days?: InviteDaySet) {
  const list = filterCalendarEvents(days)
  const site = getSiteContent(currentHostFamily())
  const first = list[list.length - 1] || site.calendarEvents[site.calendarEvents.length - 1]
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: first.title,
    dates: `${first.start}/${first.end}`,
    details: first.description,
    location: first.location,
    ctz: TZ,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
