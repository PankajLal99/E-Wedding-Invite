import type { CSSProperties } from 'react'
import './decor.css'

/** A few lotus petals drifting down the page, behind the navbar and never clickable */
const petals = [
  { left: 8, size: 16, dur: 26, delay: -4, sway: 40, tint: 'a' },
  { left: 22, size: 12, dur: 34, delay: -18, sway: 60, tint: 'b' },
  { left: 41, size: 18, dur: 30, delay: -10, sway: 50, tint: 'a' },
  { left: 63, size: 13, dur: 38, delay: -26, sway: 70, tint: 'b' },
  { left: 78, size: 17, dur: 28, delay: -2, sway: 45, tint: 'a' },
  { left: 90, size: 11, dur: 36, delay: -14, sway: 55, tint: 'b' },
  { left: 52, size: 14, dur: 42, delay: -32, sway: 65, tint: 'a' },
]

export default function DriftingPetals() {
  return (
    <div className="drift" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="drift__petal"
          style={
            {
              left: `${p.left}%`,
              '--size': `${p.size}px`,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--sway': `${p.sway}px`,
            } as CSSProperties
          }
        >
          <span className="drift__sway">
            <svg viewBox="0 0 20 32" className={`drift__shape drift__shape--${p.tint}`}>
              <path d="M10 31 Q-2 16 10 1 Q22 16 10 31 Z" />
              <path d="M10 31 L10 4" className="drift__vein" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  )
}
