import type { ParsedContact } from './vcard'

/**
 * Chrome Contact Picker works on Motorola / OnePlus.
 * Samsung Chrome completes Share then returns [] — a Chromium + Samsung
 * Contacts bug. We cannot read name/number from that empty array.
 */

export function isAppleDevice() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isSamsungBrowser() {
  return /SamsungBrowser/i.test(navigator.userAgent)
}

function uaLooksSamsung(ua: string) {
  return (
    /SamsungBrowser/i.test(ua) ||
    /\bSM-[A-Z0-9]+/i.test(ua) ||
    /SAMSUNG/i.test(ua) ||
    /Galaxy/i.test(ua)
  )
}

export function isSamsungDevice() {
  return uaLooksSamsung(navigator.userAgent)
}

export async function detectSamsungDevice(): Promise<boolean> {
  if (isSamsungDevice()) return true
  try {
    const uaData = navigator.userAgentData
    if (uaData?.getHighEntropyValues) {
      const info = await uaData.getHighEntropyValues(['model'])
      if (uaLooksSamsung(info.model || '')) return true
    }
  } catch {
    // ignore
  }
  return false
}

export function contactsApiAvailable() {
  return (
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    typeof navigator.contacts?.select === 'function'
  )
}

export const SAMSUNG_CHROME_EMPTY_HINT =
  'Samsung Chrome sent 0 contacts after Share (Chrome bug). Open this page in Samsung Internet, or paste the name and number.'

export const SAMSUNG_INTERNET_TIP =
  'This Samsung Internet has no Chrome-style contact sheet. Tap Pick from contacts, then choose Contacts (not Gallery or My Files).'

export function contactPickerHint() {
  if (isSamsungBrowser()) {
    return 'Choose Contacts in the next sheet, then pick the person.'
  }
  return 'Contact picker isn’t available — paste or import a contact card.'
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '')
}

function listFrom(value: unknown): string[] {
  if (value == null) return []
  if (typeof value === 'string') return value.trim() ? [value.trim()] : []
  if (typeof value === 'number') return [String(value)]
  const out: string[] = []
  if (typeof value === 'object' && value !== null && 'length' in value) {
    const arr = value as ArrayLike<unknown>
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (typeof item === 'string' && item.trim()) out.push(item.trim())
    }
    return out
  }
  return []
}

function bestPhone(values: string[]) {
  let phone = ''
  for (const value of values) {
    const d = digitsOnly(value)
    if (d.length >= 10) {
      phone = d.slice(-10)
      if (/^[6-9]/.test(phone)) return phone
    }
  }
  return phone
}

export function normalizePickedContact(raw: unknown): ParsedContact {
  const c = (raw || {}) as { name?: unknown; tel?: unknown }
  return {
    name: listFrom(c.name).join(' ').replace(/\s+/g, ' ').trim(),
    phone: bestPhone(listFrom(c.tel)),
  }
}

function toList(raw: unknown): unknown[] {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw.slice()
  if (typeof raw === 'object' && typeof (raw as Iterable<unknown>)[Symbol.iterator] === 'function') {
    return Array.from(raw as Iterable<unknown>)
  }
  return [raw]
}

export async function pickDeviceContacts(): Promise<{
  contacts: ParsedContact[]
}> {
  if (!contactsApiAvailable() || !navigator.contacts) {
    throw new Error('Contact picker is not available in this browser')
  }

  // Samsung Internet’s Contacts app works more reliably as a single pick.
  // Chrome on Samsung still gets [] after Share (cannot be fixed in the page).
  const multiple = !isSamsungBrowser()
  const properties = ['name', 'tel']

  const raw = await navigator.contacts.select(properties, { multiple })
  const contacts = toList(raw)
    .map(normalizePickedContact)
    .filter((c) => c.name || c.phone)

  return { contacts }
}

