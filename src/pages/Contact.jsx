import { useEffect } from 'react'
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
  background: 'linear-gradient(135deg,#d1bbfb,#a78bfa)',
  color: 'white', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 4px 15px rgba(209, 187, 251,0.25)',
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
        <div style={{ position:'absolute',top:'20%',left:'10%',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(209, 187, 251,0.07) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ maxWidth:'700px',margin:'0 auto',padding:'0 24px',position:'relative',zIndex:1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <img src="/images/logo.png" alt="AutoFlow Studio Logo" style={{ height: '48px', width: 'auto' }} />
          </div>
          <span style={{ display:'inline-block',background:'rgba(209, 187, 251,0.12)',border:'1px solid rgba(209, 187, 251,0.3)',color:'#d1bbfb',padding:'6px 18px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'20px' }}>
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

      {/* Main card and bento section */}
      <section style={{ background:'#000000', padding:'20px 24px 80px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          
          {/* Rounded Card */}
          <div style={{
            background: 'linear-gradient(135deg, #131024, #08070d)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '3rem',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '440px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px 24px',
            marginBottom: '40px'
          }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(209, 187, 251, 0.15) 0%, transparent 70%)'
              }}></div>
              {/* Dot Grid */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'radial-gradient(rgba(209, 187, 251, 0.1) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
              }}></div>
            </div>
            {/* Glowing blur spheres */}
            <div style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '380px',
              height: '380px',
              background: 'rgba(209, 187, 251, 0.18)',
              borderRadius: '50%',
              filter: 'blur(100px)',
              pointerEvents: 'none',
              mixBlendMode: 'screen'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-100px',
              width: '380px',
              height: '380px',
              background: 'rgba(121, 73, 218, 0.15)',
              borderRadius: '50%',
              filter: 'blur(100px)',
              pointerEvents: 'none',
              mixBlendMode: 'screen'
            }}></div>

            {/* Content Container */}
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 18px',
                borderRadius: '50px',
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {lang === 'nl' ? 'START DE Vragenlijst' : 'Start Audit Flow'}
              </span>
              
              <h2 style={{
                fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif",
                fontSize: 'clamp(2.3rem, 6vw, 4.2rem)',
                fontWeight: 'normal',
                color: '#FFFFFF',
                marginBottom: '20px',
                lineHeight: 1.05,
                letterSpacing: '0.02em',
                textShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}>
                {t.formTitle}
              </h2>
              
              <p style={{
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
                marginBottom: '36px',
                maxWidth: '600px',
                margin: '0 auto 36px',
                lineHeight: 1.6
              }}>
                {lang === 'nl' 
                  ? 'Beantwoord een paar snelle vragen om direct een op maat gemaakt automatiseringsadvies te ontvangen.'
                  : 'Answer a few quick questions to receive a tailored automation blueprint for your business.'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-booking'))}
                  className="cta-button"
                  style={{
                    padding: '18px 44px',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--primary-gradient)',
                    boxShadow: '0 10px 30px var(--primary-glow)',
                    borderRadius: '50px',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  {lang === 'nl' ? 'Start Vragenlijst →' : 'Begin Question Flow →'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bento Details Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr', gap:'20px', marginBottom: '80px' }} className="contact-grid">
            {/* Book a call */}
            <div style={{ background:'linear-gradient(135deg, #131024, #08070d)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius:'24px', padding:'28px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <h3 style={{ color:'white', fontSize:'1.1rem', fontWeight:700, marginBottom:'10px' }}>{t.bookTitle}</h3>
              <p style={{ color:'rgba(255,255,255,0.7)', lineHeight:1.6, marginBottom:'20px', fontSize:'0.875rem' }}>{t.bookSub}</p>
              <a href="https://calendar.app.google/bnsr9k5VHi5EYgdM8" target="_blank" rel="noreferrer"
                style={{ display:'inline-block', background:'white', color:'#131024', padding:'11px 22px', borderRadius:'50px', fontWeight:700, fontSize:'0.875rem', textDecoration:'none', boxShadow:'0 4px 15px rgba(0,0,0,0.15)', textAlign: 'center', width: 'fit-content' }}>
                {t.bookBtn}
              </a>
            </div>

            {/* Location */}
            <div style={card}>
              <h3 style={{ color:'#F8FAFC', fontSize:'1rem', fontWeight:700, marginBottom:'12px' }}>{t.locationTitle}</h3>
              <p style={{ color:'#94A3B8', lineHeight:1.8, fontSize:'0.875rem' }} dangerouslySetInnerHTML={{ __html: t.locationText }} />
            </div>

            {/* Socials */}
            <div style={card}>
              <h3 style={{ color:'#F8FAFC', fontSize:'1rem', fontWeight:700, marginBottom:'8px' }}>{t.socialTitle}</h3>
              <p style={{ color:'#94A3B8', fontSize:'0.875rem', marginBottom:'16px' }}>{t.socialSub}</p>
              <div style={{ display:'flex', gap:'12px' }}>
                <a href="https://www.instagram.com/auto.flow25" target="_blank" rel="noreferrer" title="Instagram" style={socialBtn}
                  onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 20px rgba(191, 163, 255,0.4)'}}
                  onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 15px rgba(191, 163, 255,0.25)'}}>
                  <IgIcon />
                </a>
                <a href="https://www.linkedin.com/company/auto-flow-studio/" target="_blank" rel="noreferrer" title="LinkedIn" style={socialBtn}
                  onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 20px rgba(191, 163, 255,0.4)'}}
                  onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 15px rgba(191, 163, 255,0.25)'}}>
                  <LiIcon />
                </a>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <FAQ lang={lang} />
          </div>
        </div>
      </section>

      <style>{`@media(max-width:768px){.contact-grid{grid-template-columns:1fr!important;}}`}</style>
    </main>
  )
}
