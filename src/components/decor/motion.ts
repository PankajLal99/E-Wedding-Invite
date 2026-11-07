/**
 * One shared scroll loop for every decoration.
 *
 * Each tracked element receives:
 *   --view-pos   -1 (entering at bottom) … 0 (centre of screen) … 1 (leaving at top)
 *   --scroll-vel -1 … 1, smoothed scroll speed that eases back to 0
 *   data-active  while on screen (CSS pauses animations otherwise)
 *   data-open    once, the first time it comes into view
 */

const items = new Set<HTMLElement>()
const active = new Set<HTMLElement>()

let observer: IntersectionObserver | null = null
let raf = 0
let lastY = 0
let lastT = 0
let vel = 0
let target = 0
let listening = false

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function setSvgPlayback(el: HTMLElement, play: boolean) {
  el.querySelectorAll('svg').forEach((svg) => {
    if (play) svg.unpauseAnimations?.()
    else svg.pauseAnimations?.()
  })
}

function writePosition(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const h = window.innerHeight || 1
  const centre = rect.top + rect.height / 2
  const pos = Math.max(-1, Math.min(1, 1 - (centre / h) * 2))
  el.style.setProperty('--view-pos', pos.toFixed(3))
}

let lastFrame = 0

function tick(now: number) {
  const dt = lastFrame ? Math.min(64, now - lastFrame) : 16
  lastFrame = now
  if (now - lastT > 90) target = 0
  vel += (target - vel) * (1 - Math.exp(-dt / 110))
  const v = Math.abs(vel) < 0.002 && Math.abs(target) < 0.002 ? 0 : vel
  active.forEach((el) => {
    writePosition(el)
    el.style.setProperty('--scroll-vel', v.toFixed(3))
  })
  if (v === 0) {
    raf = 0
    lastFrame = 0
  } else {
    raf = requestAnimationFrame(tick)
  }
}

function onScroll() {
  const now = performance.now()
  const y = window.scrollY
  const dt = Math.max(16, now - lastT)
  target = Math.max(-1, Math.min(1, (y - lastY) / dt / 1.6))
  lastY = y
  lastT = now
  if (!raf) raf = requestAnimationFrame(tick)
}

function onResize() {
  active.forEach(writePosition)
}

function ensureObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement
        if (entry.isIntersecting) {
          active.add(el)
          el.dataset.active = '1'
          el.dataset.open = '1'
          writePosition(el)
          setSvgPlayback(el, true)
        } else {
          active.delete(el)
          delete el.dataset.active
          setSvgPlayback(el, false)
        }
      })
    },
    { rootMargin: '80px 0px' }
  )
  return observer
}

export function track(el: HTMLElement) {
  if (reducedMotion()) {
    el.dataset.open = '1'
    return () => {}
  }
  items.add(el)
  ensureObserver().observe(el)
  if (!listening) {
    listening = true
    lastY = window.scrollY
    lastT = performance.now()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
  }
  return () => {
    items.delete(el)
    active.delete(el)
    observer?.unobserve(el)
    if (items.size === 0 && listening) {
      listening = false
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}
