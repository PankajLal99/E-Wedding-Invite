/**
 * Two websites, one codebase.
 *
 * groom → "Pankaj & Muskan" (Pankaj's family)
 * bride → "Muskan & Pankaj" (Muskan's family)
 *
 * Which side a deployment shows:
 *   1. ?side=pankaj | ?side=muskan   (handy for local preview)
 *   2. VITE_SIDE from the build mode  (`.env` = groom, `.env.bride` = bride)
 *
 * Run locally:  npm run dev  (groom) · npm run dev:bride  (bride)
 * Build both:   npm run build  → dist/groom and dist/bride
 */

export type HostFamily = 'groom' | 'bride'
export type EventHost = HostFamily | 'both'

export type HostFamilyConfig = {
  id: HostFamily
  label: string
  inviteFrom: string
  /** Names in the order this side shows them */
  first: string
  second: string
  firstHi: string
  secondHi: string
  /** Monogram letters, in display order */
  monogram: [string, string]
  hashtag: string
  favicon: string
}

export const hostFamilies: Record<HostFamily, HostFamilyConfig> = {
  groom: {
    id: 'groom',
    label: 'Pankaj’s family',
    inviteFrom: 'Pankaj & Family',
    first: 'Pankaj',
    second: 'Muskan',
    firstHi: 'पंकज',
    secondHi: 'मुस्कान',
    monogram: ['P', 'M'],
    hashtag: '#PankajWedsMuskan',
    favicon: '/favicon-groom.svg',
  },
  bride: {
    id: 'bride',
    label: 'Muskan’s family',
    inviteFrom: 'Muskan & Family',
    first: 'Muskan',
    second: 'Pankaj',
    firstHi: 'मुस्कान',
    secondHi: 'पंकज',
    monogram: ['M', 'P'],
    hashtag: '#MuskanWedsPankaj',
    favicon: '/favicon-bride.svg',
  },
}

const groomWords = new Set(['pankaj', 'groom', 'p'])
const brideWords = new Set(['muskan', 'bride', 'm'])

function buildSide(): HostFamily {
  return String(import.meta.env.VITE_SIDE || '').toLowerCase() === 'bride'
    ? 'bride'
    : 'groom'
}

export function resolveHostFamily(search?: string): HostFamily {
  const from = (new URLSearchParams(search || '').get('side') || '').toLowerCase()
  if (brideWords.has(from)) return 'bride'
  if (groomWords.has(from)) return 'groom'
  return buildSide()
}

export function isSideWord(value: string) {
  const v = value.toLowerCase()
  return groomWords.has(v) || brideWords.has(v)
}

export function currentHostFamily(): HostFamily {
  if (typeof window === 'undefined') return buildSide()
  return resolveHostFamily(window.location.search)
}

export function hostFamilyConfig(id?: HostFamily): HostFamilyConfig {
  return hostFamilies[id || currentHostFamily()]
}

/** Origin of the running site, keeping ?side= when previewing the other side locally */
export function currentSiteUrl(): string {
  const base =
    typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
      ? window.location.origin
      : String(import.meta.env.VITE_SITE_URL || '')
  const family = currentHostFamily()
  if (family === buildSide()) return base
  return `${base}/?side=${family === 'bride' ? 'muskan' : 'pankaj'}`
}

export function eventBelongsToHost(
  eventHost: EventHost | undefined,
  family: HostFamily
) {
  if (!eventHost || eventHost === 'both') return true
  return eventHost === family
}
