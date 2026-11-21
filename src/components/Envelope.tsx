import { useEffect, useState } from 'react'
import { useSite } from '../hooks/useSite'
import Monogram from './Monogram'
import './Envelope.css'

export default function Envelope() {
  const { names } = useSite()
  const [phase, setPhase] = useState<'sealed' | 'opening' | 'done'>('sealed')

  useEffect(() => {
    if (phase === 'done') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'opening') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setPhase('done'), reduce ? 280 : 3200)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (phase === 'done') return null

  const open = () => {
    if (phase === 'sealed') setPhase('opening')
  }

  return (
    <div
      className={`envelope ${phase === 'opening' ? 'is-opening' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Invitation"
    >
      <div className="envelope__veil" />
      <p className="envelope__kicker">You are invited</p>
      <button type="button" className="envelope__scene" onClick={open} aria-label="Open the invitation">
        <div className="envelope__letter">
          <p className="envelope__names">
            <span>{names.first}</span>
            <span className="envelope__amp">&</span>
            <span>{names.second}</span>
          </p>
        </div>
        <div className="envelope__body" aria-hidden="true">
          <svg viewBox="0 0 640 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="env-pocket" x1="320" y1="248" x2="320" y2="398" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4a2229" />
                <stop offset="100%" stopColor="#31161b" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="636" height="396" fill="#2a1216" />
            <polygon points="2,398 638,398 320,248" fill="url(#env-pocket)" />
            <polygon points="18,14 622,14 320,256" fill="rgba(0,0,0,0.2)" />
            <polyline className="envelope__crease" points="2,398 320,248 638,398" fill="none" />
            <rect className="envelope__rule" x="2" y="2" width="636" height="396" fill="none" />
          </svg>
          <img className="envelope__lotus" src="/brand/lotus-corner.png" alt="" />
        </div>
        <div className="envelope__flap" aria-hidden="true">
          <svg viewBox="0 0 640 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="env-flap" x1="320" y1="2" x2="320" y2="248" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8a4450" />
                <stop offset="58%" stopColor="#5a2830" />
                <stop offset="100%" stopColor="#3d1a20" />
              </linearGradient>
            </defs>
            <polygon points="2,4 638,4 320,248" fill="url(#env-flap)" />
            <polyline className="envelope__rule" points="2,2 320,248 638,2" fill="none" />
          </svg>
          <span className="envelope__seal">
            <Monogram className="envelope__monogram" />
          </span>
        </div>
      </button>
      <p className="envelope__hint">Tap the envelope</p>
    </div>
  )
}
