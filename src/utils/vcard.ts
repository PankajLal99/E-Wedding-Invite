export type ParsedContact = { name: string; phone: string }

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '')
}

/** Drop PHOTO blobs — Apple exports are huge otherwise and break mobile import */
function stripHeavyFields(raw: string) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Folded PHOTO / SOUND / KEY / LOGO / NOTE with base64
    .replace(
      /^(PHOTO|SOUND|LOGO|KEY|NOTE)[;:][^\n]*(?:\n[ \t][^\n]*)*/gim,
      ''
    )
}

function fieldValue(card: string, prop: string): string {
  // FN:Name · FN;CHARSET=UTF-8:Name · TEL;type=CELL:98…
  const re = new RegExp(`^${prop}(?:;[^:\\n]*)?:(.+)$`, 'im')
  const m = card.match(re)
  return m?.[1]?.replace(/\\,/g, ',').replace(/\\n/g, ' ').trim() || ''
}

function parseOneVCard(raw: string): ParsedContact {
  const card = stripHeavyFields(raw)
  let name = fieldValue(card, 'FN')

  if (!name) {
    const n = fieldValue(card, 'N')
    if (n) {
      const parts = n.split(';')
      name = [parts[1], parts[0], parts[2]].filter(Boolean).join(' ').trim()
    }
  }

  let phone = ''
  const telLines = card.match(/^TEL(?:;[^:\\n]*)?:.+$/gim) || []
  for (const line of telLines) {
    const value = line.split(':').slice(1).join(':')
    const d = digitsOnly(value)
    // Prefer Indian mobiles (10 digits, or 91 + 10)
    if (d.length >= 10) {
      phone = d.slice(-10)
      // Prefer numbers starting 6–9 when choosing among many
      if (/^[6-9]/.test(phone)) break
    }
  }

  return { name, phone }
}

/** Split a .vcf blob that may contain many BEGIN:VCARD … END:VCARD cards */
export function parseAllVCards(raw: string): ParsedContact[] {
  if (!/BEGIN:VCARD/i.test(raw)) return []
  const cleaned = stripHeavyFields(raw)
  const chunks = cleaned.split(/BEGIN:VCARD/i).slice(1)
  const out: ParsedContact[] = []
  for (const chunk of chunks) {
    const card = parseOneVCard(`BEGIN:VCARD${chunk}`)
    if (card.name || card.phone) out.push(card)
  }
  return out
}

export function parseContactText(raw: string): ParsedContact {
  if (/BEGIN:VCARD/i.test(raw)) {
    return parseAllVCards(raw)[0] || { name: '', phone: '' }
  }

  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text) return { name: '', phone: '' }

  const phoneMatch = text.match(
    /(?:\+?91[\s-]*)?([6-9]\d{4}[\s-]?\d{5}|\d{10,12})/
  )
  const phone = phoneMatch ? digitsOnly(phoneMatch[1] || phoneMatch[0]) : ''
  let name = text
  if (phoneMatch) {
    name = text
      .replace(phoneMatch[0], ' ')
      .replace(/[|,;/]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  name = name.replace(/\b(mobile|phone|whatsapp|wa|mob)\b/gi, '').trim()
  const normalized = phone.length >= 10 ? phone.slice(-10) : phone
  return { name, phone: normalized }
}

export function mergeContacts(
  existing: ParsedContact[],
  incoming: ParsedContact[]
): ParsedContact[] {
  const key = (c: ParsedContact) =>
    c.phone || c.name.trim().toLowerCase()
  const map = new Map<string, ParsedContact>()
  for (const c of [...existing, ...incoming]) {
    const k = key(c)
    if (!k) continue
    const prev = map.get(k)
    map.set(k, {
      name: c.name || prev?.name || '',
      phone: c.phone || prev?.phone || '',
    })
  }
  return Array.from(map.values())
}
