import { useGuestInvite } from '../hooks/useGuestInvite'
import { useReveal } from '../hooks/useReveal'
import { useSite } from '../hooks/useSite'
import {
  daySetMeta,
  filterCelebrationDays,
  formatDaysSchedule,
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
  const lockedSlice = site.daySet !== 'all'

  const scheduleText = `${site.names.pair}\n\n${formatDaysSchedule(invite?.d, site.family)}`
  const scheduleHref = `https://wa.me/?text=${encodeURIComponent(scheduleText)}`

  return (
    <section className="events" id="events" ref={ref}>
      <FloralCorners />
      <div className="container">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">
          {meta.id === 'reception' || site.daySet === 'reception'
            ? 'The evening'
            : 'The celebrations'}
        </p>
        <h2 className="section-title reveal">{site.eventsTitle}</h2>
        <p className="section-subtitle reveal">
          {personalized || lockedSlice
            ? formatDaysSummary(invite?.d)
            : site.eventsSubtitle}
        </p>
        {personalized && meta.id !== 'all' && !lockedSlice && (
          <p className="events__personal-note reveal">Showing the days you are invited to</p>
        )}

        <p className="events__send reveal">
          <a className="btn btn-primary" href={scheduleHref} target="_blank" rel="noopener noreferrer">
            Send schedule to yourself
          </a>
        </p>

        <div className="events__days">
          {celebrationDays.map((day) => {
            return day.events.map((event) => {
              const venue = venues[event.venueKey ?? day.venueKey]
              const sessions = event.sessions
              return (
                <article key={`${day.dateShort}-${event.name}`} className="day-event reveal">
                  <div className="day-event__top">
                    <h3 className="day-event__name">{event.name}</h3>
                    <p className="day-event__date">{day.date}</p>

                    {sessions && sessions.length > 0 ? (
                      <p className="day-event__sessions">
                        {sessions.map((session, index) => (
                          <span key={`${session.label}-${session.time}`} className="day-event__session">
                            {index > 0 && <span className="day-event__session-sep" aria-hidden="true">·</span>}
                            <span className="day-event__session-label">{session.label}</span>
                            <time className="day-event__session-time">{session.time}</time>
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="day-event__time">
                        <time>{event.time}</time>
                      </p>
                    )}
                  </div>

                  {event.blurb && <p className="day-event__blurb">{event.blurb}</p>}

                  {venue && (
                    <div className="day-event__venue">
                      <strong>{venue.name}</strong>
                      <p>{venue.address}</p>
                    </div>
                  )}
                </article>
              )
            })
          })}
        </div>
      </div>
    </section>
  )
}
