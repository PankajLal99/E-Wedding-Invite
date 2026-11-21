import { useEffect, useRef, useState } from 'react'

const TRACK = '/audio/aaj-sajeya.mp3'

/** Aaj Sajeya, looping. Browsers block sound until a tap, so the first touch starts it. */
export function useAmbientMusic() {
  const [muted, setMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wantsSound = useRef(true)

  useEffect(() => {
    const audio = new Audio(TRACK)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.85
    audioRef.current = audio

    const start = () => {
      if (!wantsSound.current || !audio.paused) return
      void audio.play().then(() => setMuted(false)).catch(() => {})
    }

    start()
    const onGesture = () => start()
    document.addEventListener('pointerdown', onGesture)
    document.addEventListener('keydown', onGesture)

    return () => {
      document.removeEventListener('pointerdown', onGesture)
      document.removeEventListener('keydown', onGesture)
      audio.pause()
      audioRef.current = null
    }
  }, [])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      wantsSound.current = true
      void audio.play().then(() => setMuted(false)).catch(() => setMuted(true))
      return
    }
    wantsSound.current = false
    audio.pause()
    setMuted(true)
  }

  return { muted, ready: true, toggleMute }
}
