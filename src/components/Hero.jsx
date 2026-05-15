import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getT } from '../i18n/translations'



const LOGOS = [
  { name: 'Gemini', src: '/images/logos/gemini_new.png', type: 'image' },
  { name: 'Google AI Studio', src: '/images/logos/google_ai_studio_new.png', type: 'image' },
  { name: 'Google Cloud', src: '/images/logos/gcloud_new.png', type: 'image' },
  { name: 'Anthropic', src: '/images/logos/anthropic_new.png', type: 'image' },
  { name: 'Claude', src: '/images/logos/flower_new.png', type: 'image' },
  { name: 'Mistral', src: '/images/logos/mistral_new.png', type: 'image' },
  { name: 'Llama', src: '/images/logos/llama_new.png', type: 'image' },
  { name: 'Meta', src: '/images/logos/meta_new.png', type: 'image' },
  { name: 'ChatGPT', src: '/images/logos/chatgpt_icon_new.png', type: 'image' },
  { name: 'Recraft', src: '/images/logos/recraft_icon_new.png', type: 'image' },
  { name: 'Vercel', src: '/images/logos/vercel_new.png', type: 'image' },
  { name: 'Gmail', src: '/images/logos/gmail_new.png', type: 'image' },
  { name: 'Google Drive', src: '/images/logos/gdrive_new.png', type: 'image' },
  { name: 'Google Meet', src: '/images/logos/gmeet_new.png', type: 'image' },
  { name: 'Supabase', src: '/images/logos/supabase.png', type: 'image' },
  { name: 'Stripe', src: '/images/logos/bars_new.png', type: 'image' },
  { name: 'SendGrid', src: '/images/logos/sendgrid.png', type: 'image' },
  { name: 'Homemade', src: '/images/logos/homemade_new.png', type: 'image' },
  { name: 'Oceanlove', src: '/images/logos/oceanlove_new.png', type: 'image' },
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



  // Headline typewriter state
  const headlineWords = t.hero.headlineWords || []
  const [headlineText, setHeadlineText] = useState('')
  const [headlineWordIdx, setHeadlineWordIdx] = useState(0)
  const [headlineCharIdx, setHeadlineCharIdx] = useState(0)
  const [headlineDeleting, setHeadlineDeleting] = useState(false)

  useEffect(() => {
    if (!headlineWords.length) return
    const current = headlineWords[headlineWordIdx]
    let timeout

    if (!headlineDeleting) {
      if (headlineCharIdx < current.length) {
        timeout = setTimeout(() => {
          setHeadlineText(current.slice(0, headlineCharIdx + 1))
          setHeadlineCharIdx(c => c + 1)
        }, 60)
      } else {
        timeout = setTimeout(() => setHeadlineDeleting(true), 3000)
      }
    } else {
      if (headlineCharIdx > 0) {
        timeout = setTimeout(() => {
          setHeadlineText(current.slice(0, headlineCharIdx - 1))
          setHeadlineCharIdx(c => c - 1)
        }, 30)
      } else {
        setHeadlineDeleting(false)
        setHeadlineWordIdx(i => (i + 1) % headlineWords.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [headlineCharIdx, headlineDeleting, headlineWordIdx, headlineWords])

  const inputLabel = isNl ? 'Welk probleem heeft u?' : 'What problem do you have?'
  const sendText = isNl ? 'Stuur' : 'Send'



  // Typewriter effect for input box
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
    window.dispatchEvent(new CustomEvent('open-booking', { detail: { query: inputVal } }))
  }


  return (
    <>
      <style>{`
        .hero-section {
          min-height: 100vh;
          padding-top: 160px;
        }
        .hero-title {
          font-size: clamp(3rem, 6vw, 4.5rem);
          line-height: 1;
        }
        .glass-pill {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          border-radius: 50px;
          padding: 0 40px;
          margin-left: 16px;
          vertical-align: middle;
          min-height: 1.5em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60px;
          padding: 0 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px;
          min-width: max-content;
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }
        
        .logo-pill:hover {
          background: rgba(255,255,255,0.08);
          border-color: #e91e63;
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(233, 30, 99, 0.3);
        }
        
        .logo-pill img {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .logo-pill:hover img {
          filter: drop-shadow(0 0 10px rgba(233, 30, 99, 0.8)) brightness(1.5) !important;
          transform: scale(1.1);
        }

        @media (min-width: 769px) {
          .mobile-only-br {
            display: none;
          }
        }
        @media (max-width: 768px) {
          .hero-section {
            min-height: 100vh !important;
            padding-top: 120px !important;
            padding-bottom: 60px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .hero-title {
            font-size: clamp(2.5rem, 12vw, 3.5rem) !important;
            line-height: 1.05 !important;
            margin-bottom: 16px !important;
          }
          .hero-subtext {
            font-size: 0.95rem !important;
            margin-bottom: 20px !important;
            padding: 0 15px;
            line-height: 1.5 !important;
          }
          .hero-search-box {
            display: none !important;
          }
          .hero-search-btn {
            width: 100% !important;
            padding: 12px !important;
          }
          .glass-pill {
            margin-left: 0;
            margin-top: 4px;
            padding: 0 12px;
            height: 1.2em;
            font-size: 0.8em;
            min-width: 8ch !important;
          }
          .logo-pill {
            height: 36px !important;
            padding: 0 16px !important;
          }
          .logo-pill img {
            height: 20px !important;
          }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .type-cursor {
          display: inline-block;
          width: 2px;
          height: 0.8em;
          background-color: #e91e63;
          margin-left: 4px;
          animation: blink 1s step-end infinite;
          vertical-align: middle;
        }
      `}</style>
      <section className="hero hero-section" style={{ 
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
            <h1 className="hero-title" style={{ 
              fontFamily: "'Space Grotesk', 'Inter', sans-serif", 
              fontWeight: 800, 
              lineHeight: 1.15, 
              marginBottom: '24px', 
              letterSpacing: '-0.02em',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              {t.hero.headlinePrefix}
              <br className="mobile-only-br" />
              <span className="glass-pill" style={{ minWidth: '12ch', justifyContent: 'flex-start' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #e91e63, #9c27b0)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  whiteSpace: 'nowrap'
                }}>
                  {headlineText}
                </span>
              </span>
            </h1>
          <p className="hero-subtext" style={{ 
            fontFamily: "'Inter', sans-serif", 
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', 
            color: 'rgba(255,255,255,0.85)', 
            marginBottom: '40px', 
            lineHeight: 1.6, 
            maxWidth: '700px',
            margin: '0 auto',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            {t.hero.sub}
          </p>
          <a href="https://calendar.app.google/bnsr9k5VHi5EYgdM8" className="cta-button" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '20px' }}>
            {t.hero.cta}
          </a>
        </div>

        {/* Bottom Section: Typewriter on Desk */}
        <div style={{ paddingBottom: '40px', display: 'flex', justifyContent: 'center' }}>
          {/* Typewriter Input Box */}
          <div className="hero-search-box" style={{
            background: 'rgba(20,22,28,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '8px 8px 8px 24px',
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '95%', maxWidth: '850px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <label style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
              color: '#e91e63', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {inputLabel}
            </label>
            <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: '12px', width: '100%' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  ref={inputRef}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder={typeText}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: '#FFFFFF', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif",
                    fontWeight: 400, padding: '10px 0',
                  }}
                />
              </div>
              <button className="hero-search-btn" type="submit" style={{
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
                <div className="logo-pill">
                  {l.type === 'image' ? (
                    <img 
                      src={l.src} 
                      alt={l.name} 
                      style={{ 
                        height: l.name === 'Recraft' ? '46px' : l.name === 'Oceanlove' ? '48px' : '32px', 
                        width: 'auto', 
                        maxWidth: '240px',
                        objectFit: 'contain',
                        filter: l.type === 'image' ? 'brightness(0) invert(1)' : 'none'
                      }}
                    />
                  ) : l.svg ? (
                    l.svg
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
    </>
  )
}
