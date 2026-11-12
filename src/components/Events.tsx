import { useReveal } from '../hooks/useReveal'
import { useGuestInvite } from '../hooks/useGuestInvite'
import { useSite } from '../hooks/useSite'
import {
  daySetMeta,
  filterCelebrationDays,
  formatDaysSummary,
} from '../utils/invite'
import FloralCorners from './FloralCorners'
import './Events.css'

export default function Events() {
  const ref = useReveal<HTMLElement>()
  const invite = useGuestInvite()
  const site = useSite()
  const { venues } = site
  const celebrationDays = filterCelebrationDays(invite?.d, site.family)
  const meta = daySetMeta(invite?.d)
  const personalized = Boolean(invite)

  return (
    <section className="events" id="events" ref={ref}>
      <FloralCorners />
      <div className="container">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">The celebrations</p>
        <h2 className="section-title reveal">{site.eventsTitle}</h2>
        <p className="section-subtitle reveal">
          {personalized
            ? formatDaysSummary(invite?.d)
            : site.eventsSubtitle}
        </p>
        {personalized && meta.id !== 'all' && (
          <p className="events__personal-note reveal">
            Showing the days you are invited to
          </p>
        )}

        <div className="events__days">
          {celebrationDays.map((day, i) => {
            const venue = venues[day.venueKey]
            const showDayNumber = celebrationDays.length > 1
            const dayLabel = showDayNumber
              ? `Day ${String(i + 1).padStart(2, '0')}`
              : null
            return (
              <article
                key={day.dateShort}
                className="day-block reveal"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <header className="day-block__header">
                  <div>
                    {dayLabel && (
                      <p className="day-block__label">{dayLabel}</p>
                    )}
                    <h3 className="day-block__date">
                      <span className="day-block__date-num">
                        {day.dateShort.split(' ')[0]}
                      </span>
                      <span className="day-block__date-script">
                        {day.dateShort.split(' ').slice(1).join(' ')}
                      </span>
                    </h3>
                    <p className="day-block__fulldate">{day.date}</p>
                  </div>
                  {venue && (
                    <div className="day-block__venue">
                      <strong>{venue.name}</strong>
                      <p>{venue.address}</p>
                      <div className="day-block__maps">
                        <a
                          href={venue.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="day-block__map"
                        >
                          Google Maps
                        </a>
                        <a
                          href={venue.appleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="day-block__map"
                        >
                          Apple Maps
                        </a>
                      </div>
                    </div>
                  )}
                </header>

                <ul className="day-block__list">
                  {day.events.map((event) => (
                    <li key={event.name} className="day-event">
                      <div className="day-event__names">
                        <span className="day-event__en">{event.name}</span>
                        {event.note && (
                          <span className="day-event__note">{event.note}</span>
                        )}
                      </div>
                      <time className="day-event__time">{event.time}</time>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
