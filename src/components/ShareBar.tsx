import { currentSiteUrl } from '../config/sides'
import { useSite } from '../hooks/useSite'
import { useGuestDisplay } from '../hooks/useGuestInvite'
import { downloadCalendar, googleCalendarUrl } from '../utils/calendar'
import { formatDaysSummary, whatsappInviteText } from '../utils/invite'
import './ShareBar.css'

export default function ShareBar() {
  const guest = useGuestDisplay()
  const site = useSite()
  const inviteUrl = guest
    ? `${window.location.origin}${window.location.pathname}${window.location.search}`
    : currentSiteUrl()
  const days = guest?.invite.d

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    guest
      ? whatsappInviteText(guest.invite, inviteUrl)
      : `${site.share.text} ${inviteUrl}`
  )}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      alert(
        guest
          ? `Invite link copied for ${guest.lineEn}`
          : 'Invite link copied'
      )
    } catch {
      prompt('Copy this invite link:', inviteUrl)
    }
  }

  return (
    <section className="share-bar" id="share">
      <div className="container share-bar__inner">
        <p className="share-bar__label">Share · Calendar · Directions</p>
        <div className="share-bar__actions">
          <a className="btn btn-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            WhatsApp Share
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => downloadCalendar(days)}
          >
            Add to Calendar
          </button>
          <a
            className="btn btn-ghost"
            href={googleCalendarUrl(days)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Calendar
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => void copyLink()}>
            Copy Invite Link
          </button>
        </div>
        {guest && (
          <p className="share-bar__personal">
            Prepared for {guest.lineEn} — {formatDaysSummary(guest.invite.d)}
          </p>
        )}
      </div>
    </section>
  )
}
