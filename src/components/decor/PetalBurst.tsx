import { useEffect } from 'react'
import './decor.css'

const COUNT = 26

type Origin = { x: number; y: number }

export default function PetalBurst({
  origin,
  onDone,
}: {
  origin: Origin
  onDone: () => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1900)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="petal-burst" aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2
        const reach = 90 + (i % 5) * 28
        const dx = Math.cos(angle) * reach
        const dy = Math.sin(angle) * reach * 0.72 + 70
        return (
          <span
            key={i}
            className="petal-burst__petal"
            style={{
              left: origin.x,
              top: origin.y,
              width: 12 + (i % 4) * 5,
              animationDelay: `${(i % 7) * 0.025}s`,
              ['--dx' as string]: `${dx}px`,
              ['--dy' as string]: `${dy}px`,
              ['--rot' as string]: `${(i * 53) % 360}deg`,
            }}
          >
            <svg viewBox="0 0 20 32" className={`drift__shape drift__shape--${i % 2 ? 'a' : 'b'}`}>
              <path d="M10 31 Q-2 16 10 1 Q22 16 10 31 Z" />
              <path d="M10 31 L10 4" className="drift__vein" />
            </svg>
          </span>
        )
      })}
    </div>
  )
}
