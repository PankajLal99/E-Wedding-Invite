import { useReveal } from '../hooks/useReveal'
import { useGuestInvite } from '../hooks/useGuestInvite'
import { useSite } from '../hooks/useSite'
import { resolveDaySet } from '../utils/invite'
import FloralCorners from './FloralCorners'
import './Travel.css'

function embedSrc(lat: number, lng: number, label: string) {
  const query = encodeURIComponent(`${label}@${lat},${lng}`)
  return `https://maps.google.com/maps?q=${query}&z=16&output=embed`
}

export default function Travel() {
  const ref = useReveal<HTMLElement>()
  const invite = useGuestInvite()
  const site = useSite()
  const { travel, venues } = site
  const daySet = resolveDaySet(invite?.d)

  const departure = travel.departure
  const showDeparture = Boolean(departure) && daySet === 'all'

  const pins = travel.pinKeys
    .map((key) => venues[key])
    .filter((venue): venue is (typeof venues)[string] => Boolean(venue))
    .filter((venue) => {
      if (daySet === 'all') return true
      // Resort-only invites (reception / 22 / 22–23 / 23): show the venue pin
      return venue === venues.resort
    })

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
            <ul className="travel__leave-facts">
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
          </div>
        )}

        <div className="travel__pins">
          {pins.map((venue) => (
            <article key={venue.pinTitle} className="travel-pin reveal">
              <div className="travel-pin__copy">
                <h3 className="travel-pin__title">{venue.pinTitle}</h3>
                <p className="travel-pin__address">{venue.address}</p>
                <div className="travel-pin__maps">
                  <a
                    href={venue.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="travel-pin__map-btn"
                  >
                    Google Maps
                  </a>
                  <a
                    href={venue.appleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="travel-pin__map-btn"
                  >
                    Apple Maps
                  </a>
                </div>
              </div>
              <div className="travel-pin__map">
                <iframe
                  title={`Map · ${venue.pinTitle}`}
                  src={embedSrc(venue.lat, venue.lng, venue.pinTitle)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
