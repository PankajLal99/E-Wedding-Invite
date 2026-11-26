import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useReveal } from '../hooks/useReveal'
import { weddingConfig } from '../config/wedding'
import FloralCorners from './FloralCorners'
import './Blessings.css'

type Blessing = {
  id: string
  name: string
  message: string
  status?: string
  createdAt?: string
}

const TOKEN_KEY = 'pm-wedding-blessing-tokens'

function loadTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}') as Record<string, string>
  } catch {
    return {}
  }
}

function saveTokens(tokens: Record<string, string>) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

async function readError(res: Response) {
  try {
    const body = (await res.json()) as { error?: string }
    return body.error || 'The blessings wall could not be reached.'
  } catch {
    return 'The blessings wall could not be reached.'
  }
}

export default function Blessings() {
  const ref = useReveal<HTMLElement>()
  const [items, setItems] = useState<Blessing[]>([])
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [thanksOpen, setThanksOpen] = useState(false)
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)
  const [sending, setSending] = useState(false)
  const thanksTitleId = useId()
  const thanksCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setTokens(loadTokens())
    let ignore = false
    fetch('/api/blessings')
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res))
        return res.json() as Promise<{ blessings: Blessing[] }>
      })
      .then((body) => {
        if (ignore) return
        setItems(body.blessings || [])
        setOffline(false)
        setError('')
      })
      .catch(() => {
        if (ignore) return
        setOffline(true)
        setError('')
      })
    return () => {
      ignore = true
    }
  }, [])

  const wall = [
    ...weddingConfig.blessings.seed.map((b, i) => ({
      id: `seed-${i}`,
      name: b.name,
      message: b.message,
    })),
    ...items,
  ]

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const entry = {
      name: name.trim(),
      message: message.trim(),
    }
    if (!entry.name || !entry.message || sending) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (!res.ok) throw new Error(await readError(res))
      const body = (await res.json()) as {
        blessing: Blessing
        deleteToken: string
        pending?: boolean
      }
      const nextTokens = { ...loadTokens(), [body.blessing.id]: body.deleteToken }
      saveTokens(nextTokens)
      setTokens(nextTokens)
      // Pending blessings stay off the public wall until approved in admin.
      setName('')
      setMessage('')
      setThanksOpen(true)
      setOffline(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'The blessings wall could not be reached.',
      )
    } finally {
      setSending(false)
    }
  }

  const closeThanks = () => setThanksOpen(false)

  useEffect(() => {
    if (!thanksOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    thanksCloseRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeThanks()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [thanksOpen])

  const removeOne = async (id: string) => {
    const token = tokens[id]
    if (!token) return
    setError('')
    const res = await fetch(`/api/blessings/${id}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) {
      setError(await readError(res))
      return
    }
    const next = { ...loadTokens() }
    delete next[id]
    saveTokens(next)
    setTokens(next)
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const clearMine = async () => {
    const mine = loadTokens()
    const failed: Record<string, string> = {}
    for (const [id, token] of Object.entries(mine)) {
      const res = await fetch(`/api/blessings/${id}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) failed[id] = token
    }
    saveTokens(failed)
    setTokens(failed)
    setItems((current) => current.filter((item) => !mine[item.id] || failed[item.id]))
    if (Object.keys(failed).length) {
      setError('Some of your blessings could not be removed.')
    }
  }

  const mineOnWall = Object.keys(tokens).filter((id) => items.some((item) => item.id === id))

  return (
    <section className="blessings" id="blessings" ref={ref}>
      <FloralCorners variant="compact" />
      <div className="container blessings__content">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">With love</p>
        <h2 className="section-title reveal">{weddingConfig.blessings.title}</h2>
        <p className="section-subtitle reveal">{weddingConfig.blessings.subtitle}</p>

        {offline && (
          <p className="blessings__offline reveal">
            Blessings API is offline here. Seed notes still show. Locally run{' '}
            <code>npm run dev:blessings</code> (with Postgres). Production uses the deployed API.
          </p>
        )}

        <div className="blessings__grid">
          {wall.map((b, i) => {
            const isMine = Boolean(tokens[b.id])
            return (
              <article
                key={b.id}
                className="blessing-card reveal"
                style={{ transitionDelay: `${Math.min(i, 6) * 70}ms` }}
              >
                <p className="blessing-card__msg">“{b.message}”</p>
                <div className="blessing-card__footer">
                  <p className="blessing-card__name">— {b.name}</p>
                  {isMine && (
                    <button type="button" className="blessing-card__remove" onClick={() => removeOne(b.id)}>
                      Remove
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {mineOnWall.length > 0 && (
          <p className="blessings__manage">
            <button type="button" className="blessings__clear" onClick={clearMine}>
              Remove my blessings
            </button>
          </p>
        )}

        <form className="blessings__form reveal" onSubmit={onSubmit}>
          <p className="blessings__form-title">Leave your blessing</p>
          <label>
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
          </label>
          <label>
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={400}
              rows={3}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={sending || offline}>
            {sending ? 'Sending…' : 'Send Blessing'}
          </button>
          {error && <p className="blessings__error">{error}</p>}
        </form>
      </div>

      {thanksOpen &&
        createPortal(
          <div
            className="blessings__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={thanksTitleId}
            onClick={closeThanks}
          >
            <div
              className="blessings__modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="blessings__modal-kicker">Received with love</p>
              <h3 id={thanksTitleId} className="blessings__modal-title">
                Thank you
              </h3>
              <p className="blessings__modal-note">
                Your blessing has been received. We’ll review it shortly, and it will appear on the
                wall once approved.
              </p>
              <button
                ref={thanksCloseRef}
                type="button"
                className="btn btn-primary blessings__modal-btn"
                onClick={closeThanks}
              >
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
