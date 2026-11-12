import { useRef } from 'react'
import { useSite } from '../hooks/useSite'
import FloralCorners from './FloralCorners'
import GuestWelcome from './GuestWelcome'
import Monogram from './Monogram'
import { SecretModal, useKonamiSecret } from './SecretModal'
import './Hero.css'

export default function Hero() {
  const { hero, names, date } = useSite()
  const { open, setOpen } = useKonamiSecret()
  const pressTimer = useRef<number | null>(null)

  const startPress = () => {
    pressTimer.current = window.setTimeout(() => setOpen(true), 1200)
  }
  const endPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
  }

  return (
    <section className="hero" id="home">
      <FloralCorners />

      <div className="hero__content">

        <GuestWelcome />

        <button
          type="button"
          className="hero__logo-btn fade-in"
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          aria-label={`${names.first} and ${names.second} monogram. Press and hold for a secret note.`}
        >
          <Monogram className="hero__logo" />
        </button>

        <p
          className="hero__tagline fade-in"
        >
          {hero.tagline}
        </p>

        <h1 className="hero__names fade-in">
          <span className="hero__name">{names.first}</span>
          <span className="hero__ampersand">&</span>
          <span className="hero__name">{names.second}</span>
        </h1>

        <p
          className="hero__closing fade-in"
        >
          {hero.closing}
        </p>
        <p className="hero__date fade-in">{date.short}</p>

        <div className="hero__actions fade-in">
          <a href="#events" className="btn btn-primary">
            View Schedule
          </a>
          <a href="#share" className="btn btn-ghost">
            Share Invite
          </a>
          <a href="#travel" className="btn btn-ghost">
            Travel Info
          </a>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>

      <SecretModal open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
