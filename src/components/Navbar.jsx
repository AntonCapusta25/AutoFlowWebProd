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
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}>
        <div className="nav-container">
          <Link to={prefix || '/'} className="logo">
            Auto<span style={{ color: '#f06292' }}>Flow</span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links desktop-nav">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={location.pathname === to ? 'active' : ''}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            <div className="language-switch desktop-only">
              <button
                className={`lang-btn${lang === 'en' ? ' active' : ''}`}
                onClick={() => switchLang('en')}
              >
                EN
              </button>
              <button
                className={`lang-btn${lang === 'nl' ? ' active' : ''}`}
                onClick={() => switchLang('nl')}
              >
                NL
              </button>
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay${menuOpen ? ' active' : ''}`}>
        <ul className="mobile-nav-links">
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
          <li className="mobile-lang-li">
            <div className="mobile-lang-switch">
              <button
                className={lang === 'en' ? 'active' : ''}
                onClick={() => { switchLang('en'); setMenuOpen(false); }}
              >
                EN
              </button>
              <div className="divider"></div>
              <button
                className={lang === 'nl' ? 'active' : ''}
                onClick={() => { switchLang('nl'); setMenuOpen(false); }}
              >
                NL
              </button>
            </div>
          </li>
        </ul>
      </div>
    </>
  )
}
