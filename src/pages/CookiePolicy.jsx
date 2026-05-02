import { useEffect } from 'react'
export default function CookiePolicy() {
  useEffect(() => { document.title = 'Cookie Policy - AutoFlow Studio' }, [])
  return (
    <main className="main-content policy-page">
      <div className="container" style={{maxWidth:'800px',padding:'120px 20px 80px'}}>
        <h1 style={{color:'#F8FAFC',marginBottom:'32px'}}>Cookie Policy</h1>
        <div style={{color:'#94A3B8',lineHeight:1.8,fontSize:'0.95rem'}}>
          <p style={{marginBottom:'24px'}}>Last updated: January 2026</p>
          <h2 style={{color:'#F8FAFC',marginBottom:'12px',fontSize:'1.2rem'}}>What Are Cookies</h2>
          <p style={{marginBottom:'24px'}}>Cookies are small text files stored on your device when you visit a website. They help us understand how you use our site and improve your experience.</p>
          <h2 style={{color:'#F8FAFC',marginBottom:'12px',fontSize:'1.2rem'}}>Cookies We Use</h2>
          <p style={{marginBottom:'24px'}}><strong style={{color:'#F8FAFC'}}>Essential cookies</strong> — required for the site to function (e.g., remembering your cookie preference).<br /><strong style={{color:'#F8FAFC'}}>Analytics cookies</strong> — Microsoft Clarity to understand user behaviour and improve UX.</p>
          <h2 style={{color:'#F8FAFC',marginBottom:'12px',fontSize:'1.2rem'}}>Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Disabling certain cookies may affect site functionality.</p>
        </div>
      </div>
    </main>
  )
}
