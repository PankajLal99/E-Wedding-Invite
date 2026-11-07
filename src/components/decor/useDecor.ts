import { useCallback, useEffect, useRef, useState } from 'react'
import { reducedMotion, track } from './motion'

export function useDecor<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return track(el)
  }, [])
  return ref
}

/** Short-lived interaction state (flutter / bloom) that can't re-trigger mid-play */
export function usePulse(durationMs: number) {
  const [on, setOn] = useState(false)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const trigger = useCallback(() => {
    if (on || reducedMotion()) return
    setOn(true)
    timer.current = window.setTimeout(() => setOn(false), durationMs)
  }, [on, durationMs])
  return [on, trigger] as const
}
