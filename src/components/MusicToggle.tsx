import { useAmbientMusic } from '../hooks/useAmbientMusic'
import './MusicToggle.css'

export default function MusicToggle() {
  const { muted, toggleMute } = useAmbientMusic()

  return (
    <button
      type="button"
      className={`music-toggle ${muted ? 'is-muted' : 'is-playing'}`}
      onClick={() => void toggleMute()}
      aria-label={muted ? 'Play soft music' : 'Mute music'}
      title={muted ? 'Play soft music' : 'Mute'}
    >
      <span className="music-toggle__icon" aria-hidden="true">
        {muted ? '♪' : '♫'}
      </span>
      <span className="music-toggle__text">{muted ? 'Music' : 'Mute'}</span>
    </button>
  )
}
