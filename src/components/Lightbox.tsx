import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import './Lightbox.css'

export type LightboxItem = {
  src: string
  alt?: string
}

type LightboxState = {
  items: LightboxItem[]
  index: number
}

type LightboxContextValue = {
  open: (item: LightboxItem | LightboxItem[], index?: number) => void
  close: () => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

export function useLightbox() {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox must be used within LightboxProvider')
  return ctx
}

const MIN_SCALE = 1
const MAX_SCALE = 4

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function LightboxViewer({
  state,
  onClose,
  onIndex,
}: {
  state: LightboxState
  onClose: () => void
  onIndex: (index: number) => void
}) {
  const item = state.items[state.index]
  const multi = state.items.length > 1
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const scaleRef = useRef(1)
  const txRef = useRef(0)
  const tyRef = useRef(0)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null)
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null,
  )
  const lastTap = useRef(0)

  const resetZoom = useCallback(() => {
    scaleRef.current = 1
    txRef.current = 0
    tyRef.current = 0
    setScale(1)
    setTx(0)
    setTy(0)
  }, [])

  useEffect(() => {
    resetZoom()
  }, [state.index, item.src, resetZoom])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && multi) {
        onIndex((state.index - 1 + state.items.length) % state.items.length)
      }
      if (e.key === 'ArrowRight' && multi) {
        onIndex((state.index + 1) % state.items.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [multi, onClose, onIndex, state.index, state.items.length])

  const applyTransform = (s: number, x: number, y: number) => {
    const nextS = clamp(s, MIN_SCALE, MAX_SCALE)
    const nextX = nextS <= 1 ? 0 : x
    const nextY = nextS <= 1 ? 0 : y
    scaleRef.current = nextS
    txRef.current = nextX
    tyRef.current = nextY
    setScale(nextS)
    setTx(nextX)
    setTy(nextY)
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const distance = () => {
      const pts = [...pointers.current.values()]
      if (pts.length < 2) return 0
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      return Math.hypot(dx, dy)
    }

    const onDown = (e: PointerEvent) => {
      stage.setPointerCapture(e.pointerId)
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.current.size === 2) {
        pinchStart.current = { dist: distance(), scale: scaleRef.current }
        panStart.current = null
      } else if (pointers.current.size === 1) {
        panStart.current = {
          x: e.clientX,
          y: e.clientY,
          tx: txRef.current,
          ty: tyRef.current,
        }
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.current.size >= 2 && pinchStart.current) {
        e.preventDefault()
        const dist = distance()
        if (pinchStart.current.dist > 0) {
          const next =
            pinchStart.current.scale * (dist / pinchStart.current.dist)
          applyTransform(next, txRef.current, tyRef.current)
        }
        return
      }

      if (panStart.current && scaleRef.current > 1.02) {
        e.preventDefault()
        const dx = e.clientX - panStart.current.x
        const dy = e.clientY - panStart.current.y
        applyTransform(
          scaleRef.current,
          panStart.current.tx + dx,
          panStart.current.ty + dy,
        )
      }
    }

    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId)
      if (pointers.current.size < 2) pinchStart.current = null
      if (pointers.current.size === 0) panStart.current = null
      if (pointers.current.size === 1) {
        const remaining = [...pointers.current.entries()][0]
        panStart.current = {
          x: remaining[1].x,
          y: remaining[1].y,
          tx: txRef.current,
          ty: tyRef.current,
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      applyTransform(scaleRef.current * delta, txRef.current, tyRef.current)
    }

    const onDouble = (e: MouseEvent) => {
      e.preventDefault()
      if (scaleRef.current > 1.2) resetZoom()
      else applyTransform(2.4, 0, 0)
    }

    const onPointerUpTap = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        const now = Date.now()
        if (now - lastTap.current < 280) {
          if (scaleRef.current > 1.2) resetZoom()
          else applyTransform(2.4, 0, 0)
          lastTap.current = 0
        } else {
          lastTap.current = now
        }
      }
    }

    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)
    stage.addEventListener('pointerup', onPointerUpTap)
    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('dblclick', onDouble)

    return () => {
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('pointerup', onPointerUpTap)
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('dblclick', onDouble)
    }
  }, [resetZoom])

  if (!item) return null

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <button
        type="button"
        className="lightbox__backdrop"
        aria-label="Close photo"
        onClick={onClose}
      />

      <div className="lightbox__chrome">
        <p className="lightbox__hint">
          Pinch or scroll to zoom · double-tap to toggle
        </p>
        <button type="button" className="lightbox__close" onClick={onClose}>
          Close
        </button>
      </div>

      {multi && (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Previous photo"
            onClick={() =>
              onIndex((state.index - 1 + state.items.length) % state.items.length)
            }
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label="Next photo"
            onClick={() => onIndex((state.index + 1) % state.items.length)}
          >
            ›
          </button>
        </>
      )}

      <div ref={stageRef} className="lightbox__stage">
        <img
          className="lightbox__img"
          src={item.src}
          alt={item.alt || ''}
          draggable={false}
          style={{
            transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
          }}
        />
      </div>

      {(item.alt || multi) && (
        <div className="lightbox__footer">
          {item.alt ? <p className="lightbox__caption">{item.alt}</p> : null}
          {multi ? (
            <p className="lightbox__count">
              {state.index + 1} / {state.items.length}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null)

  const open = useCallback((item: LightboxItem | LightboxItem[], index = 0) => {
    const items = Array.isArray(item) ? item : [item]
    if (!items.length) return
    setState({
      items,
      index: clamp(index, 0, items.length - 1),
    })
  }, [])

  const close = useCallback(() => setState(null), [])

  const value = useMemo(() => ({ open, close }), [open, close])

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {state && (
        <LightboxViewer
          state={state}
          onClose={close}
          onIndex={(index) => setState((s) => (s ? { ...s, index } : s))}
        />
      )}
    </LightboxContext.Provider>
  )
}
