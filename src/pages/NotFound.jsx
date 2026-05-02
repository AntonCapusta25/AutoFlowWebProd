import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  useEffect(() => { document.title = '404 - AutoFlow Studio' }, [])
  return (
    <main className="main-content" style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px 20px'}}>
      <div>
        <h1 style={{fontSize:'6rem',fontWeight:900,background:'linear-gradient(135deg,#e91e63,#9c27b0)',WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1,margin:'0 0 16px'}}>404</h1>
        <h2 style={{color:'#F8FAFC',fontSize:'1.5rem',fontWeight:700,marginBottom:'16px'}}>Page Not Found</h2>
        <p style={{color:'#94A3B8',marginBottom:'32px',maxWidth:'400px',margin:'0 auto 32px'}}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="cta-button">Go Back Home</Link>
      </div>
    </main>
  )
}
