/**
 * Which celebration slice this build (or invite) shows.
 * Env lock (VITE_DAY_SET) wins over personal invite tokens.
 */
export type InviteDaySet = 'all' | 'reception' | '22' | '22-23' | '23'

const DAY_SETS = new Set<InviteDaySet>(['all', 'reception', '22', '22-23', '23'])

/** Build-time lock from `.env` / `.env.reception` — null means unlocked */
export function lockedDaySet(): InviteDaySet | null {
  const raw = String(import.meta.env.VITE_DAY_SET || '')
    .toLowerCase()
    .trim()
  if (DAY_SETS.has(raw as InviteDaySet)) return raw as InviteDaySet
  return null
}

export function normalizeDaySet(value: unknown): InviteDaySet {
  if (typeof value === 'string' && DAY_SETS.has(value as InviteDaySet)) {
    return value as InviteDaySet
  }
  return 'all'
}

/** Env lock wins; otherwise invite / query day set */
export function resolveDaySet(inviteDay?: InviteDaySet | null): InviteDaySet {
  return lockedDaySet() ?? normalizeDaySet(inviteDay)
}

export function isReceptionOnly(d?: InviteDaySet | null): boolean {
  return resolveDaySet(d) === 'reception'
}
