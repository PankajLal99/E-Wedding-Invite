import { useState, useEffect } from 'react'
import { useSite } from '../hooks/useSite'
import Monogram from './Monogram'
import './Navbar.css'

export default function Navbar() {
  const site = useSite()
  const { names } = site
  const navLinks = [
    { label: 'Events', href: '#events' },
    { label: 'Family', href: '#family' },
    { label: 'Story', href: '#story' },
    ...(site.gallery.sections.some((s) => s.photos.length > 0)
      ? [{ label: 'Gallery', href: '#gallery' }]
      : []),
    { label: 'Travel', href: '#travel' },
    ...(site.family === 'groom' ? [{ label: 'FAQ', href: '#faq' }] : []),
    { label: 'Blessings', href: '#blessings' },
  ]
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`navbar ${scrolled || menuOpen ? 'navbar--solid' : ''}`}>
      <div className="navbar__inner container--wide">
        <a href="#home" className="navbar__brand" onClick={closeMenu}>
          <Monogram variant="badge" className="navbar__logo" />
          <span className="navbar__names">{names.pair}</span>
        </a>

        <button
          className={`navbar__toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`navbar__links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
