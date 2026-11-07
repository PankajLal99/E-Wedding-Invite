import { useGuestDisplay } from '../hooks/useGuestInvite'
import {
  formatDaysSummary,
  inviteRequestLine,
  isGroupInvite,
} from '../utils/invite'
import './GuestWelcome.css'

export default function GuestWelcome() {
  const guest = useGuestDisplay()
  if (!guest) return null

  const group = isGroupInvite(guest.invite)

  return (
    <div className="guest-welcome" role="status">
      <p className="guest-welcome__hi" lang="hi">
        {group ? (
          <>
            प्रिय <strong>परिवार व मित्रों</strong>,
          </>
        ) : (
          <>
            आदरणीय <strong>{guest.lineHi}</strong>,
          </>
        )}
      </p>
      <p className="guest-welcome__invite" lang="hi">
        {`${inviteRequestLine(guest.invite)}।`}
      </p>
      <p className="guest-welcome__days">
        {formatDaysSummary(guest.invite.d)}
      </p>
    </div>
  )
}
