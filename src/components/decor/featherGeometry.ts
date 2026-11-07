/** Peacock feather paths — computed once, grouped by colour to keep the DOM small */

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SHAFT_TOP = 70
const SHAFT_BOTTOM = 590
const CX = 120
export const EYE = { cx: 122, cy: 150 }

const shaftX = (y: number) =>
  CX + 10 * Math.sin(((y - SHAFT_TOP) / (SHAFT_BOTTOM - SHAFT_TOP)) * Math.PI * 0.9)

export const barbColors = ['#5f8f3a', '#6f9a3a', '#3e8a6e', '#2f7d76', '#86a548']

function build() {
  const random = rng(7)
  const groups = barbColors.map(() => [] as string[])

  for (let y = SHAFT_TOP + 20; y < SHAFT_BOTTOM - 30; y += 5.2) {
    const t = (y - SHAFT_TOP) / (SHAFT_BOTTOM - SHAFT_TOP)
    const width =
      95 * (1 - t) ** 0.7 * (0.6 + 0.4 * Math.sin((Math.min(1, t * 3) * Math.PI) / 2)) + 8
    const sx = shaftX(y)
    for (const side of [-1, 1]) {
      const length = width * (0.85 + random() * 0.25)
      const lift = 26 + 30 * (1 - t)
      const ex = sx + side * length
      const ey = y - lift
      const c1x = sx + side * length * 0.45
      const c1y = y - lift * 0.15
      const g = Math.floor(random() * groups.length)
      groups[g].push(
        `M${sx.toFixed(1)} ${y.toFixed(1)}Q${c1x.toFixed(1)} ${c1y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
      )
    }
  }

  const fringe: string[] = []
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2
    const r2x = 84 + random() * 10
    const r2y = 108 + random() * 12
    fringe.push(
      `M${(EYE.cx + 66 * Math.cos(a)).toFixed(1)} ${(EYE.cy + 88 * Math.sin(a)).toFixed(1)}` +
        `L${(EYE.cx + r2x * Math.cos(a)).toFixed(1)} ${(EYE.cy + r2y * Math.sin(a)).toFixed(1)}`
    )
  }

  const shaft: string[] = []
  for (let y = SHAFT_TOP; y <= SHAFT_BOTTOM; y += 10) shaft.push(`${shaftX(y).toFixed(1)},${y}`)

  return {
    barbs: groups.map((g) => g.join('')),
    fringe: fringe.join(''),
    shaft: shaft.join(' '),
  }
}

export const featherGeometry = build()
