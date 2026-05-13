import { useEffect, useRef, useState } from 'react'

// ─── Config ────────────────────────────────────────────────────────────────
// SVG canvas size (unitless – we use viewBox so it scales perfectly)
const W = 1400
const H = 1400
const CX = W / 2   // 700
const CY = H / 2   // 700
const ORBIT_R = 440 // Base radius for overlapping effect

// Refined 12 nodes for a sophisticated overlapping look
const NODE_ANGLES = Array.from({ length: 12 }, (_, i) => (i * 360) / 12 - 90)

const CARD_W = 380
const CARD_H = 260

function nodePos(index) {
  const angle = NODE_ANGLES[index % NODE_ANGLES.length]
  const rad = (angle * Math.PI) / 180
  return {
    x: CX + ORBIT_R * Math.cos(rad),
    y: CY + ORBIT_R * Math.sin(rad),
  }
}

const ICONS = {
  crm: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  lead: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  outreach: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  bot: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  ),
  web: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  custom: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  stats: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
}

export default function ServiceOrbit({ services = [] }) {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.25 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes so-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes so-spin-rev {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes so-pulse {
          0%, 100% {
            box-shadow: 0 0 40px 10px rgba(233,30,99,0.35),
                        0 0 80px 20px rgba(156,39,176,0.15),
                        inset 0 0 30px rgba(233,30,99,0.2);
          }
          50% {
            box-shadow: 0 0 70px 20px rgba(233,30,99,0.6),
                        0 0 140px 40px rgba(156,39,176,0.3),
                        inset 0 0 50px rgba(233,30,99,0.35);
          }
        }
        @keyframes so-dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes so-dash-rev {
          to { stroke-dashoffset: 600; }
        }
        @keyframes so-orbit-glow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }

        /* ── Node emerge: slides from center outward ── */
        @keyframes so-emerge { 
          from { opacity: 0; scale: 0.3; } 
          to { opacity: 1; scale: 1; } 
        }

        /* ── Perpetual slow orbital float ── */
        @keyframes so-float {
          0%   { transform: translate(-50%, -50%) translate(0, 0); }
          25%  { transform: translate(-50%, -50%) translate(8px, -6px); }
          50%  { transform: translate(-50%, -50%) translate(0, 10px); }
          75%  { transform: translate(-50%, -50%) translate(-8px, -4px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }

        /* ── Card Styles ── */
        .so-node-wrapper {
          position: absolute;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        .so-card {
          width: ${CARD_W}px;
          background: rgba(12,12,18,0.88);
          backdrop-filter: blur(20px);
          WebkitBackdropFilter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.7);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
          pointer-events: auto;
        }

        .so-card:hover {
          transform: scale(1.08) translateY(-5px);
          border-color: rgba(233,30,99,0.55);
          box-shadow: 0 24px 60px rgba(0,0,0,0.9), 0 0 40px rgba(233,30,99,0.3);
          background: rgba(20, 20, 30, 0.95);
        }

        .so-node-wrapper:hover {
          z-index: 50;
        }

        /* ── Responsive fallback ── */
        @media (max-width: 900px) {
          .so-desktop { display: none !important; }
          .so-mobile  { display: grid !important; }
        }
        @media (min-width: 901px) {
          .so-mobile { display: none !important; }
        }
      `}</style>

      {/* ── DESKTOP: SVG-based orbital layout ── */}
      <div
        ref={sectionRef}
        className="so-desktop"
        style={{ position: 'relative', width: '100%', maxWidth: `${W}px`, margin: '0 auto', userSelect: 'none' }}
      >
        {/* SVG canvas – connections + rings */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="so-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e91e63" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#9c27b0" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="so-ring-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e91e63" stopOpacity="0" />
              <stop offset="70%" stopColor="#e91e63" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#9c27b0" stopOpacity="0.18" />
            </radialGradient>
            <filter id="so-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="so-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={ORBIT_R} fill="url(#so-ring-glow)" />

          <circle
            cx={CX} cy={CY} r={ORBIT_R}
            fill="none"
            stroke="rgba(233,30,99,0.18)"
            strokeWidth="1.5"
            strokeDasharray="6 10"
            style={{ animation: 'so-spin 40s linear infinite', transformOrigin: `${CX}px ${CY}px` }}
          />
          <circle
            cx={CX} cy={CY} r={ORBIT_R + 22}
            fill="none"
            stroke="rgba(156,39,176,0.1)"
            strokeWidth="1"
            strokeDasharray="3 14"
            style={{ animation: 'so-spin-rev 55s linear infinite', transformOrigin: `${CX}px ${CY}px` }}
          />


          <circle
            cx={CX} cy={CY} r="95"
            fill="none"
            stroke="rgba(233,30,99,0.4)"
            strokeWidth="2"
            strokeDasharray="8 6"
            style={{ animation: 'so-spin 10s linear infinite', transformOrigin: `${CX}px ${CY}px` }}
          />
          <circle
            cx={CX} cy={CY} r="76"
            fill="none"
            stroke="rgba(156,39,176,0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            style={{ animation: 'so-spin-rev 14s linear infinite', transformOrigin: `${CX}px ${CY}px` }}
          />
          <circle
            cx={CX} cy={CY} r="68"
            fill="rgba(10,10,10,0.95)"
            stroke="rgba(233,30,99,0.6)"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 20px rgba(233,30,99,0.5))' }}
          />
        </svg>

        <div style={{
          position: 'absolute',
          top: `${(CY / H) * 100}%`,
          left: `${(CX / W) * 100}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
          animation: 'so-pulse 4s ease-in-out infinite',
        }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(233,30,99,0.7)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <span style={{
            color: 'white', fontWeight: 900, fontSize: '0.8rem',
            textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: 1.3,
            textAlign: 'center',
            textShadow: '0 0 20px rgba(233,30,99,0.8)',
          }}>
            AutoFlow<br />Core
          </span>
        </div>

        {Array.from({ length: 12 }).map((_, i) => {
          const service = services[i % services.length] || { title: '...', desc: '...', icon: 'custom' }
          const { x, y } = nodePos(i)
          const leftPct = (x / W) * 100
          const topPct = (y / H) * 100
          const delay = 0.1 + i * 0.1

          return (
            <div
              key={i}
              className="so-node-wrapper"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                opacity: visible ? 1 : 0,
                transition: `opacity 0.7s ease ${delay}s`,
                // Float animation starts after the entrance transition (0.7s + delay)
                animation: visible ? `so-float ${14 + i * 1.5}s ease-in-out infinite` : 'none',
                animationDelay: `${0.8 + delay}s`,
              }}
            >
              <div className="so-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(233,30,99,0.2), rgba(156,39,176,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#e91e63', flexShrink: 0,
                  }}>
                    {ICONS[service.icon] || ICONS.custom}
                  </div>
                  <h3 style={{
                    margin: 0, color: '#fff',
                    fontSize: '1rem', fontWeight: 800,
                    letterSpacing: '-0.02em', lineHeight: 1.2,
                  }}>
                    {service.title}
                  </h3>
                </div>
                <p style={{
                  margin: 0, color: '#94A3B8',
                  fontSize: '0.82rem', lineHeight: 1.6,
                }}>
                  {service.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── MOBILE fallback: simple grid ── */}
      <div className="so-mobile" style={{
        display: 'none',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        padding: '0 4px',
      }}>
        {services.map((service, i) => (
          <div key={i} style={{
            background: 'rgba(12,12,18,0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '22px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(233,30,99,0.2), rgba(156,39,176,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#e91e63',
              }}>
                {ICONS[service.icon] || ICONS.custom}
              </div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800 }}>{service.title}</h3>
            </div>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.6 }}>{service.desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}
