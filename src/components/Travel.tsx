import { useReveal } from '../hooks/useReveal'
import { useGuestInvite } from '../hooks/useGuestInvite'
import { useSite } from '../hooks/useSite'
import { filterCelebrationDays, normalizeDaySet } from '../utils/invite'
import FloralCorners from './FloralCorners'
import './Travel.css'

export default function Travel() {
  const ref = useReveal<HTMLElement>()
  const invite = useGuestInvite()
  const site = useSite()
  const { travel, venues } = site
  const daySet = normalizeDaySet(invite?.d)
  const days = filterCelebrationDays(invite?.d, site.family)

  const departure = travel.departure
  const showDeparture = Boolean(departure) && daySet === 'all'

  const venueChips = days.reduce<
    Array<{ key: string; city: string; dates: string[]; venue: (typeof venues)[string] }>
  >((list, day) => {
    const venue = venues[day.venueKey]
    if (!venue) return list
    const existing = list.find((item) => item.key === day.venueKey)
    if (existing) existing.dates.push(day.dateShort)
    else list.push({ key: day.venueKey, city: day.city, dates: [day.dateShort], venue })
    return list
  }, [])

  const chipLabel = (dates: string[], city: string) => {
    if (dates.length === 1) return `${dates[0]} · ${city}`
    const first = dates[0].split(' ')[0]
    const last = dates[dates.length - 1]
    return `${first}–${last} · ${city}`
  }

  return (
    <section className="travel" id="travel" ref={ref}>
      <FloralCorners variant="compact" />
      <div className="container travel__content">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">Getting there</p>
        <h2 className="section-title reveal">{travel.title}</h2>
        <p className="section-subtitle reveal">
          {daySet === 'all'
            ? travel.note
            : `Your celebrations are at ${venues.resort.name}, ${venues.resort.shortAddress}.`}
        </p>

        {showDeparture && departure && (
          <div className="travel__leave reveal">
            <p className="travel__leave-label">{departure.label}</p>
            <p>{departure.text}</p>
            <ul className="travel-mode__distances travel__leave-facts">
              <li>
                <span>From</span>
                <strong>{departure.from}</strong>
              </li>
              <li>
                <span>To</span>
                <strong>{departure.to}</strong>
              </li>
              <li>
                <span>Distance</span>
                <strong>{departure.distance}</strong>
              </li>
              <li>
                <span>Route</span>
                <strong>{departure.route}</strong>
              </li>
            </ul>
            <a
              href={departure.link}
              target="_blank"
              rel="noopener noreferrer"
              className="travel-mode__link"
            >
              Open route in Google Maps →
            </a>
          </div>
        )}

        <div className="travel__venues reveal">
          {venueChips.map((chip) => (
            <div className="venue-chip" key={chip.key}>
              <span>{chipLabel(chip.dates, chip.city)}</span>
              <strong>{chip.venue.name}</strong>
              <p>{chip.venue.address}</p>
              <div className="venue-chip__maps">
                <a
                  href={chip.venue.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Maps
                </a>
                <a
                  href={chip.venue.appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apple Maps
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="travel__modes">
          {travel.modes.map((item) => (
            <article key={item.name} className="travel-mode reveal">
              <p className="travel-mode__label">{item.mode}</p>
              <h3 className="travel-mode__name">{item.name}</h3>
              <p className="travel-mode__detail">{item.detail}</p>
              <ul className="travel-mode__distances">
                {item.distances.map((d) => (
                  <li key={d.to}>
                    <span>{d.to}</span>
                    <strong>{d.value}</strong>
                  </li>
                ))}
              </ul>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="travel-mode__link"
              >
                Open location →
              </a>
            </article>
          ))}
        </div>
        <p className="travel__fineprint reveal">{site.distanceNote}</p>
      </div>
    </section>
  )
}
