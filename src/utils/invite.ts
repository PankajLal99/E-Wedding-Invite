import { getSiteContent } from '../config/site'
import { currentHostFamily, hostFamilyConfig } from '../config/sides'
import type { HostFamily } from '../config/sides'

/** Which celebration days this guest is invited to */
export type InviteDaySet = 'all' | '22-23' | '23'

export type InvitePayload = {
  /** Guest / contact name · for groups use “समस्त” */
  n: string
  /** Invite with family — uses “आप सपरिवार सादर आमंत्रित हैं” */
  s: boolean
  /** Elders named on the invite (optional), e.g. श्री …, श्रीमती … */
  e?: string[]
  /** Days invited — all (groom 21–23, bride 20 + 22–23 January) · 22–23 · 23 only */
  d?: InviteDaySet
  /** Shared / WhatsApp-group invite (no personal name) */
  g?: boolean
}

export function isGroupInvite(invite: InvitePayload | null | undefined): boolean {
  if (!invite) return false
  return Boolean(invite.g) || invite.n === 'समस्त' || invite.n === '__group__'
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
  return { n: 'समस्त', s: true, d: normalizeDaySet(days), g: true }
}

/** True only when the token explicitly marks सपरिवार. Missing → अकेले. */
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

/** Ensure a respectful जी once — never "Name जी जी" */
export function withJi(name: string): string {
  const n = name.trim().replace(/\s+/g, ' ')
  if (!n) return ''
  if (/जी\s*$/u.test(n)) return n.replace(/\s*जी\s*$/u, ' जी')
  if (/\bji\s*$/i.test(n)) return n.replace(/\s*ji\s*$/i, ' जी')
  return `${n} जी`
}

/** Join names the way cards do: X एवं Y · X, Y एवं Z */
export function joinNames(names: string[]): string {
  const parts = names.map((x) => x.trim()).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} एवं ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')} एवं ${parts[parts.length - 1]}`
}

/**
 * Addressee only — no सपरिवार here.
 * सपरिवार belongs in the request line: “आप सपरिवार सादर आमंत्रित हैं”.
 */
export function formatGuestLine(invite: InvitePayload): string {
  if (isGroupInvite(invite)) return 'परिवार व मित्रों'

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
    return withJi(joinNames(names))
  }

  return withJi(guest)
}

/** The actual सपरिवार / अकेले invite sentence */
export function inviteRequestLine(invite?: InvitePayload): string {
  if (isGroupInvite(invite)) return 'आप सभी सपरिवार सादर आमंत्रित हैं'
  if (isSaparivar(invite)) return 'आप सपरिवार सादर आमंत्रित हैं'
  return 'आप सादर आमंत्रित हैं'
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
    const line = joinNames(names).replace(/\s*एवं\s*/g, ' & ')
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

export function formatDaysSummaryHi(d?: InviteDaySet, family?: HostFamily): string {
  const meta = daySetMeta(d)
  const host = family || currentHostFamily()
  if (meta.id === 'all') {
    return host === 'bride'
      ? '20, 22 व 23 जनवरी 2027 · नर्मदापुरम व भोपाल'
      : '21–23 जनवरी 2027 · भोपाल'
  }
  if (meta.id === '22-23') return '22 व 23 जनवरी 2027 · ध्रुवा रिसॉर्ट, भोपाल'
  return '23 जनवरी 2027 · ध्रुवा रिसॉर्ट, भोपाल (शुभ विवाह)'
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
        .map((e) => `${e.nameHi} · ${e.name} · ${e.time}`)
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
    n: group ? 'समस्त' : payload.n.trim().slice(0, 80),
    // Groups stay सपरिवार; personal invites use the admin choice (default अकेले)
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
      const group = Boolean(data.g) || n === 'समस्त' || n === '__group__'
      return {
        n,
        // Already-sent tokens have s:true → सपरिवार. Missing/false → अकेले.
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

  const detailsLine = 'पूरे विवरण हेतु कृपया यहाँ देखें:'
  const from = `From ${hostFamilyConfig().inviteFrom}`

  if (isGroupInvite(invite)) {
    return (
      `॥ श्री गणेशाय नमः ॥\n` +
      `प्रिय परिवार व मित्रों,\n` +
      `${inviteRequestLine(invite)}।\n\n` +
      `${when}\n\n` +
      `${detailsLine}\n` +
      `${url}\n\n` +
      `${from}`
    )
  }

  const line = formatGuestLine(invite)
  return (
    `॥ श्री गणेशाय नमः ॥\n` +
    `आदरणीय ${line},\n` +
    `${inviteRequestLine(invite)}।\n\n` +
    `${when}\n\n` +
    `${detailsLine}\n` +
    `${url}\n\n` +
    `${from}`
  )
}
