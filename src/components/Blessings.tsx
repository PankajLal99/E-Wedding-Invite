import { FormEvent, useEffect, useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import { weddingConfig } from '../config/wedding'
import FloralCorners from './FloralCorners'
import './Blessings.css'

type Blessing = { name: string; message: string; at?: string; id?: string }

const STORAGE_KEY = 'pm-wedding-blessings'

function loadLocal(): Blessing[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Blessing[]
  } catch {
    return []
  }
}

function saveLocal(items: Blessing[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export default function Blessings() {
  const ref = useReveal<HTMLElement>()
  const [localItems, setLocalItems] = useState<Blessing[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalItems(loadLocal())
  }, [])

  const items: Array<Blessing & { localIndex?: number }> = [
    ...weddingConfig.blessings.seed.map((b) => ({ ...b })),
    ...localItems.map((b, localIndex) => ({ ...b, localIndex })),
  ]

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const entry: Blessing = {
      id: `local-${Date.now()}`,
      name: name.trim().slice(0, 60),
      message: message.trim().slice(0, 400),
      at: new Date().toISOString(),
    }
    if (!entry.name || !entry.message) return

    const nextLocal = [...loadLocal(), entry]
    saveLocal(nextLocal)
    setLocalItems(nextLocal)
    setName('')
    setMessage('')
    setSaved(true)
  }

  const removeLocal = (localIndex?: number) => {
    if (localIndex === undefined) return
    const next = loadLocal().filter((_, i) => i !== localIndex)
    saveLocal(next)
    setLocalItems(next)
    setSaved(false)
  }

  const clearAllMine = () => {
    saveLocal([])
    setLocalItems([])
    setSaved(false)
  }

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

        <div className="blessings__grid">
          {items.map((b, i) => {
            const isMine = b.localIndex !== undefined
            return (
              <article key={b.id || `item-${i}`} className="blessing-card reveal">
                <p className="blessing-card__msg">“{b.message}”</p>
                <div className="blessing-card__footer">
                  <p className="blessing-card__name">— {b.name}</p>
                  {isMine && (
                    <button
                      type="button"
                      className="blessing-card__remove"
                      onClick={() => removeLocal(b.localIndex)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {localItems.length > 0 && (
          <p className="blessings__manage">
            <button type="button" className="blessings__clear" onClick={clearAllMine}>
              Clear my blessings on this device
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
          <button type="submit" className="btn btn-primary">
            Send Blessing
          </button>
          {saved && (
            <p className="blessings__thanks">
              Thank you — your words are on the wall. Tap Remove on your card anytime.
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
