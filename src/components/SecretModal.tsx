import { useEffect, useState } from 'react'
import { useSite } from '../hooks/useSite'
import './SecretModal.css'

const SEQ = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

type Props = {
  open: boolean
  onClose: () => void
}

export function SecretModal({ open, onClose }: Props) {
  const { secret } = useSite()
  if (!open) return null

  return (
    <div className="secret-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="secret-modal__card" onClick={(e) => e.stopPropagation()}>
        <p className="secret-modal__kicker">Hidden note</p>
        <h3>{secret.title}</h3>
        <p>{secret.message}</p>
        <p className="secret-modal__sign">{secret.signOff}</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export function useKonamiSecret() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let i = 0
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const expected = SEQ[i]
      const match =
        key === expected ||
        (expected.length === 1 && key === expected.toLowerCase())
      if (match) {
        i += 1
        if (i === SEQ.length) {
          setOpen(true)
          i = 0
        }
      } else {
        i = expected === 'ArrowUp' && key === 'ArrowUp' ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return { open, setOpen }
}
