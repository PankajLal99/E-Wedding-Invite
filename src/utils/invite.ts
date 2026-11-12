import { getSiteContent } from '../config/site'
import { currentHostFamily, hostFamilyConfig } from '../config/sides'
import type { HostFamily } from '../config/sides'

/** Which celebration days this guest is invited to */
export type InviteDaySet = 'all' | '22-23' | '23'

export type InvitePayload = {
  /** Guest / contact name · groups use “__group__” */
  n: string
  /** Invite with family — warm “with family” wording */
  s: boolean
  /** Elders named on the invite (optional), e.g. Mr …, Mrs … */
  e?: string[]
  /** Days invited — all (groom 21–23, bride 20 + 22–23 January) · 22–23 · 23 only */
  d?: InviteDaySet
  /** Shared / WhatsApp-group invite (no personal name) */
  g?: boolean
}

export function isGroupInvite(invite: InvitePayload | null | undefined): boolean {
  if (!invite) return false
  return Boolean(invite.g) || invite.n === '\u0938\u092e\u0938\u094d\u0924' || invite.n === '__group__'
}

export const inviteDayOptions: Array<{
  id: InviteDaySet
  label: string
  days: number[]
}> = [
  {
    id: 'all',
    label: 'All days',
    days: [20, 21, 22, 23],
  },
  {
    id: '22-23',
    label: '22 & 23 January only (Dhruva Resort)',
    days: [22, 23],
  },
  {
    id: '23',
    label: '23 January only (Wedding day)',
    days: [23],
  },
]

/** Optional short codes — kept for old links; admin always encodes full tokens */
export const inviteBook: Record<
  string,
  { name: string; saparivar: boolean; elders?: string[]; days?: InviteDaySet }
