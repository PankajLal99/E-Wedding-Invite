import { FormEvent, useEffect, useState } from 'react'
import { features, rsvpUrl } from '../config/features'
import './Admin.css'

type RsvpRow = {
  id: string
  createdAt: string
  name: string
  phone?: string
  attending: string
  days: string
  guestCount: number
  message?: string
  guestAckText?: string
  notifications?: Record<
    string,
    {
      ok?: boolean
      skipped?: boolean
      pendingHostSend?: boolean
      reason?: string
      provider?: string
    }
  >
}

type WaSettings = {
  hostWhatsapp: string
  callmebotConfigured: boolean
  guestAutoAck: boolean
  guestAckTemplate: string
  hostReady: boolean
  guestCloudReady: boolean
  cloudReady: boolean
  updatedAt?: string | null
}

const DEFAULT_ACK =
  'Namaste {{name}} — we received your RSVP for Pankaj & Muskan’s wedding. Thank you. — Pankaj & Family'

export default function AdminRsvp() {
  const [token, setToken] = useState(features.rsvpAdminToken)
  const [pass, setPass] = useState(features.rsvpAdminToken)
  const [rows, setRows] = useState<RsvpRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(Boolean(features.rsvpAdminToken))

  const [hostPhone, setHostPhone] = useState('')
  const [apikey, setApikey] = useState('')
  const [guestAutoAck, setGuestAutoAck] = useState(true)
  const [ackTemplate, setAckTemplate] = useState(DEFAULT_ACK)
  const [wa, setWa] = useState<WaSettings | null>(null)
  const [waMsg, setWaMsg] = useState('')
  const [waBusy, setWaBusy] = useState(false)

  const headers = (adminToken: string) => ({
    'x-admin-token': adminToken,
    'Content-Type': 'application/json',
  })

  const loadSettings = async (adminToken: string) => {
    const res = await fetch(rsvpUrl('/api/rsvp/settings'), {
      headers: headers(adminToken),
    })
    if (!res.ok) throw new Error(res.status === 401 ? 'Wrong admin token' : 'Settings failed')
    const data = (await res.json()) as WaSettings
    setWa(data)
    setHostPhone(data.hostWhatsapp || '')
    setGuestAutoAck(data.guestAutoAck !== false)
    setAckTemplate(data.guestAckTemplate || DEFAULT_ACK)
    setApikey('')
  }

  const load = async (adminToken: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(rsvpUrl('/api/rsvp'), {
        headers: { 'x-admin-token': adminToken },
      })
      if (!res.ok) throw new Error(res.status === 401 ? 'Wrong admin token' : 'Failed to load')
      const data = await res.json()
      setRows(data.rsvps || [])
      await loadSettings(adminToken)
      setUnlocked(true)
      setToken(adminToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
      setUnlocked(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (features.rsvp && features.rsvpAdminToken) {
      void load(features.rsvpAdminToken)
    }
  }, [])

  const onUnlock = (e: FormEvent) => {
    e.preventDefault()
    void load(pass.trim())
  }

  const saveWhatsApp = async (e: FormEvent) => {
    e.preventDefault()
    setWaBusy(true)
    setWaMsg('')
    try {
      const body: Record<string, unknown> = {
        hostWhatsapp: hostPhone,
        guestAutoAck,
        guestAckTemplate: ackTemplate,
      }
      if (apikey.trim()) body.callmebotApikey = apikey.trim()
      const res = await fetch(rsvpUrl('/api/rsvp/settings'), {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save')
      setWa(data.settings)
      setApikey('')
      setWaMsg(
        data.settings?.hostReady
          ? 'Saved — WhatsApp is ready for host alerts.'
          : 'Saved. Add CallMeBot apikey to finish connecting.'
      )
    } catch (err) {
      setWaMsg(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setWaBusy(false)
    }
  }

  const testWhatsApp = async () => {
    setWaBusy(true)
    setWaMsg('')
    try {
      const res = await fetch(rsvpUrl('/api/rsvp/settings/test'), {
        method: 'POST',
        headers: headers(token),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Test failed')
      setWaMsg('Test sent — check your WhatsApp.')
    } catch (err) {
      setWaMsg(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setWaBusy(false)
    }
  }

  const guestLink = (r: RsvpRow) => {
    const phone = (r.phone || '').replace(/\D/g, '')
    if (!phone) return null
    const withCc = phone.length === 10 ? `91${phone}` : phone
    const text =
      r.guestAckText ||
      ackTemplate.replace(/\{\{name\}\}/g, r.name || 'ji')
    return `https://wa.me/${withCc}?text=${encodeURIComponent(text)}`
  }

  if (!features.rsvp) {
    return (
      <div className="admin admin--gate">
        <p>RSVP admin is disabled in this build.</p>
        <a className="admin__back" href="/admin">
          ← Invite admin
        </a>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div className="admin admin--gate">
        <form className="admin__gate" onSubmit={onUnlock}>
          <h1>RSVP inbox</h1>
          <p className="admin__gate-sub">Dev / family only</p>
          <label>
            API admin token
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoFocus
            />
          </label>
          {error && <p className="admin__error">{error}</p>}
          <button type="submit" className="btn btn-primary admin__big-btn">
            Open
          </button>
          <a className="admin__back" href="/admin">
            ← Invite admin
          </a>
        </form>
      </div>
    )
  }

  const yes = rows.filter((r) => r.attending === 'yes')
  const maybe = rows.filter((r) => r.attending === 'maybe')
  const no = rows.filter((r) => r.attending === 'no')
  const heads = yes.reduce((sum, r) => sum + (r.guestCount || 0), 0)

  return (
    <div className="admin">
      <header className="admin__top">
        <div>
          <h1>RSVP inbox</h1>
          <p className="admin__top-sub">
            {rows.length} replies · {heads} attending guests (yes)
          </p>
        </div>
        <div className="admin__top-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void load(token)}
            disabled={loading}
          >
            Refresh
          </button>
          <a className="admin__back" href="/admin">
            ← Invites
          </a>
        </div>
      </header>

      <div className="admin__simple">
        <section className="admin__panel">
          <p className="admin__step">WhatsApp</p>
          <p className="admin__always">
            Connect your personal number. Each RSVP alerts you here, is saved in
            this inbox, and prepares an automated thank-you for the guest.
          </p>
          <p className="admin__hint">
            Status:{' '}
            {wa?.hostReady
              ? 'Host alerts on'
              : 'Host alerts off — add number + CallMeBot key'}
            {wa?.guestCloudReady ? ' · Cloud guest ack on' : ' · Guest ack via tap-to-send'}
          </p>

          <form className="admin__wa-form" onSubmit={(e) => void saveWhatsApp(e)}>
            <label>
              Your WhatsApp (with country code)
              <input
                value={hostPhone}
                onChange={(e) => setHostPhone(e.target.value)}
                inputMode="tel"
                placeholder="919876543210"
                autoComplete="tel"
              />
            </label>

            <label>
              CallMeBot apikey
              <input
                type="password"
                value={apikey}
                onChange={(e) => setApikey(e.target.value)}
                placeholder={
                  wa?.callmebotConfigured
                    ? 'Saved — paste new key only to replace'
                    : 'From CallMeBot WhatsApp chat'
                }
                autoComplete="off"
              />
            </label>
            <p className="admin__device-tip">
              WhatsApp → chat with +34 644 54 70 645 → send:{' '}
              <em>I allow callmebot get this personal apikey API</em>
            </p>

            <label className="admin__check">
              <input
                type="checkbox"
                checked={guestAutoAck}
                onChange={(e) => setGuestAutoAck(e.target.checked)}
              />
              Prepare automated guest thank-you after each RSVP
            </label>

            <label>
              Guest thank-you text
              <textarea
                value={ackTemplate}
                onChange={(e) => setAckTemplate(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </label>
            <p className="admin__device-tip">Use {'{{name}}'} for the guest’s name.</p>

            <div className="admin__secondary">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={waBusy}
              >
                {waBusy ? 'Saving…' : 'Save WhatsApp'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={waBusy || !wa?.hostReady}
                onClick={() => void testWhatsApp()}
              >
                Send test
              </button>
            </div>
            {waMsg && <p className="admin__hint">{waMsg}</p>}
          </form>
        </section>

        <section className="admin__panel">
          <p className="admin__step">Summary</p>
          <p className="admin__always">
            Yes: {yes.length} · Maybe: {maybe.length} · No: {no.length}
          </p>
        </section>

        <section className="admin__history">
          <div className="admin__history-head">
            <h2>All RSVPs</h2>
          </div>
          {rows.length === 0 ? (
            <p className="admin__always">No RSVPs yet.</p>
          ) : (
            <ul>
              {rows.map((r) => {
                const link = guestLink(r)
                const hostOk = r.notifications?.host?.ok
                const hostSkip = r.notifications?.host?.skipped
                return (
                  <li key={r.id}>
                    <div>
                      <strong>
                        {r.name}{' '}
                        <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>
                          · {r.attending}
                        </span>
                      </strong>
                      <span>
                        {new Date(r.createdAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })}
                        {r.phone ? ` · ${r.phone}` : ''}
                        {` · ${r.days}`}
                        {r.attending !== 'no' ? ` · ${r.guestCount} guest(s)` : ''}
                        {r.message ? ` · “${r.message}”` : ''}
                      </span>
                      <span>
                        Host notify:{' '}
                        {hostOk ? 'sent' : hostSkip ? 'not configured' : 'failed'}
                      </span>
                    </div>
                    {link && (
                      <a
                        className="admin__mini"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Message guest
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
