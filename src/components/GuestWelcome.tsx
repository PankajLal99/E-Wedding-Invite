import { useGuestDisplay } from '../hooks/useGuestInvite'
import {
  formatDaysSummary,
  inviteRequestLine,
} from '../utils/invite'
import './GuestWelcome.css'

export default function GuestWelcome() {
  const guest = useGuestDisplay()
  if (!guest) return null

  return (
    <div className="guest-welcome" role="status">
      <p className="guest-welcome__hi">
        Dear <strong>{guest.line}</strong>,
      </p>
      <p className="guest-welcome__invite">
        {`${inviteRequestLine(guest.invite)}.`}
      </p>
      <p className="guest-welcome__days">
        {formatDaysSummary(guest.invite.d)}
      </p>
    </div>
  )
}
