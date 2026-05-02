import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const links = [
    { to: '/', label: 'Home' },
    { to: '/blog', label: 'Blog' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <nav style={{
        position:'fixed',top:'20px',left:'50%',transform:'translateX(-50%)',
        width:'90%',maxWidth:'1000px',zIndex:50,borderRadius:'20px',
        padding:'10px 24px',display:'flex',justifyContent:'space-between',
        alignItems:'center',border:'1px solid rgba(255,255,255,0.1)',
        backgroundColor:'rgba(15,17,21,0.85)',backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
        transition:'all 0.3s',
      }}>
        <Link to="/" style={{display:'flex',alignItems:'center',textDecoration:'none'}}>
          <span style={{fontSize:'20px',fontWeight:700,color:'#F8FAFC'}}>AutoFlow Studio</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links" style={{display:'flex',alignItems:'center',gap:'32px',fontWeight:500,fontSize:'14px',letterSpacing:'0.05em'}}>
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`nav-item${pathname===l.to?' active':''}`}
              style={{color: pathname===l.to?'#F8FAFC':'#94A3B8',textDecoration:'none',transition:'color 0.2s',position:'relative',fontWeight: pathname===l.to?600:500}}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(o=>!o)}
          style={{display:'none',background:'none',border:'none',cursor:'pointer',padding:'8px',zIndex:60}}>
          {mobileOpen
            ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>

        {/* Book Audit CTA */}
        <div style={{display:'flex',alignItems:'center',gap:'16px'}} className="nav-actions">
          <a href="https://autoflow.neetocal.com/meeting-with-auto-flow" target="_blank" rel="noreferrer"
            style={{background:'linear-gradient(135deg,#e91e63 0%,#9c27b0 100%)',color:'white',padding:'10px 24px',borderRadius:'9999px',fontWeight:600,fontSize:'14px',boxShadow:'0 4px 15px rgba(233,30,99,0.2)',textDecoration:'none',display:'inline-block',border:'1px solid rgba(255,255,255,0.1)',transition:'all 0.3s'}}
            onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 20px rgba(233,30,99,0.3)'}}
            onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 15px rgba(233,30,99,0.2)'}}>
            Book Audit
          </a>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div onClick={()=>setMobileOpen(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:49}} />
      )}

      {/* Mobile sidebar */}
      <div className="mobile-menu-sidebar" style={{
        position:'fixed',top:0,right: mobileOpen?0:'-100%',width:'280px',height:'100vh',
        background:'rgba(26,29,36,0.98)',backdropFilter:'blur(20px)',
        display:'flex',flexDirection:'column',alignItems:'flex-start',
        padding:'80px 30px 30px',gap:'24px',
        boxShadow:'-5px 0 25px rgba(0,0,0,0.1)',
        transition:'right 0.3s cubic-bezier(0.4,0,0.2,1)',zIndex:55,
      }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`nav-item${pathname===l.to?' active':''}`}
            style={{fontSize:'18px',fontWeight:600,color:'#F8FAFC',textDecoration:'none',width:'100%',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            {l.label}
          </Link>
        ))}
        <a href="https://autoflow.neetocal.com/meeting-with-auto-flow" target="_blank" rel="noreferrer"
          style={{marginTop:'16px',background:'linear-gradient(135deg,#e91e63,#9c27b0)',color:'white',padding:'12px 24px',borderRadius:'9999px',fontWeight:600,fontSize:'15px',textDecoration:'none',textAlign:'center',width:'100%'}}>
          Book Free Audit
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-actions { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}
