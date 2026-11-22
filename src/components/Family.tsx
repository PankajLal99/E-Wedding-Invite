import { useReveal } from '../hooks/useReveal'
import { useSite } from '../hooks/useSite'
import FloralCorners from './FloralCorners'
import { useLightbox } from './Lightbox'
import './Family.css'

export default function Family() {
  const ref = useReveal<HTMLElement>()
  const lightbox = useLightbox()
  const { parents, hostFamily } = useSite()

  return (
    <section className="family" id="family" ref={ref}>
      <FloralCorners variant="compact" />
      <div className="container">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">With their families</p>
        <h2 className="section-title reveal">The families</h2>
        <p className="section-subtitle reveal">
          {parents.own.who}, {parents.own.childOf.toLowerCase()} {parents.own.names}.{' '}
          {parents.inLaws.who}, {parents.inLaws.childOf.toLowerCase()} {parents.inLaws.names}.
        </p>

        <div className="family__parents">
          {[parents.own, parents.inLaws].map((person) => (
            <article key={person.heading} className="family__card reveal">
              <p className="family__label">{person.heading}</p>
              <h3>{person.names}</h3>
              <p>{person.label}</p>
            </article>
          ))}
        </div>

        {hostFamily && (
          <div className="family__hosts reveal">
            <p className="family__blessing">{hostFamily.blessing}</p>
            {hostFamily.blessingPhoto && (
              <figure className="family__blessing-photo">
                <button
                  type="button"
                  className="family__photo-btn"
                  aria-label={`Open photo: ${hostFamily.blessingPhoto.alt}`}
                  onClick={() =>
                    lightbox.open({
                      src: hostFamily.blessingPhoto!.src,
                      alt: hostFamily.blessingPhoto!.alt,
                    })
                  }
                >
                  <div className="photo-frame">
                    <div className="photo-frame__mat">
                      <img
                        src={hostFamily.blessingPhoto.src}
                        alt={hostFamily.blessingPhoto.alt}
                        loading="lazy"
                        decoding="async"
                        width={960}
                        height={630}
                      />
                    </div>
                  </div>
                </button>
              </figure>
            )}

            <h3 className="family__group-title">{hostFamily.hostsTitle}</h3>
            <ul className="family__names">
              {hostFamily.hosts.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>

            <h3 className="family__group-title">{hostFamily.awaitingTitle}</h3>
            <p className="family__line">{hostFamily.awaiting}</p>

            {'nanihalTitle' in hostFamily &&
              hostFamily.nanihalTitle &&
              'nanihal' in hostFamily &&
              hostFamily.nanihal && (
                <>
                  <h3 className="family__group-title">{hostFamily.nanihalTitle}</h3>
                  <p className="family__line">{hostFamily.nanihal}</p>
                </>
              )}

            <h3 className="family__group-title">{hostFamily.memoryTitle}</h3>
            <p className="family__line">{hostFamily.memory}</p>

            <h3 className="family__group-title">{hostFamily.workTitle}</h3>
            <ul className="family__names">
              {hostFamily.work.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>

            {hostFamily.address && (
              <p className="family__address">{hostFamily.address}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
