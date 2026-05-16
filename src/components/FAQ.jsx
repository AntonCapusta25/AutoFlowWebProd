import { useState } from 'react'
import { getT } from '../i18n/translations'

export default function FAQ({ lang = 'en' }) {
  const t = getT(lang)
  const [openIdx, setOpenIdx] = useState(null)

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i)

  return (
    <section className="faq-section" style={{ backgroundColor: '#050505', padding: '80px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: 800, color: '#F8FAFC', marginBottom: '16px', letterSpacing: '-0.02em'
          }}>
            {t.faq.title}
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', color: '#94A3B8', maxWidth: '600px', margin: '0 auto'
          }}>
            {t.faq.sub}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {t.faq.items.map((item, i) => (
            <div key={i} style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <button
                onClick={() => toggle(i)}
                style={{
                  width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.15rem', fontWeight: 600, color: '#F8FAFC'
                }}>
                  {item.q}
                </span>
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div style={{
                maxHeight: openIdx === i ? '500px' : '0',
                opacity: openIdx === i ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{
                  padding: '0 24px 24px', fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#CBD5E1', lineHeight: 1.6
                }}>
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
