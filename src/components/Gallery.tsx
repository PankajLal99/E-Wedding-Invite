import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useReveal } from '../hooks/useReveal'
import { useSite } from '../hooks/useSite'
import FloralCorners from './FloralCorners'
import { useLightbox } from './Lightbox'
import './Gallery.css'

type DeckPhoto = {
  src: string
  alt: string
  orientation: 'portrait' | 'landscape'
  contain?: boolean
}

const SWIPE_THRESHOLD = 56
const PEEK = 2

function wrapOffset(index: number, active: number, total: number) {
  let delta = index - active
  if (delta > total / 2) delta -= total
  if (delta < -total / 2) delta += total
  return delta
}

function PhotoDeck({
  photos,
  label,
}: {
  photos: DeckPhoto[]
  label: string
}) {
  const total = photos.length
  const single = total === 1
  const [active, setActive] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const lightbox = useLightbox()
  const pointerId = useRef<number | null>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const axis = useRef<'undecided' | 'x' | 'y'>('undecided')
  const dragXRef = useRef(0)
  const moved = useRef(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const focused = useRef(false)

  const go = useCallback(
    (dir: -1 | 1) => {
      if (single) return
      setActive((current) => (current + dir + total) % total)
      setDragX(0)
      dragXRef.current = 0
    },
    [single, total],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!focused.current || single) return
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, single])

  const endDrag = useCallback(() => {
    const x = dragXRef.current
    pointerId.current = null
    setDragging(false)
    if (single) {
      setDragX(0)
      dragXRef.current = 0
      return
    }
    if (x <= -SWIPE_THRESHOLD) go(1)
    else if (x >= SWIPE_THRESHOLD) go(-1)
    else {
      setDragX(0)
      dragXRef.current = 0
    }
  }, [go, single])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const openCurrent = () => {
      lightbox.open(
        photos.map((p) => ({ src: p.src, alt: p.alt })),
        active,
      )
    }

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return
      pointerId.current = event.pointerId
      startX.current = event.clientX
      startY.current = event.clientY
      axis.current = 'undecided'
      moved.current = false
      dragXRef.current = 0
      setDragX(0)
      stage.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent) => {
      if (pointerId.current !== event.pointerId) return
      const dx = event.clientX - startX.current
      const dy = event.clientY - startY.current

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved.current = true

      if (single) return

      if (axis.current === 'undecided') {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (axis.current === 'y') return
        setDragging(true)
      }

      if (axis.current !== 'x') return
      event.preventDefault()
      dragXRef.current = dx
      setDragX(dx)
    }

    const onUp = (event: PointerEvent) => {
      if (pointerId.current !== event.pointerId) return
      const wasSwipe = axis.current === 'x' && !single
      if (wasSwipe) endDrag()
      else {
        pointerId.current = null
        setDragging(false)
        setDragX(0)
        dragXRef.current = 0
        if (!moved.current) openCurrent()
      }
      axis.current = 'undecided'
    }

    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)

    return () => {
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
    }
  }, [active, endDrag, lightbox, photos, single])

  const current = photos[active]
  const orientation = current.orientation
  const tall = orientation === 'portrait' || Boolean(current.contain)

  return (
    <div
      className={`deck deck--${orientation}${tall ? ' deck--tall' : ' deck--wide'}${
        single ? ' deck--single' : ''
      }${current.contain ? ' deck--contain' : ''}`}
      onFocus={() => {
        focused.current = true
      }}
      onBlur={() => {
        focused.current = false
      }}
      onMouseEnter={() => {
        focused.current = true
      }}
      onMouseLeave={() => {
        focused.current = false
      }}
    >
      <div className="deck__stage-wrap">
        {!single && (
          <button
            type="button"
            className="deck__nav deck__nav--prev"
            onClick={() => go(-1)}
            aria-label={`Previous photo in ${label}`}
          >
            ‹
          </button>
        )}

        <div
          ref={stageRef}
          className={`deck__stage${dragging ? ' is-dragging' : ''}`}
          role="group"
          tabIndex={0}
          aria-roledescription="photo deck"
          aria-label={
            single
              ? `${label}. Tap to open and zoom.`
              : `${label}. Photo ${active + 1} of ${total}. Swipe or use arrows. Tap to open and zoom.`
          }
        >
          {photos.map((photo, index) => {
            const offset = single ? 0 : wrapOffset(index, active, total)
            if (!single && Math.abs(offset) > PEEK) return null

            const isFront = offset === 0
            const drag = isFront ? dragX : 0
            const tilt = isFront ? drag * 0.04 : offset * 2.4
            const style = {
              '--offset': offset,
              '--drag': `${drag}px`,
              '--tilt': `${tilt}deg`,
              zIndex: PEEK + 1 - Math.abs(offset),
            } as CSSProperties

            return (
              <figure
                key={photo.src}
                className={`deck__card deck__card--${photo.orientation}${
                  photo.contain ? ' deck__card--contain' : ''
                }${isFront ? ' is-front' : ''}`}
                data-offset={offset}
                style={style}
                aria-hidden={!isFront}
              >
                <div className="photo-frame">
                  <div className="photo-frame__mat">
                    <img
                      src={photo.src}
                      alt={isFront ? photo.alt : ''}
                      draggable={false}
                      loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                      decoding="async"
                      width={photo.orientation === 'portrait' ? 720 : 960}
                      height={photo.orientation === 'portrait' ? 960 : 640}
                    />
                  </div>
                </div>
              </figure>
            )
          })}
        </div>

        {!single && (
          <button
            type="button"
            className="deck__nav deck__nav--next"
            onClick={() => go(1)}
            aria-label={`Next photo in ${label}`}
          >
            ›
          </button>
        )}
      </div>

      {!single && (
        <>
          <p className="deck__hint">Swipe to browse</p>
          <div className="deck__dots" role="tablist" aria-label={label}>
            {photos.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`${label}, photo ${index + 1}`}
                className={`deck__dot${index === active ? ' is-active' : ''}`}
                onClick={() => {
                  setActive(index)
                  setDragX(0)
                  dragXRef.current = 0
                }}
              />
            ))}
          </div>
          <p className="deck__count">
            {active + 1} / {total}
          </p>
        </>
      )}

      {single && <p className="deck__caption">{current.alt}</p>}
    </div>
  )
}

export default function Gallery() {
  const ref = useReveal<HTMLElement>()
  const { gallery } = useSite()
  const sections = gallery.sections.filter((section) => section.photos.length > 0)

  if (!sections.length) return null

  return (
    <section className="gallery" id="gallery" ref={ref}>
      <FloralCorners variant="compact" />
      <div className="container">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">{gallery.kicker}</p>
        <h2 className="section-title reveal">{gallery.title}</h2>

        <div className="gallery__sections">
          {sections.map((section) => (
            <div key={section.id} className="gallery__section reveal" data-id={section.id}>
              <div className="gallery__section-head">
                <h3 className="gallery__section-title">{section.title}</h3>
                {'subtitle' in section && section.subtitle ? (
                  <p className="gallery__section-sub">{section.subtitle}</p>
                ) : null}
              </div>
              <PhotoDeck
                label={section.title}
                photos={section.photos.map((photo) => ({
                  src: photo.src,
                  alt: photo.alt,
                  orientation: photo.orientation,
                  contain: section.id === 'how-it-all-started',
                }))}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
