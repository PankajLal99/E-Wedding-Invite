import { useMemo } from 'react'
import { isSideWord } from '../config/sides'
import {
  decodeInviteToken,
  formatGuestLine,
  formatGuestLineEn,
  normalizeDaySet,
  type InvitePayload,
} from '../utils/invite'

export function useGuestInvite(): InvitePayload | null {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    // Prefer opaque ?i= token; keep legacy ?from= only as fallback for old links
    const token = params.get('i')
    const decoded = decodeInviteToken(token)
    if (decoded) return decoded

    const legacy = params.get('from') || params.get('guest') || params.get('for')
    if (legacy && !isSideWord(legacy)) {
      const d = normalizeDaySet(params.get('days') || params.get('d'))
      try {
        return {
          n: decodeURIComponent(legacy).replace(/[+_]/g, ' ').trim().slice(0, 80),
          s: params.get('family') === '1' || params.get('saparivar') === '1',
          e: [],
          d,
        }
      } catch {
        return { n: legacy.trim().slice(0, 80), s: false, e: [], d }
      }
    }
    return null
  }, [])
}

export function useGuestDisplay() {
  const invite = useGuestInvite()
  if (!invite) return null
  return {
    invite,
    lineHi: formatGuestLine(invite),
    lineEn: formatGuestLineEn(invite),
  }
}
