import { useEffect } from 'react'
import ContactForm from '../components/ContactForm'
import BookingForm from '../components/BookingForm'
import { getT } from '../i18n/translations'
import FAQ from '../components/FAQ'

const IgIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const LiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const card = {
  background: '#0a0a0a',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  padding: '28px',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)',
}

const socialBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '44px', height: '44px', borderRadius: '50%',
  background: 'linear-gradient(135deg,#e91e63,#9c27b0)',
  color: 'white', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 4px 15px rgba(233,30,99,0.25)',
}

export default function Contact({ lang = 'en' }) {
  useEffect(() => { 
    document.title = 'Contact - AutoFlow Studio'
    window.scrollTo(0, 0)
  }, [lang])

  const trans = getT(lang)
  const t = trans.contact

  return (
    <main className="main-content" style={{ background: '#050505' }}>
      {/* Header */}
      <section style={{
        paddingTop: '140px', paddingBottom: '60px', textAlign: 'center',
        background: 'linear-gradient(180deg,#050505 0%,#0a0a0a 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute',top:'20%',left:'10%',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(233,30,99,0.07) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ maxWidth:'700px',margin:'0 auto',padding:'0 24px',position:'relative',zIndex:1 }}>
          <span style={{ display:'inline-block',background:'rgba(233,30,99,0.12)',border:'1px solid rgba(233,30,99,0.3)',color:'#e91e63',padding:'6px 18px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'20px' }}>
            {t.badge}
          </span>
          <h1 style={{ color:'#F8FAFC',fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,marginBottom:'16px',lineHeight:1.15 }}>
            {t.title}
          </h1>
          <p style={{ color:'#94A3B8',fontSize:'1.05rem',lineHeight:1.7,maxWidth:'520px',margin:'0 auto' }}>
            {t.sub}
          </p>
        </div>
      </section>

      {/* Main grid */}
      <section style={{ background:'#050505',padding:'60px 24px 80px' }}>
        <div style={{ maxWidth:'1100px',margin:'0 auto' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 360px',gap:'40px',alignItems:'start' }} className="contact-grid">

            {/* Form card */}
            <div style={card}>
              <h3 style={{ color:'#F8FAFC',fontSize:'1.3rem',fontWeight:700,marginBottom:'6px' }}>{t.formTitle}</h3>
              <p style={{ color:'#94A3B8',marginBottom:'28px',fontSize:'0.875rem' }}>{t.formSub}</p>
              <ContactForm lang={lang} />
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex',flexDirection:'column',gap:'20px' }}>
              {/* Book a call */}
              <div style={{ background:'linear-gradient(135deg,#e91e63,#9c27b0)',borderRadius:'16px',padding:'28px' }}>
                <h3 style={{ color:'white',fontSize:'1.1rem',fontWeight:700,marginBottom:'10px' }}>{t.bookTitle}</h3>
                <p style={{ color:'rgba(255,255,255,0.8)',lineHeight:1.6,marginBottom:'20px',fontSize:'0.875rem' }}>{t.bookSub}</p>
                <a href="https://calendar.app.google/bnsr9k5VHi5EYgdM8" target="_blank" rel="noreferrer"
                  style={{ display:'inline-block',background:'white',color:'#e91e63',padding:'11px 22px',borderRadius:'50px',fontWeight:700,fontSize:'0.875rem',textDecoration:'none',boxShadow:'0 4px 15px rgba(0,0,0,0.15)' }}>
                  {t.bookBtn}
                </a>
              </div>

              {/* Location */}
              <div style={card}>
                <h3 style={{ color:'#F8FAFC',fontSize:'1rem',fontWeight:700,marginBottom:'12px' }}>{t.locationTitle}</h3>
                <p style={{ color:'#94A3B8',lineHeight:1.8,fontSize:'0.875rem' }} dangerouslySetInnerHTML={{ __html: t.locationText }} />
              </div>

              {/* Socials */}
              <div style={card}>
                <h3 style={{ color:'#F8FAFC',fontSize:'1rem',fontWeight:700,marginBottom:'8px' }}>{t.socialTitle}</h3>
                <p style={{ color:'#94A3B8',fontSize:'0.875rem',marginBottom:'16px' }}>{t.socialSub}</p>
                <div style={{ display:'flex',gap:'12px' }}>
                  <a href="https://www.instagram.com/auto.flow25" target="_blank" rel="noreferrer" title="Instagram" style={socialBtn}
                    onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 20px rgba(233,30,99,0.4)'}}
                    onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 15px rgba(233,30,99,0.25)'}}>
                    <IgIcon />
                  </a>
                  <a href="https://www.linkedin.com/company/auto-flow-studio/" target="_blank" rel="noreferrer" title="LinkedIn" style={socialBtn}
                    onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 20px rgba(233,30,99,0.4)'}}
                    onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 15px rgba(233,30,99,0.25)'}}>
                    <LiIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginTop:'80px' }}>
            <FAQ lang={lang} />
          </div>
        </div>
      </section>

      <style>{`@media(max-width:768px){.contact-grid{grid-template-columns:1fr!important;}}`}</style>
    </main>
  )
}
