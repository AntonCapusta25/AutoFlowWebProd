import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const TYPEWRITER_ITEMS = [
  'sending invoices automatically…',
  'following up with leads 24/7…',
  'moving data between Google Sheets…',
  'replying to customer emails at 3am…',
  'exporting reports every Monday morning…',
  'copying data from one system to another…',
  'manually qualifying every single lead…',
  'scheduling social media posts one by one…',
  'reminding your team about deadlines…',
  'building the same dashboard again…',
]

const STATS = [
  { n: '€40K+',   l: 'avg. annual savings' },
  { n: '7 days',  l: 'average delivery' },
  { n: '20h/wk',  l: 'time saved per client' },
  { n: '100%',    l: 'custom-built' },
]

// Grid line SVG overlay — gives the editorial grid feel from the reference
const GridOverlay = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Vertical lines */}
    {[25, 50, 75].map(pct => (
      <line key={pct} x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%"
        stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    ))}
    {/* Horizontal lines */}
    {[33, 66].map(pct => (
      <line key={pct} x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`}
        stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    ))}
  </svg>
)

export default function HeroNew({ lang = 'en' }) {
  const [typeText, setTypeText] = useState('')
  const [itemIdx, setItemIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const isNl = lang === 'nl'
  const prefix = isNl ? '/nl' : ''

  const headline = isNl
    ? ['AUTOMATISEER', 'HET WERK', 'DAT JE HAAT']
    : ['AUTOMATE', 'THE WORK', 'YOU HATE']
  const subline = isNl
    ? 'Maatwerk automatisering voor founders en teams'
    : 'Custom automation for founders & teams'
  const labelTag = isNl ? 'AUTOMATISERINGSBUREAU · NEDERLAND' : 'AUTOMATION AGENCY · AMSTERDAM'
  const ctaText = isNl ? 'Boek Gratis Audit' : 'Book Free Audit'
  const inputPlaceholder = isNl
    ? `Wij automatiseren het ${TYPEWRITER_ITEMS[itemIdx]}`
    : `We automate ${TYPEWRITER_ITEMS[itemIdx]}`
  const inputLabel = isNl ? 'Wat wil je automatiseren?' : 'What do you want to automate?'
  const sendText = isNl ? 'Stuur →' : 'Send →'

  // Typewriter effect
  useEffect(() => {
    const current = (isNl ? 'Wij automatiseren het ' : 'We automate ') + TYPEWRITER_ITEMS[itemIdx]
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
        setItemIdx(i => (i + 1) % TYPEWRITER_ITEMS.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, itemIdx, isNl])

  const handleSend = (e) => {
    e.preventDefault()
    if (inputVal.trim()) {
      navigate(`${prefix}/contact?q=${encodeURIComponent(inputVal)}`)
    }
  }

  return (
    <section style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '70px', // navbar offset
    }}>
      <GridOverlay />

      {/* Subtle warm glow — top right, not blue/purple */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,92,0,0.06) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '0', left: '-5%',
        width: '500px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,92,0,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Main content */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 48px',
        width: '100%', position: 'relative', zIndex: 1,
      }} className="hero-new-inner">

        {/* Top label — like "GOGGLES / VISORS" in the reference */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
          marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.25)', display: 'inline-block' }} />
          {labelTag}
        </div>

        {/* Headline — three stacked lines, huge and bold */}
        <div style={{ marginBottom: '40px' }}>
          {headline.map((line, i) => (
            <div key={i} style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(3.8rem, 9vw, 10rem)',
              fontWeight: 800,
              lineHeight: 0.93,
              color: i === 1 ? 'rgba(255,255,255,0.92)' : '#FFFFFF',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}>
              {i === 2 ? (
                <>
                  {line.slice(0, -4)}
                  <span style={{
                    color: '#FF5C00',
                    fontStyle: 'italic',
                  }}>
                    {line.slice(-4)}
                  </span>
                </>
              ) : line}
            </div>
          ))}
        </div>

        {/* Sub-headline + CTA row */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '40px', marginBottom: '64px', flexWrap: 'wrap',
        }}>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
            color: 'rgba(255,255,255,0.5)', fontWeight: 400,
            maxWidth: '420px', lineHeight: 1.6, margin: 0,
          }}>
            {subline}. {isNl
              ? 'Van Google Sheets workflows tot AI chatbots — opgeleverd in 7 dagen.'
              : 'From Google Sheets workflows to AI chatbots — delivered in 7 days.'}
          </p>
          <a
            href="https://autoflow.neetocal.com/meeting-with-auto-flow"
            target="_blank" rel="noreferrer"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#FF5C00', color: '#0A0A0A',
              padding: '16px 32px', borderRadius: '4px',
              fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
              letterSpacing: '0.02em', textTransform: 'uppercase',
              transition: 'background 0.2s, transform 0.2s',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#FF7A2E'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { e.currentTarget.style.background = '#FF5C00'; e.currentTarget.style.transform = 'none' }}
          >
            {ctaText}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        {/* Typewriter input box */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '6px 6px 6px 24px',
          display: 'flex', alignItems: 'center', gap: '16px',
          maxWidth: '700px', marginBottom: '64px',
          backdropFilter: 'blur(10px)',
        }}>
          <label style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em',
            color: '#FF5C00', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {inputLabel}
          </label>
          <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={typeText}
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: '#FFFFFF', fontSize: '0.9rem', fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 400, padding: '10px 0',
                }}
              />
            </div>
            <button type="submit" style={{
              background: inputVal.trim() ? '#FF5C00' : 'rgba(255,255,255,0.06)',
              color: inputVal.trim() ? '#0A0A0A' : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: '4px', padding: '10px 20px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.05em',
            }}>
              {sendText}
            </button>
          </form>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '32px', flexWrap: 'wrap',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              flex: '1', minWidth: '140px',
              paddingRight: '40px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              marginRight: i < STATS.length - 1 ? '40px' : 0,
            }}>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                fontWeight: 800, color: '#FFFFFF', lineHeight: 1,
                marginBottom: '4px',
              }}>
                {s.n}
              </div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500,
              }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide counter — bottom right, editorial detail */}
      <div style={{
        position: 'absolute', bottom: '40px', right: '48px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: '8px',
        zIndex: 2,
      }}>
        <span style={{ color: '#FF5C00', fontWeight: 700 }}>01</span>
        <span>/</span>
        <span>AutoFlow Studio</span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-new-inner { padding: 0 24px !important; }
        }
        @media (max-width: 480px) {
          .hero-new-inner { padding: 0 16px !important; }
        }
      `}</style>
    </section>
  )
}
