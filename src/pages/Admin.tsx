import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { features } from '../config/features'
import { currentSiteUrl } from '../config/sides'
import { weddingConfig } from '../config/wedding'
import { useHostFamily } from '../hooks/useHostFamily'
import { useSite } from '../hooks/useSite'
import {
  encodeInvite,
  formatDaysSummary,
  formatGuestLine,
  inviteRequestLine,
  inviteUrl,
  isGroupInvite,
  makeGroupInvite,
  whatsappInviteText,
  type InviteDaySet,
  type InvitePayload,
} from '../utils/invite'
import {
  SAMSUNG_CHROME_EMPTY_HINT,
  SAMSUNG_INTERNET_TIP,
  contactPickerHint,
  contactsApiAvailable,
  detectSamsungDevice,
  isAppleDevice,
  isSamsungBrowser,
  isSamsungDevice,
  pickDeviceContacts,
} from '../utils/contactsPicker'
import {
  mergeContacts,
  parseAllVCards,
  parseContactText,
  type ParsedContact,
} from '../utils/vcard'
import './Admin.css'

type HistoryItem = {
  id: string
  at: string
  payload: InvitePayload
  token: string
  url: string
  phone?: string
}

type BatchGuest = ParsedContact & {
  id: string
  days: InviteDaySet
  /** सपरिवार when true · अकेले when false/missing */
  saparivar?: boolean
  sent?: boolean
}

type Mode = 'person' | 'many' | 'group'

const HISTORY_KEY = 'pm-invite-admin-history'
const BATCH_KEY = 'pm-invite-admin-batch'
const GATE_KEY = 'pm-invite-admin-ok'
const GATE_PASS = 'pankaj&muskan'

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as HistoryItem[]
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 40)))
}

function loadBatch(): BatchGuest[] {
  try {
    return JSON.parse(localStorage.getItem(BATCH_KEY) || '[]') as BatchGuest[]
  } catch {
    return []
  }
}

function saveBatch(items: BatchGuest[]) {
  localStorage.setItem(BATCH_KEY, JSON.stringify(items.slice(0, 500)))
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '')
}

function waHref(message: string, phone: string) {
  const text = encodeURIComponent(message)
  const d = digitsOnly(phone)
  if (d.length >= 10) {
    const withCountry = d.length === 10 ? `91${d}` : d
    return `https://wa.me/${withCountry}?text=${text}`
  }
  return `https://wa.me/?text=${text}`
}

