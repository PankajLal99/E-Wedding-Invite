/** Feature flags — keep RSVP off for the live wedding build */
export const features = {
  rsvp:
    String(import.meta.env.VITE_RSVP_ENABLED || '').toLowerCase() === 'true',
  /**
   * API origin. Leave empty in .env.local to use the Vite proxy (`/api/rsvp`).
   * Or set e.g. http://localhost:8787
   */
  rsvpApiBase: String(import.meta.env.VITE_RSVP_API_BASE || '').replace(
    /\/$/,
    ''
  ),
  rsvpAdminToken: String(import.meta.env.VITE_RSVP_ADMIN_TOKEN || ''),
}

export function rsvpUrl(path: string) {
  const base = features.rsvpApiBase
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
