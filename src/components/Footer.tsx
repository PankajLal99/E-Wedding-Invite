import { useSite } from '../hooks/useSite'
import FloralCorners from './FloralCorners'
import Monogram from './Monogram'
import './Footer.css'

export default function Footer() {
  const { names, date, footer, credit, hashtag } = useSite()

  return (
    <footer className="footer patch">
      <FloralCorners />
      <div className="container">
        <Monogram className="footer__logo" />
        <p className="footer__invite">JOIN US IN CELEBRATING</p>
        <p className="footer__names">{names.pair}</p>
        <p className="footer__message">{footer.message}</p>
        <p className="footer__date">{date.short}</p>
        <p className="footer__note">
          Your presence and blessings mean the world to us.
        </p>
        <p className="footer__hashtag">{hashtag}</p>
        <p className="footer__credit">{credit.line}</p>
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} {names.pair}
        </p>
      </div>
    </footer>
  )
}
