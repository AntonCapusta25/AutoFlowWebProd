import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getT } from '../i18n/translations'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Detect current language from URL prefix
  const isNl = location.pathname.startsWith('/nl')
  const lang = isNl ? 'nl' : 'en'
  const prefix = isNl ? '/nl' : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Switch language while staying on same relative path
  const switchLang = (toLang) => {
    const currentPath = location.pathname
    if (toLang === 'nl') {
      if (!currentPath.startsWith('/nl')) {
        navigate('/nl' + (currentPath === '/' ? '' : currentPath))
      }
    } else {
      if (currentPath.startsWith('/nl')) {
        const rest = currentPath.slice(3) || '/'
        navigate(rest)
      }
    }
  }

  const t = getT(lang)

  const navLinks = [
    { to: prefix || '/',   label: t.nav.home },
    { to: prefix + '/blog', label: t.nav.blog },
    { to: prefix + '/portfolio', label: t.nav.portfolio },
    { to: prefix + '/contact', label: t.nav.contact },
  ]

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        <Link to={prefix || '/'} className="logo">
          Auto<span style={{ color: '#f06292' }}>Flow</span>
        </Link>

        <ul className={`nav-links${menuOpen ? ' active' : ''}`}>
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={location.pathname === to ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Language switcher */}
        <div className="language-switch">
          <button
            className={`lang-btn${lang === 'en' ? ' active' : ''}`}
            onClick={() => switchLang('en')}
            aria-label="Switch to English"
          >
            EN
          </button>
          <button
            className={`lang-btn${lang === 'nl' ? ' active' : ''}`}
            onClick={() => switchLang('nl')}
            aria-label="Switch to Nederlands"
          >
            NL
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  )
}
