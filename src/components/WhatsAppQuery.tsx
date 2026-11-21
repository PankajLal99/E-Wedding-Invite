import { useSite } from '../hooks/useSite'
import './WhatsAppQuery.css'

export default function WhatsAppQuery() {
  const { queryPhone, names } = useSite()
  if (!queryPhone) return null

  const text = `Hello, I have a question about ${names.pair}'s wedding.`
  const href = `https://wa.me/${queryPhone}?text=${encodeURIComponent(text)}`

  return (
    <a
      className="wa-query"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      WhatsApp
    </a>
  )
}
