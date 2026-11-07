import { useId } from 'react'
import { EYE, barbColors, featherGeometry } from './featherGeometry'
import { useDecor, usePulse } from './useDecor'

export default function PeacockFeather({ className = '' }: { className?: string }) {
  const ref = useDecor<HTMLDivElement>()
  const [flutter, trigger] = usePulse(1600)
  const uid = useId().replace(/:/g, '')
  const id = (name: string) => `pf-${name}-${uid}`
  const { cx, cy } = EYE

  return (
    <div
      ref={ref}
      className={`decor decor--feather ${className}`}
      data-flutter={flutter ? '1' : undefined}
      aria-hidden="true"
    >
      <div className="decor__kick">
        <svg className="feather" viewBox="0 0 240 600" onPointerEnter={trigger} onPointerDown={trigger}>
          <defs>
            <radialGradient id={id('outer')} cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#9bb24e" />
              <stop offset="100%" stopColor="#5f8f3a" />
            </radialGradient>
            <radialGradient id={id('bronze')} cx="50%" cy="58%" r="55%">
              <stop offset="0%" stopColor="#d6ac55">
                <animate attributeName="stop-color" values="#d6ac55;#e6c06a;#d6ac55" dur="7s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#9a6d26" />
            </radialGradient>
            <radialGradient id={id('teal')} cx="50%" cy="60%" r="55%">
              <stop offset="0%" stopColor="#25a3a0">
                <animate attributeName="stop-color" values="#25a3a0;#35c0b0;#2390b8;#25a3a0" dur="6s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#0c6b70" />
            </radialGradient>
            <radialGradient id={id('blue')} cx="45%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#2f62b5">
                <animate attributeName="stop-color" values="#2f62b5;#4a5fd0;#2f86c0;#2f62b5" dur="5s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#132f66" />
            </radialGradient>
            <linearGradient id={id('glint')} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff" stopOpacity="0" />
              <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <clipPath id={id('eyeClip')}>
              <ellipse cx={cx} cy={cy} rx="66" ry="88" />
            </clipPath>
          </defs>

          <g className="feather__sway">
            <g className="feather__flutter">
              {featherGeometry.barbs.map((d, i) => (
                <path
                  key={i}
                  className="feather__barbs"
                  d={d}
                  stroke={barbColors[i]}
                  style={{ animationDelay: `${i * -1.3}s` }}
                />
              ))}
              <path className="feather__fringe" d={featherGeometry.fringe} />
              <polyline className="feather__shaft" points={featherGeometry.shaft} />

              <g className="feather__eye">
                <ellipse cx={cx} cy={cy} rx="66" ry="88" fill={`url(#${id('outer')})`} opacity="0.9" />
                <ellipse cx={cx} cy={cy + 8} rx="50" ry="68" fill={`url(#${id('bronze')})`} />
                <ellipse cx={cx} cy={cy + 16} rx="36" ry="48" fill={`url(#${id('teal')})`} />
                <path
                  d={`M${cx} ${cy - 6}C${cx + 24} ${cy + 6} ${cx + 22} ${cy + 46} ${cx} ${cy + 52}C${cx - 22} ${cy + 46} ${cx - 24} ${cy + 6} ${cx} ${cy - 6}Z`}
                  fill={`url(#${id('blue')})`}
                />
                <ellipse cx={cx - 6} cy={cy + 12} rx="5" ry="8" fill="#fff" opacity="0.25" />
                <g clipPath={`url(#${id('eyeClip')})`}>
                  <rect x={cx - 150} y={cy - 100} width="60" height="200" fill={`url(#${id('glint')})`} transform={`rotate(18 ${cx} ${cy})`}>
                    <animate attributeName="x" values={`${cx - 150};${cx + 90};${cx + 90}`} keyTimes="0;0.35;1" dur="7s" repeatCount="indefinite" />
                  </rect>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
