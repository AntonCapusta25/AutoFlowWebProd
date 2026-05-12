import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getT } from '../i18n/translations'

const LOGOS = [
  { name: 'Gemini', src: '/images/logos/gemini.png', type: 'image' },
  { name: 'OpenAI', src: '/images/logos/openai.png', type: 'image' },
  { name: 'Recraft', src: '/images/logos/recraft.png', type: 'image' },
  { name: 'SendGrid', src: '/images/logos/sendgrid.png', type: 'image' },
  { name: 'Google Workspace', src: '/images/logos/google-workspace.png', type: 'image' },
  { name: 'Supabase', src: '/images/logos/supabase.png', type: 'image' },
  { name: 'Homemade BV', type: 'pill' },
  { name: 'Oceanlove', type: 'pill' },
  { name: 'Claude AI', type: 'pill' },
  { name: 'Vercel', type: 'pill' },
]

const TYPEWRITER_ITEMS_EN = [
  'sending invoices automatically...',
  'following up with leads 24/7...',
  'moving data between Google Sheets...',
  'replying to customer emails at 3am...',
  'exporting reports every Monday...',
  'copying data from one system to another...',
  'manually qualifying every single lead...',
  'scheduling social media posts one by one...',
  'reminding your team about deadlines...',
  'building the same dashboard again...',
]

const TYPEWRITER_ITEMS_NL = [
  'automatisch facturen versturen...',
  '24/7 leads opvolgen...',
  'data verplaatsen tussen Google Sheets...',
  'klant-e-mails beantwoorden om 3 uur \'s nachts...',
  'elke maandag rapporten exporteren...',
  'data kopiëren van het ene naar het andere systeem...',
  'elke lead handmatig kwalificeren...',
  'social media posts één voor één inplannen...',
  'je team herinneren aan deadlines...',
  'steeds weer hetzelfde dashboard bouwen...',
]

export default function Hero({ lang = 'en' }) {
  const t = getT(lang)
  const isNl = lang === 'nl'
  const prefix = isNl ? '/nl' : ''
  const typeItems = isNl ? TYPEWRITER_ITEMS_NL : TYPEWRITER_ITEMS_EN

  const [typeText, setTypeText] = useState('')
  const [itemIdx, setItemIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const inputLabel = isNl ? 'Wat wil je automatiseren?' : 'What do you want to automate?'
  const sendText = isNl ? 'Stuur' : 'Send'

  // Typewriter effect
  useEffect(() => {
    const prefixStr = isNl ? 'Wij automatiseren het ' : 'We automate '
    const current = prefixStr + typeItems[itemIdx]
    let timeout

    if (!deleting) {
      if (charIdx < current.length) {
        timeout = setTimeout(() => {
          setTypeText(current.slice(0, charIdx + 1))
          setCharIdx(c => c + 1)
        }, 38)
      } else {
        timeout = setTimeout(() => setDeleting(true), 2200)
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setTypeText(current.slice(0, charIdx - 1))
          setCharIdx(c => c - 1)
        }, 18)
      } else {
        setDeleting(false)
        setItemIdx(i => (i + 1) % typeItems.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, itemIdx, isNl, typeItems])

  const handleSend = (e) => {
    e.preventDefault()
    if (inputVal.trim()) {
      navigate(`${prefix}/contact?q=${encodeURIComponent(inputVal)}`)
    }
  }

  return (
    <section className="hero hero-section" style={{ 
      minHeight: '100vh', 
      paddingTop: '160px', 
      paddingBottom: '0',
      background: `url('/images/hero-night-sky.jpg') center bottom / cover no-repeat`,
      backgroundColor: '#050505',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        
        {/* Top Section: Text in Night Sky */}
        <div style={{ textAlign: 'center', marginTop: '2vh' }}>
          <h1 style={{ 
            fontFamily: "'Space Grotesk', 'Inter', sans-serif", 
            fontSize: 'clamp(3rem, 6vw, 4.5rem)', 
            fontWeight: 800, 
            lineHeight: 1.15, 
            marginBottom: '24px', 
            letterSpacing: '-0.02em',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            {t.hero.headline}
          </h1>
          <p style={{ 
            fontFamily: "'Inter', sans-serif", 
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', 
            color: 'rgba(255,255,255,0.85)', 
            marginBottom: '40px', 
            lineHeight: 1.6, 
            maxWidth: '600px',
            margin: '0 auto',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            {t.hero.sub}
          </p>
          <a href="https://autoflow.neetocal.com/meeting-with-auto-flow" className="cta-button" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '20px' }}>
            {t.hero.cta}
          </a>
        </div>

        {/* Bottom Section: Typewriter on Desk */}
        <div style={{ paddingBottom: '40px', display: 'flex', justifyContent: 'center' }}>
          {/* Typewriter Input Box */}
          <div style={{
            background: 'rgba(20,22,28,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '8px 8px 8px 24px',
            display: 'flex', alignItems: 'center', gap: '16px',
            width: '100%', maxWidth: '700px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <label style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em',
              color: '#e91e63', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {inputLabel}
            </label>
            <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  ref={inputRef}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder={typeText}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: '#FFFFFF', fontSize: '1.05rem', fontFamily: "'Inter', sans-serif",
                    fontWeight: 400, padding: '12px 0',
                  }}
                />
              </div>
              <button type="submit" style={{
                background: inputVal.trim() ? 'linear-gradient(135deg,#e91e63,#9c27b0)' : 'rgba(255,255,255,0.08)',
                color: inputVal.trim() ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none', borderRadius: '8px', padding: '12px 32px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                transition: 'all 0.2s', letterSpacing: '0.05em',
                boxShadow: inputVal.trim() ? '0 8px 25px rgba(233,30,99,0.4)' : 'none',
              }}>
                {sendText}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ── Partners strip (Integrated into Hero bottom) ── */}
      <div className="logos-section" style={{ paddingTop: '20px', paddingBottom: '30px', background: 'transparent' }}>
        <div className="logos-label" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{t.logosLabel}</div>
        <div className="logos-track-container">
          <div className="logos-track">
            {[...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
              <div key={i} className="logo-item">
                <div className="logo-pill" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '60px',
                  padding: '0 36px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '50px',
                  minWidth: 'max-content',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                }}>
                  {l.type === 'image' ? (
                    <img 
                      src={l.src} 
                      alt={l.name} 
                      style={{ 
                        height: l.name === 'Gemini' || l.name === 'Recraft' || l.name === 'OpenAI' ? '50px' : '30px', 
                        width: 'auto', 
                        maxWidth: '240px',
                        objectFit: 'contain',
                        transition: 'all 0.3s'
                      }}
                    />
                  ) : (
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#F8FAFC',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em'
                    }}>
                      {l.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
