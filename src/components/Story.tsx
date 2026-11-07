import { useReveal } from '../hooks/useReveal'
import { useSite } from '../hooks/useSite'
import FloralCorners from './FloralCorners'
import './Story.css'

export default function Story() {
  const ref = useReveal<HTMLElement>()
  const { story } = useSite()

  return (
    <section className="story" id="story" ref={ref}>
      <FloralCorners />
      <div className="container">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">How we began</p>
        <h2 className="section-title reveal">{story.title}</h2>
        <p className="section-subtitle reveal">{story.subtitle}</p>

        <div className="story__content">
          <div className="story__text reveal">
            {story.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="story__timeline reveal">
            {story.milestones.map((m) => (
              <div key={m.year} className="story__milestone">
                <span className="story__year">{m.year}</span>
                <span className="story__event">{m.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
