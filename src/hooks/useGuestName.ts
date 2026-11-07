import { useMemo } from 'react'

function cleanName(raw: string | null): string {
  if (!raw) return ''
  try {
    return decodeURIComponent(raw).replace(/[+_]/g, ' ').trim().slice(0, 60)
  } catch {
    return raw.replace(/[+_]/g, ' ').trim().slice(0, 60)
  }
}

export function useGuestName() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return cleanName(params.get('from') || params.get('guest') || params.get('for'))
  }, [])
}

export function personalInviteUrl(siteUrl: string, guestName: string) {
  const base = siteUrl.replace(/\/$/, '')
  if (!guestName) return base
  return `${base}/?from=${encodeURIComponent(guestName)}`
}