> = {
  papa: { name: 'Papa', saparivar: true, elders: [], days: 'all' },
  mummy: { name: 'Mummy', saparivar: true, elders: [], days: 'all' },
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const binary = atob(b64 + pad)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function normalizeDaySet(value: unknown): InviteDaySet {
  if (value === '22-23' || value === '23' || value === 'all') return value
  return 'all'
}

export function makeGroupInvite(days: InviteDaySet = 'all'): InvitePayload {
  return { n: '__group__', s: true, d: normalizeDaySet(days), g: true }
}

/** True only when the token explicitly marks with-family. Missing → without family. */
export function isSaparivar(invite?: InvitePayload | null): boolean {
  return Boolean(invite?.s)
}

export function daySetMeta(d?: InviteDaySet) {
  const id = normalizeDaySet(d)
  return inviteDayOptions.find((o) => o.id === id) || inviteDayOptions[0]
}

export function invitedDayNumbers(d?: InviteDaySet): number[] {
  return daySetMeta(d).days
}

export function filterCelebrationDays(d?: InviteDaySet, family?: HostFamily) {
  const allowed = new Set(invitedDayNumbers(d))
  const site = getSiteContent(family || currentHostFamily())
  return site.celebrationDays.filter((day) => allowed.has(day.day))
}

export function filterCalendarEvents(d?: InviteDaySet, family?: HostFamily) {
  const allowed = new Set(invitedDayNumbers(d))
  const site = getSiteContent(family || currentHostFamily())
  return site.calendarEvents.filter((event) => allowed.has(event.day))
}

/** Join names the way cards do: X & Y · X, Y & Z */
export function joinNames(names: string[]): string {
  const parts = names.map((x) => x.trim()).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} & ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}`
}

/** Addressee only — the with-family wording lives in the request line. */
export function formatGuestLine(invite: InvitePayload): string {
  if (isGroupInvite(invite)) return 'family & friends'

  const elders = (invite.e || []).map((x) => x.trim()).filter(Boolean)
  const guest = invite.n.trim()

  if (elders.length) {
    const guestAlreadyListed = elders.some(
      (e) => e.toLowerCase() === guest.toLowerCase()
    )
    const names =
      guest && !guestAlreadyListed && invite.s
        ? [...elders, guest]
        : elders
    return joinNames(names)
  }

  return guest
}

/** The actual with-family / without-family invite sentence */
export function inviteRequestLine(invite?: InvitePayload): string {
  if (isGroupInvite(invite)) return 'You are all warmly invited, with your families'
  if (isSaparivar(invite)) return 'You are warmly invited, with your family'
  return 'You are warmly invited'
}

export function formatGuestLineEn(invite: InvitePayload): string {
  if (isGroupInvite(invite)) return 'family & friends'
  const elders = (invite.e || []).map((x) => x.trim()).filter(Boolean)
  const guest = invite.n.trim()
  if (elders.length) {
    const names =
      guest && invite.s && !elders.some((e) => e.toLowerCase() === guest.toLowerCase())
        ? [...elders, guest]
        : elders
    const line = joinNames(names)
    return invite.s ? `${line} & family` : line
  }
  if (!invite.s) return guest
  return `${guest} & family`
}

/** Compact date line for messages / welcome */
export function formatDaysSummary(d?: InviteDaySet, family?: HostFamily): string {
  const meta = daySetMeta(d)
  const host = family || currentHostFamily()
  if (meta.id === 'all') {
    return host === 'bride'
      ? '20, 22 & 23 January 2027 · Narmadapuram & Bhopal'
      : '21–23 January 2027 · Bhopal'
  }
  if (meta.id === '22-23') return '22 & 23 January 2027 · Dhruva Resort, Bhopal'
  return '23 January 2027 · Dhruva Resort, Bhopal (Wedding day)'
}

/** Per-day schedule block for WhatsApp / preview */
export function formatDaysSchedule(d?: InviteDaySet, family?: HostFamily): string {
  const host = family || currentHostFamily()
  const site = getSiteContent(host)
  const days = filterCelebrationDays(d, host)
  return days
    .map((day) => {
      const venue = site.venues[day.venueKey]
      const events = day.events
        .map((e) => `${e.name} · ${e.time}`)
        .join('\n  ')
      return (
        `• ${day.dateShort} · ${day.city}\n` +
        `  ${events}\n` +
        `  📍 ${venue.name}, ${venue.shortAddress}`
      )
    })
    .join('\n\n')
}

/** Build opaque token so the guest name is not readable in the URL */
export function encodeInvite(payload: InvitePayload): string {
  const days = normalizeDaySet(payload.d)
  const group = isGroupInvite(payload)
  const compact: InvitePayload = {
    n: group ? '__group__' : payload.n.trim().slice(0, 80),
    // Groups stay with-family; personal invites use the admin choice
    s: group ? true : Boolean(payload.s),
    d: days,
  }
  if (group) compact.g = true
  if (payload.e?.length) {
    compact.e = payload.e.map((x) => x.trim()).filter(Boolean).slice(0, 6)
  }
  return `c.${toBase64Url(JSON.stringify(compact))}`
}

export function decodeInviteToken(token: string | null): InvitePayload | null {
  if (!token) return null
  const code = token.trim()

  const known = inviteBook[code.toLowerCase()]
  if (known) {
    return {
      n: known.name,
      s: known.saparivar,
      e: known.elders,
      d: normalizeDaySet(known.days),
    }
  }

  if (code.startsWith('c.')) {
    try {
      const json = fromBase64Url(code.slice(2))
      const data = JSON.parse(json) as InvitePayload
      if (!data?.n || typeof data.n !== 'string') return null
      const n = data.n.trim().slice(0, 80)
      const group = Boolean(data.g) || n === '\u0938\u092e\u0938\u094d\u0924' || n === '__group__'
      return {
        n,
        // Already-sent tokens have s:true → with family. Missing/false → without.
        s: group ? true : data.s === true,
        e: Array.isArray(data.e) ? data.e.map(String).slice(0, 6) : [],
        d: normalizeDaySet(data.d),
        g: group,
      }
    } catch {
      return null
    }
  }

  return null
}

export function inviteUrl(siteUrl: string, token: string) {
  const url = new URL(siteUrl)
  url.searchParams.set('i', token)
  return url.toString()
}

export function whatsappInviteText(invite: InvitePayload, url: string) {
  // Keep short so the link stays above WhatsApp’s “Read more” fold
  const when = formatDaysSummary(invite.d)

  const detailsLine = 'For full details, please visit:'
  const from = `From ${hostFamilyConfig().inviteFrom}`

  if (isGroupInvite(invite)) {
    return (
      `Dear family & friends,\n` +
      `${inviteRequestLine(invite)}.\n\n` +
      `${when}\n\n` +
      `${detailsLine}\n` +
      `${url}\n\n` +
      `${from}`
    )
  }

  const line = formatGuestLine(invite)
  return (
    `Dear ${line},\n` +
    `${inviteRequestLine(invite)}.\n\n` +
    `${when}\n\n` +
    `${detailsLine}\n` +
    `${url}\n\n` +
    `${from}`
  )
}
