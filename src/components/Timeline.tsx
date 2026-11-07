import { useReveal } from '../hooks/useReveal'
import { useSite } from '../hooks/useSite'
import FloralCorners from './FloralCorners'
import './Timeline.css'

export default function Timeline() {
  const ref = useReveal<HTMLElement>()
  const { timeline, timelineVenue, date } = useSite()

  return (
    <section className="timeline-section" id="schedule" ref={ref}>
      <FloralCorners />
      <div className="container">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">Wedding day</p>
        <h2 className="section-title reveal">{date.weddingDay} Schedule</h2>
        <p className="section-subtitle reveal">
          {timelineVenue}
        </p>

        <div className="timeline">
          {timeline.map((item) => (
            <div key={item.title} className="timeline__item reveal">
              <div className="timeline__time">{item.time}</div>
              <div className="timeline__dot" />
              <div className="timeline__content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
