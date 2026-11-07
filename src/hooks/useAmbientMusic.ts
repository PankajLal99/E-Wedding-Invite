import { useEffect, useRef, useState } from 'react'

/** Soft generative pad — no copyrighted track needed */
export function useAmbientMusic() {
  const [muted, setMuted] = useState(true)
  const [ready, setReady] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ gain: GainNode; osc: OscillatorNode[] } | null>(null)

  useEffect(() => {
    return () => {
      nodesRef.current?.osc.forEach((o) => {
        try {
          o.stop()
        } catch {
          /* already stopped */
        }
      })
      void ctxRef.current?.close()
    }
  }, [])

  const ensureAudio = async () => {
    if (ctxRef.current && nodesRef.current) return ctxRef.current

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    const freqs = [174.61, 220.0, 261.63] // soft F3 A3 C4
    const oscs = freqs.map((f, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = i === 0 ? 'sine' : 'triangle'
      osc.frequency.value = f
      g.gain.value = 0.04 - i * 0.008
      osc.connect(g)
      g.connect(master)
      osc.start()
      return osc
    })

    ctxRef.current = ctx
    nodesRef.current = { gain: master, osc: oscs }
    setReady(true)
    return ctx
  }

  const toggleMute = async () => {
    const ctx = await ensureAudio()
    if (ctx.state === 'suspended') await ctx.resume()
    const gain = nodesRef.current!.gain.gain
    const nextMuted = !muted
    const now = ctx.currentTime
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now)
    gain.linearRampToValueAtTime(nextMuted ? 0 : 0.12, now + 0.6)
    setMuted(nextMuted)
  }

  return { muted, ready, toggleMute }
}
