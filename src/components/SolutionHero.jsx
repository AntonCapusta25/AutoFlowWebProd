import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const LOGOS = [
  { name: 'Gemini', src: '/images/logos/gemini_new.webp', type: 'image' },
  { name: 'Google AI Studio', src: '/images/logos/google_ai_studio_new.webp', type: 'image' },
  { name: 'Google Cloud', src: '/images/logos/gcloud_new.webp', type: 'image' },
  { name: 'Anthropic', src: '/images/logos/anthropic_new.webp', type: 'image' },
  { name: 'Claude', src: '/images/logos/flower_new.webp', type: 'image' },
  { name: 'Mistral', src: '/images/logos/mistral_new.webp', type: 'image' },
  { name: 'Llama', src: '/images/logos/llama_new.webp', type: 'image' },
  { name: 'Meta', src: '/images/logos/meta_new.webp', type: 'image' },
  { name: 'ChatGPT', src: '/images/logos/chatgpt_icon_new.webp', type: 'image' },
  { name: 'Recraft', src: '/images/logos/recraft_icon_new.webp', type: 'image' },
  { name: 'Vercel', src: '/images/logos/vercel_new.webp', type: 'image' },
  { name: 'Gmail', src: '/images/logos/gmail_new.webp', type: 'image' },
  { name: 'Google Drive', src: '/images/logos/gdrive_new.webp', type: 'image' },
  { name: 'Google Meet', src: '/images/logos/gmeet_new.webp', type: 'image' },
  { name: 'Supabase', src: '/images/logos/supabase.webp', type: 'image' },
  { name: 'Stripe', src: '/images/logos/bars_new.webp', type: 'image' },
  { name: 'SendGrid', src: '/images/logos/sendgrid.webp', type: 'image' },
  { name: 'Homemade', src: '/images/logos/homemade_new.webp', type: 'image' },
  { name: 'Oceanlove', src: '/images/logos/oceanlove_new.webp', type: 'image' },
]

