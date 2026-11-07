import { useId } from 'react'
import { useSite } from '../hooks/useSite'

type Props = {
  className?: string
  variant?: 'full' | 'badge'
  title?: string
}

export default function Monogram({ className, variant = 'full', title }: Props) {
  const { monogram } = useSite()
  const [a, b] = monogram
  const uid = useId().replace(/:/g, '')
  const gold = `mg-gold-${uid}`
  const eye = `mg-eye-${uid}`

  const defs = (
    <defs>
      <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e2c27a" />
        <stop offset="45%" stopColor="#b38a3c" />
        <stop offset="100%" stopColor="#7a5a1f" />
      </linearGradient>
      <radialGradient id={eye} cx="50%" cy="58%" r="60%">
        <stop offset="0%" stopColor="#1b3f86" />
        <stop offset="38%" stopColor="#1b3f86" />
        <stop offset="40%" stopColor="#0f7c80" />
        <stop offset="66%" stopColor="#0f7c80" />
        <stop offset="68%" stopColor="#b38a3c" />
        <stop offset="82%" stopColor="#b38a3c" />
        <stop offset="84%" stopColor="#6f9a3a" />
        <stop offset="100%" stopColor="#6f9a3a" />
      </radialGradient>
    </defs>
  )

  if (variant === 'badge') {
    return (
      <svg
        className={className}
        viewBox="0 0 100 100"
        role={title ? 'img' : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
      >
        {defs}
        <circle cx="50" cy="50" r="47" fill="#fbf5ea" stroke={`url(#${gold})`} strokeWidth="2.5" />
        <circle cx="50" cy="50" r="41" fill="none" stroke={`url(#${gold})`} strokeWidth="0.8" />
        <text
          x="37"
          y="58"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="46"
          fontWeight="500"
          fill={`url(#${gold})`}
        >
          {a}
        </text>
        <text
          x="63"
          y="72"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="46"
          fontWeight="500"
          fill={`url(#${gold})`}
        >
          {b}
        </text>
      </svg>
    )
  }

  return (
    <svg
      className={className}
      viewBox="0 0 240 300"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {defs}
      <ellipse
        cx="120"
        cy="150"
        rx="108"
        ry="136"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="1.2"
        opacity="0.75"
      />
      <ellipse
        cx="120"
        cy="150"
        rx="100"
        ry="128"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="0.6"
        opacity="0.55"
      />
      <text
        x="88"
        y="168"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="170"
        fontWeight="500"
        fill={`url(#${gold})`}
      >
        {a}
      </text>
      <text
        x="152"
        y="232"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="170"
        fontWeight="500"
        fill={`url(#${gold})`}
      >
        {b}
      </text>
      <g transform="translate(120 22)">
        <ellipse rx="11" ry="14" fill={`url(#${eye})`} />
        <path d="M0 14 L0 26" stroke={`url(#${gold})`} strokeWidth="1.4" />
      </g>
    </svg>
  )
}
