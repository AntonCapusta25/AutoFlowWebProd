import { getT } from '../i18n/translations'

export default function CTASection({ lang = 'en' }) {
  const t = getT(lang)

  return (
    <section id="booking" style={{ padding: '96px 16px', position: 'relative', overflow: 'hidden', background: '#000000' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div style={{
          background: 'linear-gradient(135deg, #131024, #08070d)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '3rem',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '48px 24px'
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
              marginBottom: '28px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {lang === 'nl' ? 'BEPERKTE CAPACITEIT' : 'Limited Monthly Spots'}
            </span>
            
            <h2 style={{
              fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif",
              fontSize: 'clamp(2.5rem, 6.5vw, 4.8rem)',
              fontWeight: 'normal',
              color: '#FFFFFF',
              marginBottom: '24px',
              lineHeight: 1.05,
              letterSpacing: '0.02em',
              textShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}>
              {t.blog.ctaTitle}
            </h2>
            
            <p style={{
              fontFamily: "'Inter', sans-serif",
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              marginBottom: '40px',
              maxWidth: '620px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}>
              {t.blog.ctaSub}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking'))}
                className="cta-button"
                style={{
                  padding: '20px 48px',
                  fontSize: '1.25rem',
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
                {t.blog.ctaBtn}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
            
            <p style={{ marginTop: '28px', fontSize: '0.8rem', color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              {lang === 'nl' 
                ? 'Geen commitment vereist. 100% op maat gemaakte automatisering audit.' 
                : 'No credit card or commitment required. 100% free automation roadmap.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
