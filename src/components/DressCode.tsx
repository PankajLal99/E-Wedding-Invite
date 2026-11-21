import { useReveal } from '../hooks/useReveal'
import { useSite } from '../hooks/useSite'
import FloralCorners from './FloralCorners'
import './DressCode.css'

export default function DressCode() {
  const ref = useReveal<HTMLElement>()
  const { dressCode } = useSite()

  return (
    <section className="dress" id="dress-code" ref={ref}>
      <FloralCorners variant="compact" />
      <div className="container">
        <div className="section-ornament reveal">
          <span>✦</span>
        </div>
        <p className="section-kicker reveal">What to wear</p>
        <h2 className="section-title reveal">{dressCode.title}</h2>
        <p className="section-subtitle reveal">{dressCode.subtitle}</p>

        <ul className="dress__list">
          {dressCode.items.map((item) => (
            <li key={item.event} className="dress__item reveal">
              <p className="dress__event">{item.event}</p>
              <p className="dress__wear">{item.wear}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