function inviteFor(
  name: string,
  days: InviteDaySet,
  saparivar = false
): InvitePayload {
  return { n: name.trim() || 'Guest', s: Boolean(saparivar), d: days }
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(GATE_KEY) === '1'
  )
  const [pass, setPass] = useState('')
  const [gateError, setGateError] = useState(false)

  const [mode, setMode] = useState<Mode>(isAppleDevice() ? 'many' : 'person')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [days, setDays] = useState<InviteDaySet>('all')
  /** Default अकेले · already-sent links stay सपरिवार via token s:true */
  const [saparivar, setSaparivar] = useState(false)
  const [batch, setBatch] = useState<BatchGuest[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [hint, setHint] = useState('')
  const [canPickContacts, setCanPickContacts] = useState(false)
  const [samsungPhone, setSamsungPhone] = useState(isSamsungDevice())
  const samsungInternet = isSamsungBrowser()
  const samsungChrome = samsungPhone && !samsungInternet
  const vcfInputRef = useRef<HTMLInputElement>(null)
  const samsungVcfInputRef = useRef<HTMLInputElement>(null)
  const batchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = `Send Invites — ${site.names.pair}`
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    setHistory(loadHistory())
    setBatch(loadBatch())
    setCanPickContacts(contactsApiAvailable())
    void detectSamsungDevice().then(setSamsungPhone)

    const q = new URLSearchParams(window.location.search)
    const shared = [q.get('text'), q.get('title')].filter(Boolean).join('\n').trim()
    if (shared) {
      const parsed = parseContactText(shared)
      if (parsed.name) setName(parsed.name)
      if (parsed.phone) setPhone(parsed.phone)
      if (parsed.name || parsed.phone) {
        setHint('Loaded from a shared contact — edit if needed, then send')
      }
      window.history.replaceState({}, '', window.location.pathname)
    }

    const manifest = document.createElement('link')
    manifest.rel = 'manifest'
    manifest.href = '/admin-manifest.json'
    document.head.appendChild(manifest)
    return () => {
      meta.remove()
      manifest.remove()
    }
  }, [])

  const payload: InvitePayload = useMemo(() => {
    if (mode === 'group') return makeGroupInvite(days)
    return inviteFor(name, days, saparivar)
  }, [mode, name, days, saparivar])

  const token = useMemo(() => encodeInvite(payload), [payload])
  const family = useHostFamily()
  const site = useSite()
  const siteUrl = currentSiteUrl()
  const dayChoices = site.dayChoices
  const url = inviteUrl(siteUrl, token)
  const message = whatsappInviteText(payload, url)
  const preview = formatGuestLine(payload)
  const ready = mode === 'group' || name.trim().length > 1
  const sendHref = waHref(message, mode === 'group' ? '' : phone)

  const pendingBatch = batch.filter((g) => !g.sent && g.name.trim())
  const nextBatch = pendingBatch[0]

  const rememberPayload = (p: InvitePayload, phoneValue?: string) => {
    const t = encodeInvite(p)
    const link = inviteUrl(siteUrl, t)
    const item: HistoryItem = {
      id: `${Date.now()}`,
      at: new Date().toISOString(),
      payload: { ...p },
      token: t,
      url: link,
      phone: phoneValue ? digitsOnly(phoneValue) || undefined : undefined,
    }
    const next = [item, ...loadHistory().filter((h) => h.url !== link)]
    saveHistory(next)
    setHistory(next)
    return { link, msg: whatsappInviteText(p, link) }
  }

  const remember = () => {
    if (!ready) return
    rememberPayload(
      payload,
      mode === 'person' ? phone : undefined
    )
  }

  const updateBatch = (items: BatchGuest[]) => {
    setBatch(items)
    try {
      saveBatch(items)
    } catch {
      // Still keep in memory if storage is full
      setHint('List loaded in this session (couldn’t save offline copy).')
    }
  }

  const addContactsToBatch = (contacts: ParsedContact[], source: string) => {
    if (!contacts.length) {
      setHint('No contacts to add')
      window.alert('No contacts found in that file.')
      return
    }
    const merged = mergeContacts(
      batch.map(({ name: n, phone: p }) => ({ name: n, phone: p })),
      contacts
    )
    const next: BatchGuest[] = merged.map((c) => {
      const existing = batch.find(
        (b) =>
          (c.phone && b.phone === c.phone) ||
          (!c.phone &&
            b.name.toLowerCase() === c.name.toLowerCase())
      )
      return {
        id: existing?.id || newId(),
        name: c.name || existing?.name || '',
        phone: c.phone || existing?.phone || '',
        days: existing?.days || days,
        saparivar: existing?.saparivar ?? saparivar,
        sent: existing?.sent,
      }
    })
    updateBatch(next)
    setMode('many')
    const msg = `${source}: ${contacts.length} contact(s) ready. Scroll down to send.`
    setHint(msg)
    window.alert(msg)
  }

  const readFileAsText = async (file: File) => {
    const buf = await file.arrayBuffer()
    const bytes = new Uint8Array(buf)
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
      return new TextDecoder('utf-16le').decode(buf)
    }
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
      return new TextDecoder('utf-16be').decode(buf)
    }
    return new TextDecoder('utf-8').decode(buf)
  }

  const applyContact = (parsed: ParsedContact, source: string) => {
    if (parsed.name) setName(parsed.name)
    if (parsed.phone) setPhone(parsed.phone)
    if (parsed.name || parsed.phone) {
      setHint(`${source} — edit if needed, then send`)
    } else {
      setHint('Could not read a name or number from that contact')
    }
  }

  const applyParsed = (raw: string) => {
    if (/BEGIN:VCARD/i.test(raw)) {
      const many = parseAllVCards(raw)
      if (many.length > 1) {
        addContactsToBatch(many, 'Imported contact cards')
        return
      }
      if (many.length === 1) {
        applyContact(many[0], 'Loaded from contact card')
        return
      }
    }
    applyContact(parseContactText(raw), 'Filled from paste')
  }

  const pickFromContacts = async () => {
    setHint('')
    // Samsung Internet 22+ removed navigator.contacts. Open the Android
    // vCard picker instead — Contacts appears as an app on that sheet.
    if (samsungInternet) {
      setHint('Choose Contacts, then the person. Not Gallery or My Files.')
      samsungVcfInputRef.current?.click()
      return
    }
    if (!contactsApiAvailable()) {
      setHint(
        isAppleDevice()
          ? 'iPhone can’t open Contacts in the browser. Use the “Many” tab and import contact cards.'
          : contactPickerHint()
      )
      return
    }
    try {
      const { contacts } = await pickDeviceContacts()
      if (!contacts.length) {
        setHint(
          samsungChrome
            ? SAMSUNG_CHROME_EMPTY_HINT
            : 'No contact came through. Paste the name and number instead.'
        )
        return
      }
      if (contacts.length > 1) {
        addContactsToBatch(contacts, 'Loaded from contacts')
      } else {
        applyContact(contacts[0], 'Loaded from contacts')
      }
    } catch (err) {
      const name = err instanceof Error ? err.name : ''
      const msg = err instanceof Error ? err.message : ''
      if (name === 'AbortError' || /cancel|abort|dismiss/i.test(msg)) return
      setHint(
        `Could not open contacts${name ? ` (${name})` : ''}. Import contact cards instead.`
      )
    }
  }

  const readVcfFiles = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (!list.length) return
    setHint(`Reading ${list.length} file(s)…`)
    const all: ParsedContact[] = []
    const errors: string[] = []
    for (const file of list) {
      try {
        const text = await readFileAsText(file)
        if (/BEGIN:VCARD/i.test(text)) {
          const parsed = parseAllVCards(text)
          if (!parsed.length) {
            errors.push(`${file.name}: vCard found but names/numbers not read`)
          }
          all.push(...parsed)
        } else if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
          const data = JSON.parse(text) as {
            contacts?: ParsedContact[]
          }
          all.push(...(data.contacts || []))
        } else {
          const one = parseContactText(text)
          if (one.name || one.phone) all.push(one)
          else errors.push(`${file.name}: not a contact card`)
        }
      } catch (err) {
        errors.push(
          `${file.name}: ${err instanceof Error ? err.message : 'unreadable'}`
        )
      }
    }
    if (!all.length) {
      const detail = errors.slice(0, 3).join('\n')
      setHint('No contacts found in those files')
      window.alert(`No contacts found.\n\n${detail}`)
      return
    }
    if (all.length === 1 && mode === 'person') {
      applyContact(all[0], 'Loaded from contact card')
      return
    }
    addContactsToBatch(all, `Imported ${all.length}`)
  }

  const onVcfSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    e.target.value = ''
    if (!files?.length) return
    await readVcfFiles(files)
  }

  const pasteContact = async () => {
    setHint('')
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        setHint('Clipboard is empty')
        return
      }
      applyParsed(text)
    } catch {
      const manual = window.prompt('Paste contact(s) or vCard text:')
      if (manual) applyParsed(manual)
    }
  }

  const markBatchSent = (id: string) => {
    updateBatch(
      batch.map((g) => (g.id === id ? { ...g, sent: true } : g))
    )
  }

  const sendBatchGuest = (guest: BatchGuest) => {
    const p = inviteFor(guest.name, guest.days, guest.saparivar ?? saparivar)
    const { link, msg } = rememberPayload(p, guest.phone)
    markBatchSent(guest.id)
    window.open(waHref(msg, guest.phone), '_blank', 'noopener,noreferrer')
    setHint(`Opened WhatsApp for ${guest.name}. Come back and tap Send next.`)
    return link
  }

  const unlock = (e: FormEvent) => {
    e.preventDefault()
    if (pass.trim().toLowerCase() === GATE_PASS) {
      sessionStorage.setItem(GATE_KEY, '1')
      setUnlocked(true)
      setGateError(false)
    } else {
      setGateError(true)
    }
  }

  const resetForm = () => {
    setName('')
    setPhone('')
    setDays('all')
    setSaparivar(false)
    setHint('')
  }

  const familyPicker = (
    <div className="admin__mode admin__mode--family" lang="hi">
      <button
        type="button"
        className={`admin__mode-btn ${!saparivar ? 'is-on' : ''}`}
        onClick={() => {
          setSaparivar(false)
          if (mode === 'many' && batch.length) {
            updateBatch(batch.map((g) => ({ ...g, saparivar: false })))
          }
        }}
      >
        अकेले
      </button>
      <button
        type="button"
        className={`admin__mode-btn ${saparivar ? 'is-on' : ''}`}
        onClick={() => {
          setSaparivar(true)
          if (mode === 'many' && batch.length) {
            updateBatch(batch.map((g) => ({ ...g, saparivar: true })))
          }
        }}
      >
        सपरिवार
      </button>
    </div>
  )

  const dayPicker = (
    <div className="admin__day-grid">
      {dayChoices.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`admin__day-card ${days === opt.id ? 'is-on' : ''}`}
          onClick={() => {
            setDays(opt.id)
            if (mode === 'many' && batch.length) {
              updateBatch(batch.map((g) => ({ ...g, days: opt.id })))
            }
          }}
        >
          <strong>{opt.title}</strong>
          <span>{opt.sub}</span>
        </button>
      ))}
    </div>
  )

  if (!unlocked) {
    return (
      <div className="admin admin--gate">
        <form className="admin__gate" onSubmit={unlock}>
          <p className="admin__blessing" lang="hi">
            {weddingConfig.blessing}
          </p>
          <h1>Send Invites</h1>
          <p className="admin__gate-sub">Family only</p>
          <label>
            Password
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoFocus
              autoComplete="current-password"
              placeholder="Family password"
            />
          </label>
          {gateError && (
            <p className="admin__error" role="alert">
              Wrong password
            </p>
          )}
          <button type="submit" className="btn btn-primary admin__big-btn">
            Open
          </button>
          <a className="admin__back" href="/">
            ← Wedding site
          </a>
        </form>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin__top">
        <div>
          <p className="admin__blessing" lang="hi">
            {weddingConfig.blessing}
          </p>
          <h1>Send Invites</h1>
          <p className="admin__top-sub">
            {family.label} · From {family.inviteFrom}
          </p>
        </div>
        <div className="admin__top-actions">
          {features.rsvp && (
            <a className="admin__back" href="/admin/rsvp">
              RSVP inbox
            </a>
          )}
          <a className="admin__back" href="/">
            ← Wedding site
          </a>
        </div>
      </header>

      <div className="admin__simple">
        <div className="admin__mode admin__mode--3" role="tablist" aria-label="Invite type">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'person'}
            className={`admin__mode-btn ${mode === 'person' ? 'is-on' : ''}`}
            onClick={() => setMode('person')}
          >
            One
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'many'}
            className={`admin__mode-btn ${mode === 'many' ? 'is-on' : ''}`}
            onClick={() => setMode('many')}
          >
            Many
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'group'}
            className={`admin__mode-btn ${mode === 'group' ? 'is-on' : ''}`}
            onClick={() => setMode('group')}
          >
            Group
          </button>
        </div>

        <input
          ref={vcfInputRef}
          type="file"
          accept=".vcf,.VCF,text/vcard,text/x-vcard,text/directory"
          className="admin__file-input"
          onChange={(e) => void onVcfSelected(e)}
        />
        <input
          ref={samsungVcfInputRef}
          type="file"
          accept="text/x-vcard,text/vcard,text/x-vCard,.vcf"
          className="admin__file-input"
          onChange={(e) => void onVcfSelected(e)}
        />
        <input
          ref={batchInputRef}
          type="file"
          accept=".vcf,.VCF,text/vcard,text/x-vcard,text/directory"
          multiple
          className="admin__file-input"
          onChange={(e) => void onVcfSelected(e)}
        />

        {mode === 'person' && (
          <section className="admin__panel">
            <p className="admin__step">1 · Guest</p>
            <div className="admin__big-actions">
              {samsungChrome ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary admin__big-btn"
                    onClick={() => void pasteContact()}
                  >
                    Paste contact
                  </button>
                  {canPickContacts && (
                    <button
                      type="button"
                      className="btn btn-ghost admin__big-btn"
                      onClick={() => void pickFromContacts()}
                    >
                      Try contact picker
                    </button>
                  )}
                </>
              ) : canPickContacts || samsungInternet ? (
                <button
                  type="button"
                  className="btn btn-primary admin__big-btn"
                  onClick={() => void pickFromContacts()}
                >
                  Pick from contacts
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary admin__big-btn"
                  onClick={() => setMode('many')}
                >
                  Import many (iPhone)
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost admin__big-btn"
                onClick={() => vcfInputRef.current?.click()}
              >
                Import one card
              </button>
              {!samsungChrome && (
                <button
                  type="button"
                  className="btn btn-ghost admin__big-btn"
                  onClick={() => void pasteContact()}
                >
                  Paste contact
                </button>
              )}
            </div>
            {samsungInternet && (
              <p className="admin__device-tip">{SAMSUNG_INTERNET_TIP}</p>
            )}
            {samsungChrome && (
              <p className="admin__device-tip">
                Samsung Chrome cannot pass contacts into the website. Open this
                same page in Samsung Internet, or paste name + number.
              </p>
            )}
            {hint && <p className="admin__hint">{hint}</p>}
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text')
                  if (/\d{10}/.test(text) || /BEGIN:VCARD/i.test(text)) {
                    e.preventDefault()
                    applyParsed(text)
                  }
                }}
                placeholder="Guest name"
                autoComplete="name"
              />
            </label>
            <label>
              WhatsApp number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
              />
            </label>
            <p className="admin__step">Invite as</p>
            {familyPicker}
          </section>
        )}

        {mode === 'many' && (
          <section className="admin__panel">
            <p className="admin__step">1 · Import contacts</p>
            <p className="admin__device-tip">
              <strong>On iPhone:</strong> Contacts → Select → Share → Save to
              Files, then import the .vcf here. Prefer smaller lists without
              photos if a big file fails.
              {samsungInternet ? (
                <>
                  {' '}
                  <strong>On Samsung Internet:</strong> tap Pick from contacts,
                  then choose the Contacts app (not My Files).
                </>
              ) : samsungChrome ? (
                <>
                  {' '}
                  <strong>On Samsung:</strong> open this page in Samsung
                  Internet for the contact picker, or paste / import a .vcf.
                </>
              ) : null}
            </p>
            <div className="admin__big-actions">
              <button
                type="button"
                className="btn btn-primary admin__big-btn"
                onClick={() => batchInputRef.current?.click()}
              >
                Import contact cards
              </button>
              {(canPickContacts || samsungInternet) && (
                <button
                  type="button"
                  className="btn btn-ghost admin__big-btn"
                  onClick={() => void pickFromContacts()}
                >
                  Pick from contacts
                </button>
              )}
            </div>
            {hint && <p className="admin__hint">{hint}</p>}

            <p className="admin__step">2 · Invite as</p>
            {familyPicker}

            <p className="admin__step">3 · Days for everyone</p>
            {dayPicker}

            {batch.length > 0 && (
              <>
                <div className="admin__batch-head">
                  <p className="admin__step">
                    4 · Send list ({pendingBatch.length} left)
                  </p>
                  <button
                    type="button"
                    className="admin__mini"
                    onClick={() => {
                      updateBatch([])
                      setHint('List cleared')
                    }}
                  >
                    Clear list
                  </button>
                </div>

                {nextBatch && (
                  <button
                    type="button"
                    className="btn btn-primary admin__big-btn"
                    onClick={() => sendBatchGuest(nextBatch)}
                  >
                    Send next: {nextBatch.name || 'Guest'}
                  </button>
                )}

                <ul className="admin__batch-list">
                  {batch.map((g) => {
                    const p = inviteFor(g.name, g.days, g.saparivar ?? saparivar)
                    const t = encodeInvite(p)
                    const link = inviteUrl(siteUrl, t)
                    const msg = whatsappInviteText(p, link)
                    return (
                      <li
                        key={g.id}
                        className={`admin__batch-item ${g.sent ? 'is-sent' : ''}`}
                      >
                        <div className="admin__batch-fields">
                          <input
                            value={g.name}
                            aria-label="Name"
                            onChange={(e) =>
                              updateBatch(
                                batch.map((x) =>
                                  x.id === g.id
                                    ? { ...x, name: e.target.value, sent: false }
                                    : x
                                )
                              )
                            }
                            placeholder="Name"
                          />
                          <input
                            value={g.phone}
                            aria-label="Phone"
                            inputMode="tel"
                            onChange={(e) =>
                              updateBatch(
                                batch.map((x) =>
                                  x.id === g.id
                                    ? { ...x, phone: e.target.value, sent: false }
                                    : x
                                )
                              )
                            }
                            placeholder="Phone"
                          />
                        </div>
                        <div className="admin__batch-actions">
                          <a
                            className="admin__mini"
                            href={waHref(msg, g.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              rememberPayload(p, g.phone)
                              markBatchSent(g.id)
                            }}
                          >
                            {g.sent ? 'Send again' : 'Send'}
                          </a>
                          <button
                            type="button"
                            className="admin__mini"
                            onClick={() =>
                              updateBatch(batch.filter((x) => x.id !== g.id))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </section>
        )}

        {mode === 'group' && (
          <section className="admin__panel">
            <p className="admin__step">1 · Group invite</p>
            <p className="admin__always">
              One shared link for everyone — no personal name. WhatsApp will open;
              you pick the group.
            </p>
            {hint && <p className="admin__hint">{hint}</p>}
          </section>
        )}

        {mode !== 'many' && (
          <>
            <section className="admin__panel">
              <p className="admin__step">2 · Which days?</p>
              {dayPicker}
            </section>

            <section className="admin__panel admin__panel--send">
              <p className="admin__step">3 · Send</p>
              <div className="admin__preview">
                <span>Preview</span>
                <strong lang="hi">
                  {mode === 'group'
                    ? 'प्रिय परिवार व मित्रों,'
                    : `आदरणीय ${preview},`}
                </strong>
                <em lang="hi">{inviteRequestLine(payload)}।</em>
                <em>{formatDaysSummary(days)}</em>
              </div>
              <a
                className={`btn btn-primary admin__big-btn admin__send ${
                  ready ? '' : 'is-disabled'
                }`}
                href={ready ? sendHref : undefined}
                aria-disabled={!ready}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!ready) {
                    e.preventDefault()
                    setHint('Enter the guest name first')
                    return
                  }
                  remember()
                  if (mode === 'group') {
                    setHint('In WhatsApp, choose the group and send')
                  }
                }}
              >
                {mode === 'group' ? 'Send to group' : 'Send on WhatsApp'}
              </a>
              <div className="admin__secondary">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={!ready}
                  onClick={() => {
                    void navigator.clipboard.writeText(message)
                    setHint('Message copied')
                  }}
                >
                  Copy message
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={!ready}
                  onClick={() => {
                    void navigator.clipboard.writeText(url)
                    setHint('Link copied')
                  }}
                >
                  Copy link
                </button>
                {mode === 'person' && (
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    New guest
                  </button>
                )}
              </div>
            </section>
          </>
        )}

        {history.length > 0 && (
          <section className="admin__history">
            <div className="admin__history-head">
              <h2>Sent</h2>
              <button
                type="button"
                className="admin__mini"
                onClick={() => {
                  localStorage.removeItem(HISTORY_KEY)
                  setHistory([])
                }}
              >
                Clear
              </button>
            </div>
            <ul>
              {history.map((h) => (
                <li key={h.id}>
                  <div>
                    <strong lang={isGroupInvite(h.payload) ? 'hi' : undefined}>
                      {isGroupInvite(h.payload)
                        ? 'Group · परिवार व मित्रों'
                        : formatGuestLine(h.payload)}
                    </strong>
                    <span>
                      {formatDaysSummary(h.payload.d)}
                      {h.phone ? ` · ${h.phone}` : ''}
                    </span>
                  </div>
                  <a
                    className="admin__mini"
                    href={waHref(
                      whatsappInviteText(h.payload, h.url),
                      h.phone || ''
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Send again
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
