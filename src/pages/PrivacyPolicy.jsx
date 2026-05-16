import { useEffect } from 'react'
export default function PrivacyPolicy() {
  useEffect(() => { document.title = 'Privacy Policy - AutoFlow Studio' }, [])
  return (
    <main className="main-content policy-page">
      <div className="container" style={{maxWidth:'800px',padding:'120px 20px 80px'}}>
        <h1 style={{color:'#F8FAFC',marginBottom:'32px'}}>Privacy Policy</h1>
        <div style={{color:'#94A3B8',lineHeight:1.8,fontSize:'0.95rem'}}>
          <p style={{marginBottom:'24px'}}>Last updated: January 2026</p>
          <h2 style={{color:'#F8FAFC',marginBottom:'12px',fontSize:'1.2rem'}}>Information We Collect</h2>
          <p style={{marginBottom:'24px'}}>We collect information you provide directly to us, such as your name, email address, company name, and details about your automation needs when you submit our contact or booking forms.</p>
          <h2 style={{color:'#F8FAFC',marginBottom:'12px',fontSize:'1.2rem'}}>How We Use Your Information</h2>
          <p style={{marginBottom:'24px'}}>We use the information to respond to your enquiries, provide our services, send you updates about your projects, and improve our website.</p>
          <h2 style={{color:'#F8FAFC',marginBottom:'12px',fontSize:'1.2rem'}}>Data Storage</h2>
          <p style={{marginBottom:'24px'}}>Your data is stored securely in Supabase (EU region). We do not sell your personal information to third parties.</p>
          <h2 style={{color:'#F8FAFC',marginBottom:'12px',fontSize:'1.2rem'}}>Contact</h2>
          <p>For any privacy concerns, contact us at <a href="mailto:info@autoflowstudio.net" style={{color:'#e91e63'}}>info@autoflowstudio.net</a>.</p>
        </div>
      </div>
    </main>
  )
}
