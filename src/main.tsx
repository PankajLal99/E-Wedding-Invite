import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Admin from './pages/Admin'
import AdminRsvp from './pages/AdminRsvp'
import Rsvp from './pages/Rsvp'
import { features } from './config/features'
import { hostFamilyConfig } from './config/sides'
import './index.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'

const side = hostFamilyConfig()
document.documentElement.dataset.side = side.id
const pair = `${side.first} & ${side.second}`
document.title = `${pair} — Wedding`
document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', side.favicon)

function Root() {
  if (path === '/admin/rsvp') return <AdminRsvp />
  if (path === '/admin') return <Admin />
  if (path === '/rsvp') return <Rsvp />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)

// Soft console hint in local RSVP mode only
if (features.rsvp && import.meta.env.DEV) {
  console.info('[rsvp] enabled → /rsvp and /admin/rsvp')
}
