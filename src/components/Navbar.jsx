import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getT } from '../i18n/translations'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  
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

  // Close menu and dropdown on route change
  useEffect(() => { 
    setMenuOpen(false) 
    setSolutionsOpen(false)
  }, [location.pathname])

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

  const solutionsList = [
    { to: prefix + '/solutions/b2b-automation', label: isNl ? 'B2B Automatisering' : 'B2B Operations' },
    { to: prefix + '/solutions/horeca-hospitality', label: isNl ? 'Horeca & Hospitality' : 'Horeca & Hospitality' },
    { to: prefix + '/solutions/marketing-agency', label: isNl ? 'Digital Marketing Bureau' : 'Digital Marketing Agency' },
  ]

  const isSolutionsPage = location.pathname.includes('/solutions')
  const isB2bPage = location.pathname.includes('/solutions/b2b-automation')
  const isHorecaOrMarketing = location.pathname.includes('/solutions/horeca-hospitality') || location.pathname.includes('/solutions/marketing-agency')

  let logoSrc = '/images/logo.webp'
  if (isB2bPage) {
    logoSrc = '/images/logo_blue.png'
  } else if (isHorecaOrMarketing) {
    logoSrc = '/images/logo_red.png'
  }

  const activeColor = isB2bPage ? '#1d4ed8' : (isHorecaOrMarketing ? '#be123c' : 'var(--primary-color)')
  const activeBg = isB2bPage ? 'rgba(59, 130, 246, 0.12)' : (isHorecaOrMarketing ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 255, 255, 0.2)')

  return (
    <>
      <style>{`
        .nav-dropdown-item {
            position: relative;
        }
        .dropdown-toggle-btn:hover {
            background: ${isSolutionsPage ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.2)'} !important;
            transform: translateY(-2px);
        }
        .dropdown-arrow {
            display: inline-block;
            transition: transform 0.3s ease;
        }
        .dropdown-arrow.open {
            transform: rotate(180deg);
        }
        .nav-dropdown-menu {
            position: absolute;
            top: calc(100% + 12px);
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            background: ${isSolutionsPage ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 10, 15, 0.95)'};
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid ${isSolutionsPage ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.08)'};
            border-radius: 18px;
            padding: 10px;
            min-width: 260px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            box-shadow: ${isSolutionsPage ? '0 20px 40px -15px rgba(0, 0, 0, 0.12)' : '0 20px 40px -15px rgba(0, 0, 0, 0.6)'};
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
            z-index: 10000;
        }
        .nav-dropdown-menu::before {
            content: '';
            position: absolute;
            top: -16px;
            left: 0;
            right: 0;
            height: 16px;
            background: transparent;
        }
        .nav-dropdown-menu.show {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(-50%) translateY(0);
        }
        .dropdown-sub-link {
            padding: 12px 16px;
            border-radius: 10px;
            color: ${isSolutionsPage ? '#475569' : '#cbd5e1'};
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
            white-space: nowrap;
            text-align: left;
            display: block;
        }
        .dropdown-sub-link:hover {
            background: ${isSolutionsPage ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.06)'};
            color: ${isSolutionsPage ? '#0f172a' : 'white'};
            padding-left: 20px;
        }
        .dropdown-sub-link.sub-active {
            background: ${activeBg};
            color: ${activeColor};
            font-weight: 700;
        }

        /* Solutions light page overrides */
        ${isSolutionsPage ? `
          nav.navbar {
            background: rgba(255, 255, 255, 0.88) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(15, 23, 42, 0.1) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
          }
          nav.navbar.scrolled {
            background: rgba(255, 255, 255, 0.96) !important;
            border-color: rgba(15, 23, 42, 0.15) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
          }
          .nav-links a {
            color: #0f172a !important;
            text-shadow: none !important;
          }
          .nav-links a:hover,
          .nav-links a.active {
            background: ${activeBg} !important;
            color: ${activeColor} !important;
          }
          .dropdown-toggle-btn {
            color: #0f172a !important;
            text-shadow: none !important;
          }
          .dropdown-toggle-btn.active {
            background: ${activeBg} !important;
            color: ${activeColor} !important;
          }
          .language-switch {
            background: rgba(15, 23, 42, 0.06) !important;
            border: 1px solid rgba(15, 23, 42, 0.1) !important;
          }
          .lang-btn {
            color: #475569 !important;
          }
          .lang-btn:hover {
            color: #0f172a !important;
            background: rgba(15, 23, 42, 0.05) !important;
          }
          .lang-btn.active {
            background: ${activeColor} !important;
            color: #ffffff !important;
            box-shadow: 0 4px 12px ${isB2bPage ? 'rgba(59, 130, 246, 0.3)' : 'rgba(244, 63, 94, 0.3)'} !important;
          }
          .mobile-menu-btn {
            color: #0f172a !important;
          }
        ` : ''}

        @media (max-width: 768px) {
            .desktop-nav {
                display: none !important;
            }
        }
      `}</style>

      <nav className={`navbar${scrolled ? ' scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}>
        <div className="nav-container">
          <Link to={prefix || '/'} className="logo" aria-label="AutoFlow Studio Home">
            <img src={logoSrc} alt="AutoFlow Studio" width="36" height="36" style={{ height: '36px', width: 'auto', display: 'block', borderRadius: isSolutionsPage ? '50%' : '0' }} />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links desktop-nav">
            <li>
              <Link to={prefix || '/'} className={location.pathname === (prefix || '/') ? 'active' : ''}>
                {t.nav.home}
              </Link>
            </li>
            
            {/* Solutions Dropdown Trigger */}
            <li 
              className="nav-dropdown-item"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button 
                onClick={() => setSolutionsOpen(o => !o)}
                className={`dropdown-toggle-btn ${location.pathname.includes('/solutions') ? 'active' : ''}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontWeight: 500,
                  padding: '10px 15px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              >
                {t.nav.solutions}
                <span className={`dropdown-arrow ${solutionsOpen ? 'open' : ''}`}>▾</span>
              </button>

              <div className={`nav-dropdown-menu ${solutionsOpen ? 'show' : ''}`}>
                {solutionsList.map(s => (
                  <Link 
                    key={s.to}
                    to={s.to}
                    className={`dropdown-sub-link ${location.pathname === s.to ? 'sub-active' : ''}`}
                    onClick={() => setSolutionsOpen(false)}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </li>

            <li>
              <Link to={prefix + '/blog'} className={location.pathname.startsWith(prefix + '/blog') ? 'active' : ''}>
                {t.nav.blog}
              </Link>
            </li>
            <li>
              <Link to={prefix + '/portfolio'} className={location.pathname.startsWith(prefix + '/portfolio') ? 'active' : ''}>
                {t.nav.portfolio}
              </Link>
            </li>
            <li>
              <Link to={prefix + '/contact'} className={location.pathname === (prefix + '/contact') ? 'active' : ''}>
                {t.nav.contact}
              </Link>
            </li>
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
          <li>
            <Link to={prefix || '/'} className={location.pathname === (prefix || '/') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              {t.nav.home}
            </Link>
          </li>
          
          {/* Mobile solutions collapsible accordion */}
          <li className="mobile-dropdown-item" style={{ width: '100%' }}>
            <button 
              className="mobile-dropdown-btn" 
              onClick={() => setSolutionsOpen(o => !o)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 600,
                width: '100%',
                textAlign: 'left',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{t.nav.solutions}</span>
              <span style={{ transform: solutionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
            </button>
            
            <div 
              style={{
                maxHeight: solutionsOpen ? '320px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                paddingLeft: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {solutionsList.map(s => (
                <Link
                  key={s.to}
                  to={s.to}
                  className={`mobile-sub-link ${location.pathname === s.to ? 'active' : ''}`}
                  onClick={() => { setSolutionsOpen(false); setMenuOpen(false); }}
                  style={{
                    color: location.pathname === s.to ? 'white' : '#94a3b8',
                    fontSize: '1.15rem',
                    textDecoration: 'none',
                    padding: '8px 24px',
                    display: 'block'
                  }}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </li>

          <li>
            <Link to={prefix + '/blog'} className={location.pathname.startsWith(prefix + '/blog') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              {t.nav.blog}
            </Link>
          </li>
          <li>
            <Link to={prefix + '/portfolio'} className={location.pathname.startsWith(prefix + '/portfolio') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              {t.nav.portfolio}
            </Link>
          </li>
          <li>
            <Link to={prefix + '/contact'} className={location.pathname === (prefix + '/contact') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              {t.nav.contact}
            </Link>
          </li>
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
