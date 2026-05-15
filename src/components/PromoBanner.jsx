import { useState, useEffect } from 'react'

export default function PromoBanner({ onCTA }) {
  const [timeLeft, setTimeLeft] = useState('23:59:59')
  const [isVisible, setIsVisible] = useState(true)


  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const hours = 23 - now.getHours()
      const minutes = 59 - now.getMinutes()
      const seconds = 59 - now.getSeconds()
      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div style={bannerContainerStyle}>
      <div className="promo-content" style={contentStyle}>
        {/* Pulsing Badge */}
        <div style={badgeContainerStyle}>
          <span style={pingStyle}></span>
          <span style={dotStyle}></span>
          <span style={badgeTextStyle}>LIMITED SPOTS</span>
        </div>

        {/* Message & Timer */}
        <div style={timerContainerStyle}>
          <span className="promo-msg" style={msgStyle}>PRICE INCREASING SOON!</span>
          <span style={timerBoxStyle}>{timeLeft}</span>
        </div>

        {/* CTA & Close */}
        <div style={actionsStyle}>
          <button onClick={onCTA} style={ctaStyle}>
            GET AUDIT
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginLeft:'6px'}}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>

          <button onClick={() => setIsVisible(false)} style={closeBtnStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes promo-ping {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @media (max-width: 768px) {
          .promo-msg { display: none; }
          .promo-content { padding: 8px 12px !important; gap: 10px !important; }
        }
      `}</style>
    </div>
  )
}

const bannerContainerStyle = {
  position: 'fixed',
  bottom: '24px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  width: 'calc(100% - 32px)',
  maxWidth: '850px',
  pointerEvents: 'none'
}

const contentStyle = {
  background: 'rgba(15, 17, 21, 0.4)',
  backdropFilter: 'blur(32px) saturate(180%)',
  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '100px',
  padding: '12px 12px 12px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '32px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
  pointerEvents: 'auto',
  position: 'relative',
  overflow: 'hidden'
}

const badgeContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexShrink: 0
}

const pingStyle = {
  position: 'absolute',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: '#e91e63',
  animation: 'promo-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
}

const dotStyle = {
  position: 'relative',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: '#e91e63',
  boxShadow: '0 0 15px rgba(233, 30, 99, 0.8)'
}

const badgeTextStyle = {
  fontFamily: "'Space Grotesk', sans-serif",
  color: '#e91e63',
  fontSize: '0.8rem',
  fontWeight: 800,
  letterSpacing: '0.12em',
  whiteSpace: 'nowrap'
}

const timerContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'center',
  minWidth: 0
}

const msgStyle = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '1.1rem',
  fontWeight: 700,
  color: 'white',
  marginRight: '20px',
  whiteSpace: 'nowrap',
  letterSpacing: '-0.02em'
}

const timerBoxStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  color: 'white',
  fontFamily: 'monospace',
  fontSize: '1.2rem',
  fontWeight: 700,
  padding: '6px 16px',
  borderRadius: '10px',
  letterSpacing: '0.1em',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
}

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexShrink: 0
}

const ctaStyle = {
  background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
  color: 'white',
  padding: '12px 28px',
  borderRadius: '100px',
  fontSize: '0.9rem',
  fontWeight: 800,
  textDecoration: 'none',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  boxShadow: '0 10px 25px rgba(233, 30, 99, 0.4)',
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  cursor: 'pointer'
}


const closeBtnStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  color: 'rgba(255,255,255,0.6)',
  padding: '10px',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

