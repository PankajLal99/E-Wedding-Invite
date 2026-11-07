import { useId, type CSSProperties } from 'react'
import { useDecor, usePulse } from './useDecor'

const BASE = { x: 160, y: 172 }

type PetalSpec = { angle: number; length: number; width: number; fill: 'back' | 'mid' | 'front' }

/** Back to front, so later petals overlap earlier ones */
const petals: PetalSpec[] = [
  { angle: -78, length: 105, width: 26, fill: 'back' },
  { angle: 78, length: 105, width: 26, fill: 'back' },
  { angle: -56, length: 118, width: 30, fill: 'mid' },
  { angle: 56, length: 118, width: 30, fill: 'mid' },
  { angle: -30, length: 132, width: 32, fill: 'mid' },
  { angle: 30, length: 132, width: 32, fill: 'mid' },
  { angle: -12, length: 140, width: 30, fill: 'front' },
  { angle: 12, length: 140, width: 30, fill: 'front' },
  { angle: 0, length: 150, width: 32, fill: 'front' },
]

function petalPath({ angle, length, width }: PetalSpec) {
  const a = ((angle - 90) * Math.PI) / 180
  const tip = { x: BASE.x + length * Math.cos(a), y: BASE.y + length * Math.sin(a) }
  const n = { x: -Math.sin(a), y: Math.cos(a) }
  const mid = { x: BASE.x + length * 0.55 * Math.cos(a), y: BASE.y + length * 0.55 * Math.sin(a) }
  const l = { x: mid.x + n.x * width, y: mid.y + n.y * width }
  const r = { x: mid.x - n.x * width, y: mid.y - n.y * width }
  const f = (v: number) => v.toFixed(1)
  return {
    outline: `M${BASE.x} ${BASE.y}Q${f(l.x)} ${f(l.y)} ${f(tip.x)} ${f(tip.y)}Q${f(r.x)} ${f(r.y)} ${BASE.x} ${BASE.y}Z`,
    vein: `M${BASE.x} ${BASE.y}L${f(tip.x)} ${f(tip.y)}`,
  }
}

const petalShapes = petals.map((p) => ({ ...p, ...petalPath(p) }))

export default function Lotus({ className = '' }: { className?: string }) {
  const ref = useDecor<HTMLDivElement>()
  const [bloom, trigger] = usePulse(1800)
  const uid = useId().replace(/:/g, '')
  const id = (name: string) => `lt-${name}-${uid}`

  return (
    <div
      ref={ref}
      className={`decor decor--lotus ${className}`}
      data-bloom={bloom ? '1' : undefined}
      aria-hidden="true"
    >
      <div className="decor__kick">
        <svg className="lotus" viewBox="0 0 320 230" onPointerEnter={trigger} onPointerDown={trigger}>
          <defs>
            <linearGradient id={id('back')} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#e9a6b4" />
              <stop offset="100%" stopColor="#c85d78" />
            </linearGradient>
            <linearGradient id={id('mid')} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#fbe3e8" />
              <stop offset="100%" stopColor="#df7f97" />
            </linearGradient>
            <linearGradient id={id('front')} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#fff4f6" />
              <stop offset="100%" stopColor="#e88aa1" />
            </linearGradient>
            <linearGradient id={id('leaf')} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0c6b70" />
              <stop offset="100%" stopColor="#3e8a6e" />
            </linearGradient>
            <radialGradient id={id('glow')} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f3d27a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#f3d27a" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="lotus__water">
            {[0, 1, 2].map((i) => (
              <ellipse
                key={i}
                className="lotus__ripple"
                cx="160"
                cy="200"
                rx="70"
                ry="9"
                style={{ animationDelay: `${i * -2.6}s` }}
              />
            ))}
            {bloom &&
              [0, 1].map((i) => (
                <ellipse
                  key={`burst-${i}`}
                  className="lotus__ripple lotus__ripple--burst"
                  cx="160"
                  cy="200"
                  rx="70"
                  ry="9"
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
              ))}
          </g>

          <g className="lotus__float">
            <path className="lotus__leaf lotus__leaf--l" d="M20 182 Q90 150 160 176 Q90 206 20 182 Z" fill={`url(#${id('leaf')})`} />
            <path className="lotus__leaf lotus__leaf--r" d="M300 182 Q230 150 160 176 Q230 206 300 182 Z" fill={`url(#${id('leaf')})`} />

            <circle className="lotus__glow" cx="160" cy="120" r="70" fill={`url(#${id('glow')})`} />

            {petalShapes.map((p, i) => (
              <g
                key={i}
                className="lotus__petal"
                style={{ '--dir': Math.sign(p.angle), '--i': i } as CSSProperties}
              >
                <g className="lotus__petal-scroll">
                  <g className="lotus__petal-breathe">
                    <path d={p.outline} fill={`url(#${id(p.fill)})`} stroke="#a97a2e" strokeWidth="1.2" />
                    <path d={p.vein} stroke="#a97a2e" strokeWidth="0.6" opacity="0.45" />
                  </g>
                </g>
              </g>
            ))}
          </g>

          <path d="M40 212 Q100 204 160 212 T280 212" stroke="#a97a2e" strokeWidth="1" fill="none" opacity="0.45" />
        </svg>
      </div>
    </div>
  )
}
