import { useReveal } from '../hooks/useReveal'
import { useSite } from '../hooks/useSite'
import './OursNote.css'

export default function OursNote() {
  const ref = useReveal<HTMLElement>()
  const { ours } = useSite()

  return (
    <section className="ours-note" ref={ref} aria-label="A note from us">
      <div className="container ours-note__inner reveal" lang="hi">
        {ours.lines.map((line) => (
          <p key={line} className="ours-note__line">
            {line}
          </p>
        ))}
        <p className="ours-note__sign">{ours.signOff}</p>
      </div>
    </section>
  )
}