export default function SolutionHero({ 
  lang = 'en', 
  eyebrow = '01 / SOLUTION',
  headlinePrefix = 'AUTOMATE YOUR',
  headlineHighlight = 'HOSPITALITY',
  subText = 'Engineered custom portals, bespoke AI assistants, and seamless POS integrations that run your operations on autopilot.',
  ctaText = 'Book an Automation Audit',
  ctaSecondaryText = 'Calculate Your ROI',
  typewriterItems = [],
  onOpenBooking = null
}) {
  const isNl = lang === 'nl'
  const [typeText, setTypeText] = useState('')
  const [itemIdx, setItemIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const videoRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log('Solution hero video play error:', err))
    }
  }, [])

  const defaultTypeItems = typewriterItems.length ? typewriterItems : (
    isNl ? [
      'no-shows automatisch verminderen...',
      'kassa en reserveringen synchroniseren...',
      '24/7 e-mails en WhatsApp beantwoorden...',
      'gastbeoordelingen automatisch verzamelen...'
    ] : [
      'reducing table no-shows automatically...',
      'syncing POS and reservation systems...',
      'replying to guest emails & WhatsApp 24/7...',
      'boosting 5-star Google reviews on autopilot...'
    ]
  )

  // Typewriter effect for problem search box
  useEffect(() => {
    const prefixStr = isNl ? 'Wij automatiseren ' : 'We automate '
    const current = prefixStr + defaultTypeItems[itemIdx]
    if (!current) return
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
        setItemIdx(i => (i + 1) % defaultTypeItems.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, itemIdx, defaultTypeItems, isNl])

  const handleSend = (e) => {
    e.preventDefault()
    if (onOpenBooking) {
      onOpenBooking(inputVal)
    } else {
      window.dispatchEvent(new CustomEvent('open-booking', { detail: { query: inputVal } }))
    }
  }

  const inputLabel = isNl ? 'Welk probleem heeft u?' : 'What problem do you have?'
  const sendText = isNl ? 'Stuur' : 'Send'

  return (
    <>
      <style>{`
        .solution-hero-section {
          min-height: 90vh;
          padding-top: 150px;
          position: relative;
          background-color: #050203;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .solution-hero-title {
          font-size: clamp(2.8rem, 5.5vw, 4.2rem);
          line-height: 1.05;
        }
        .solution-glass-pill {
          display: inline-flex;
          align-items: center;
          background: rgba(153, 27, 27, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 8px 32px rgba(153, 27, 27, 0.3);
          border-radius: 50px;
          padding: 8px 36px;
          margin-left: 12px;
          vertical-align: middle;
          min-height: 1.4em;
        }
        .solution-red-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #fca5a5 50%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }
        .solution-logo-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 56px;
          padding: 0 32px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px;
          min-width: max-content;
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .solution-logo-pill:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.3);
        }
        @media (max-width: 768px) {
          .solution-hero-section {
            padding-top: 110px !important;
            padding-bottom: 40px !important;
          }
          .solution-hero-title {
            font-size: clamp(2.2rem, 10vw, 3.2rem) !important;
          }
          .solution-glass-pill {
            margin-left: 0;
            margin-top: 8px;
            padding: 6px 20px;
          }
          .solution-search-box {
            display: none !important;
          }
        }
      `}</style>

      <section className="solution-hero-section">
        {/* Background Video looping (0831 (2).mov red liquid video) */}
        <video
          ref={videoRef}
          src="/hero_red_loop.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            opacity: 0.45,
            zIndex: 0
          }}
        />

        {/* Dark vignette overlay for optimal text contrast */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(10,4,6,0.3) 0%, rgba(5,2,3,0.85) 100%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
          
          {/* Main Hero Content Header */}
          <div style={{ textAlign: 'center', marginTop: '2vh' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '6px 18px', borderRadius: '50px', marginBottom: '24px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.18em', color: '#fca5a5', textTransform: 'uppercase' }}>
                {eyebrow}
              </span>
            </div>

            <h1 className="solution-hero-title" style={{ 
              fontFamily: "'Bebas Neue', 'Space Grotesk', 'Inter', sans-serif", 
              fontWeight: 'normal', 
              lineHeight: 1.05, 
              marginBottom: '24px', 
              letterSpacing: '0.03em',
              textShadow: '0 4px 25px rgba(0,0,0,0.8)',
              textTransform: 'uppercase'
            }}>
              <div style={{ color: '#FFFFFF' }}>{headlinePrefix}</div>
              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center' }}>
                <span className="solution-glass-pill" style={{ 
                  minWidth: '10ch', 
                  justifyContent: 'center', 
                  padding: '10px 36px',
                  display: 'inline-flex'
                }}>
                  <span className="solution-red-gradient">
                    {headlineHighlight}
                  </span>
                </span>
              </div>
            </h1>

            <p style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', 
              color: 'rgba(255,255,255,0.88)', 
              marginBottom: '36px', 
              lineHeight: 1.6, 
              maxWidth: '720px',
              margin: '0 auto',
              textShadow: '0 2px 12px rgba(0,0,0,0.7)'
            }}>
              {subText}
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onOpenBooking ? onOpenBooking('') : window.dispatchEvent(new CustomEvent('open-booking'))} 
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '50px', 
                  padding: '16px 36px', 
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                {ctaText} ↗
              </button>

              {ctaSecondaryText && (
                <a 
                  href="#roi" 
                  style={{ 
                    borderRadius: '50px', 
                    padding: '16px 32px', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    background: 'rgba(255,255,255,0.05)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {ctaSecondaryText}
                </a>
              )}
            </div>
          </div>

          {/* Typewriter Problem Search Box */}
          <div style={{ paddingTop: '40px', paddingBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <div className="solution-search-box hero-search-box" style={{
              background: 'rgba(18,8,12,0.75)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '14px',
              padding: '8px 8px 8px 24px',
              display: 'flex', alignItems: 'center', gap: '12px',
              width: '95%', maxWidth: '850px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}>
              <label style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
                color: '#fca5a5', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
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
                <button type="submit" style={{
                  background: inputVal.trim() ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'rgba(255,255,255,0.08)',
                  color: inputVal.trim() ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: 'none', borderRadius: '8px', padding: '12px 32px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                  transition: 'all 0.2s', letterSpacing: '0.05em',
                  boxShadow: inputVal.trim() ? '0 8px 25px rgba(239, 68, 68, 0.4)' : 'none',
                }}>
                  {sendText}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* ── Seamless Endless Logo Marquee Strip ── */}
        <div className="logos-section" style={{ paddingTop: '16px', paddingBottom: '24px', background: 'transparent' }}>
          <div className="logos-label" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)', color: 'rgba(255,255,255,0.6)' }}>
            {isNl ? 'ONZE PARTNERS & INTEGRATIES' : 'OUR PARTNERS & INTEGRATIONS'}
          </div>
          <div className="logos-track-container">
            <div className="logos-track">
              {[...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
                <div key={i} className="logo-item">
                  <div className="solution-logo-pill">
                    <img 
                      src={l.src} 
                      alt={l.name}
                      width="70"
                      height={l.name === 'Recraft' ? 46 : l.name === 'Oceanlove' ? 48 : 32}
                      style={{ 
                        height: l.name === 'Recraft' ? '46px' : l.name === 'Oceanlove' ? '48px' : '32px', 
                        width: 'auto', 
                        maxWidth: '240px',
                        objectFit: 'contain',
                        filter: 'brightness(0) invert(1)'
                      }}
                    />
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
