import { useState, useEffect } from 'react'

export default function CookiesBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => { localStorage.setItem('cookiesAccepted','true'); setVisible(false) }
  const decline = () => { localStorage.setItem('cookiesAccepted','false'); setVisible(false) }

  if (!visible) return null

  return (
    <div className="cookies-banner" style={{
      position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',
      zIndex:9999,width:'90%',maxWidth:'560px',
      background:'rgba(26,29,36,0.97)',backdropFilter:'blur(20px)',
      border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',
      padding:'24px',boxShadow:'0 8px 40px rgba(0,0,0,0.4)',
      display:'flex',flexDirection:'column',gap:'16px',
    }}>
      <p style={{color:'#94A3B8',fontSize:'0.875rem',lineHeight:1.6,margin:0}}>
        We use cookies to enhance your experience and analyse site traffic.
        By clicking <strong style={{color:'#F8FAFC'}}>Accept</strong>, you agree to our{' '}
        <a href="/cookie-policy" style={{color:'#e91e63'}}>Cookie Policy</a>.
      </p>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={accept} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#e91e63,#9c27b0)',color:'white',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>
          Accept
        </button>
        <button onClick={decline} style={{flex:1,padding:'10px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'#94A3B8',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>
          Decline
        </button>
      </div>
    </div>
  )
}
