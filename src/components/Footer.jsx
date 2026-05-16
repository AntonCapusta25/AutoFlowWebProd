import { Link, useLocation } from 'react-router-dom'
import { getT } from '../i18n/translations'

export default function Footer() {
  const location = useLocation()
  const isNl = location.pathname.startsWith('/nl')
  const lang = isNl ? 'nl' : 'en'
  const t = getT(lang)
  const prefix = isNl ? '/nl' : ''

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-flex">
          <div className="footer-branding">
            <Link to={prefix || '/'} className="footer-logo">AutoFlow Studio</Link>
            <p className="copyright">© 2026 AutoFlow Studio. {t.footer.rights}</p>
          </div>
          <div className="footer-col">
            <p className="footer-label">{t.footer.contact}</p>
            <a href="mailto:info@autoflowstudio.net" className="footer-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              info@autoflowstudio.net
            </a>
          </div>
          <div className="footer-col">
            <p className="footer-label">{t.footer.legal}</p>
            <Link to={prefix + "/privacy-policy"} className="footer-link">{t.footer.privacy}</Link>
            <Link to={prefix + "/cookie-policy"} className="footer-link">{t.footer.cookies}</Link>
            <Link to={prefix + "/contact"} className="footer-link">{t.footer.contact}</Link>
          </div>
          <div className="footer-col">
            <p className="footer-label">{t.footer.follow}</p>
            <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
              <a href="https://www.instagram.com/auto.flow25" target="_blank" rel="noreferrer" aria-label="Instagram"
                style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#e91e63,#9c27b0)',color:'white',transition:'transform 0.2s'}}
                onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/auto-flow-studio/" target="_blank" rel="noreferrer" aria-label="LinkedIn"
                style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#e91e63,#9c27b0)',color:'white',transition:'transform 0.2s'}}
                onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
