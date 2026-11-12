import { FormEvent, useMemo, useState } from 'react'
import { features, rsvpUrl } from '../config/features'
import { useGuestInvite } from '../hooks/useGuestInvite'
import { useSite } from '../hooks/useSite'
import { formatGuestLine, type InviteDaySet } from '../utils/invite'
import './Rsvp.css'

type Attending = 'yes' | 'no' | 'maybe'
type Days = InviteDaySet

export default function Rsvp() {
  const invite = useGuestInvite()
  const site = useSite()
  const [name, setName] = useState(invite?.n || '')
  const [phone, setPhone] = useState('')
  const [attending, setAttending] = useState<Attending>('yes')
  const [days, setDays] = useState<Days>(
    (invite?.d as Days) || 'all'
  )
  const [guestCount, setGuestCount] = useState(1)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  const greeting = useMemo(() => {
    if (!invite) return null
    return formatGuestLine(invite)
  }, [invite])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      const res = await fetch(rsvpUrl('/api/rsvp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          attending,
          days: attending === 'no' ? 'all' : days,
          guestCount: attending === 'no' ? 0 : guestCount,
          message: message.trim(),
          inviteToken: new URLSearchParams(window.location.search).get('i') || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save RSVP')
      setStatus('ok')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (!features.rsvp) {
    return (
      <div className="rsvp rsvp--off">
        <p>RSVP is not enabled in this build.</p>
        <a href="/">← Back to invite</a>
      </div>
    )
  }

  return (
    <div className="rsvp">
      <header className="rsvp__top">
        <h1>RSVP</h1>
        <p className="rsvp__sub">
          {site.names.pair} · {site.date.range}
        </p>
        {greeting && (
          <p className="rsvp__hello">
            Dear {greeting}
          </p>
        )}
        <a className="rsvp__back" href="/">
          ← Wedding invite
        </a>
      </header>

      {status === 'ok' ? (
        <section className="rsvp__card rsvp__card--ok">
          <h2>Thank you</h2>
          <p>
            Your RSVP is recorded. We’ll see you
            {attending === 'no' ? ' in our thoughts' : ' at the celebrations'}.
          </p>
          <a className="btn btn-primary" href="/">
            Back to invite
          </a>
        </section>
      ) : (
        <form className="rsvp__card" onSubmit={(e) => void onSubmit(e)}>
          <label>
            Your name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              placeholder="Full name"
              autoComplete="name"
            />
          </label>

          <label>
            WhatsApp number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="98765 43210"
              autoComplete="tel"
            />
          </label>

          <fieldset>
            <legend>Will you attend?</legend>
            {(
              [
                ['yes', 'Joyfully yes'],
                ['maybe', 'Hoping to'],
                ['no', 'Regretfully no'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="rsvp__radio">
                <input
                  type="radio"
                  name="attending"
                  checked={attending === value}
                  onChange={() => setAttending(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>

          {attending !== 'no' && (
            <>
              <fieldset>
                <legend>Which days?</legend>
                {(
                  [
                    ['all', `All days (${site.date.range})`],
                    ['22-23', '22 & 23 January (Dhruva Resort)'],
                    ['23', '23 January only'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="rsvp__radio">
                    <input
                      type="radio"
                      name="days"
                      checked={days === value}
                      onChange={() => setDays(value)}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>

              <label>
                Number of guests (including you)
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                />
              </label>
            </>
          )}

          <label>
            Note for the family (optional)
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={400}
              placeholder="Travel plans, blessings, dietary needs…"
            />
          </label>

          {status === 'error' && <p className="rsvp__error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Sending…' : 'Send RSVP'}
          </button>
        </form>
      )}
    </div>
  )
}
