import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import './ScratchCard.css'

type Props = {
  children: ReactNode
  className?: string
  hint?: string
  onClear?: (origin: { x: number; y: number }) => void
}

export default function ScratchCard({ children, className, hint = 'Scratch', onClear }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const cleared = useRef(false)
  const drawing = useRef(false)
  const onClearRef = useRef(onClear)
  onClearRef.current = onClear
  const [clear, setClear] = useState(false)

  useLayoutEffect(() => {
    const wrapEl = wrap.current
    const canvasEl = canvas.current
    if (!wrapEl || !canvasEl) return
    const ctx = canvasEl.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let alive = true

    const paint = () => {
      if (!alive || cleared.current || drawing.current) return
      const rect = wrapEl.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      canvasEl.width = w
      canvasEl.height = h

      const foil = ctx.createLinearGradient(0, 0, w, h)
      foil.addColorStop(0, '#e4c27a')
      foil.addColorStop(0.42, '#f8ecd2')
      foil.addColorStop(1, '#b8894a')
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = foil
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
      ctx.lineWidth = Math.max(1, dpr)
      for (let x = -h; x < w + h; x += 9 * dpr) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + h * 0.6, h)
        ctx.stroke()
      }

      ctx.fillStyle = '#3a1814'
      const size = Math.max(11 * dpr, Math.min(h * 0.42, 15 * dpr))
      ctx.font = `500 ${size}px Cinzel, Georgia, serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(hint.toUpperCase(), w / 2, h / 2)
    }

    paint()
    document.fonts?.ready.then(() => paint())

    const ro = new ResizeObserver(() => paint())
    ro.observe(wrapEl)

    const brush = (e: PointerEvent) => {
      const rect = canvasEl.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const x = ((e.clientX - rect.left) / rect.width) * canvasEl.width
      const y = ((e.clientY - rect.top) / rect.height) * canvasEl.height
      const radius = Math.max(16 * (window.devicePixelRatio || 1), canvasEl.width * 0.07)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    let lastCheck = 0
    const check = () => {
      const now = performance.now()
      if (now - lastCheck < 160) return
      lastCheck = now
      const { width, height } = canvasEl
      const data = ctx.getImageData(0, 0, width, height).data
      let empty = 0
      let total = 0
      for (let i = 3; i < data.length; i += 64) {
        total++
        if (data[i] < 24) empty++
      }
      if (total > 0 && empty / total > 0.5) finish()
    }

    const finish = () => {
      if (cleared.current) return
      cleared.current = true
      setClear(true)
      const rect = wrapEl.getBoundingClientRect()
      onClearRef.current?.({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }

    const down = (e: PointerEvent) => {
      if (cleared.current) return
      drawing.current = true
      canvasEl.setPointerCapture(e.pointerId)
      brush(e)
    }
    const move = (e: PointerEvent) => {
      if (!drawing.current || cleared.current) return
      brush(e)
      check()
    }
    const up = () => {
      drawing.current = false
      lastCheck = 0
      check()
    }

    canvasEl.addEventListener('pointerdown', down)
    canvasEl.addEventListener('pointermove', move)
    canvasEl.addEventListener('pointerup', up)
    canvasEl.addEventListener('pointercancel', up)

    return () => {
      alive = false
      ro.disconnect()
      canvasEl.removeEventListener('pointerdown', down)
      canvasEl.removeEventListener('pointermove', move)
      canvasEl.removeEventListener('pointerup', up)
      canvasEl.removeEventListener('pointercancel', up)
    }
  }, [hint])

  return (
    <div ref={wrap} className={`scratch ${clear ? 'is-clear' : ''} ${className ?? ''}`}>
      <div className="scratch__face">{children}</div>
      <canvas ref={canvas} className="scratch__canvas" aria-hidden="true" />
    </div>
  )
}
