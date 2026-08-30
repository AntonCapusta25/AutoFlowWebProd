import React from 'react'
import { getT } from '../i18n/translations'

const PARTNERS = [
  {
    name: 'Gemini 2.0',
    color: '#4285F4',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#gem-g)" />
        <defs>
          <linearGradient id="gem-g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4285F4" />
            <stop offset="0.5" stopColor="#9B51E0" />
            <stop offset="1" stopColor="#E91E63" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    name: 'Supabase DB',
    color: '#3ECF8E',
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M13.35 21.64c-.66.86-2.02.39-2.02-.69v-7.98H2.86c-1.12 0-1.74-1.3-.98-2.12L10.65 2.36c.66-.86 2.02-.39 2.02.69v7.98h8.47c1.12 0 1.74 1.3.98 2.12l-8.77 8.49z" fill="#3ECF8E" />
      </svg>
    )
  },
  {
    name: 'Anthropic Claude',
    color: '#D97757',
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#D97757">
        <path d="M17.44 3H13.8L21 21h3.6L17.44 3zm-10.88 0L0 21h3.66l1.62-4.1h7.4l1.62 4.1H18L11.44 3H6.56zm.6 4.3h3.58l2.6 6.6H5.56l2.6-6.6z" />
      </svg>
    )
  },
  {
    name: 'OpenAI ChatGPT',
    color: '#10A37F',
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#10A37F">
        <path d="M22.28 9.87a5.98 5.98 0 0 0-.52-4.85 6.07 6.07 0 0 0-6.52-2.9 6 6 0 0 0-4.63-2.08 6.07 6.07 0 0 0-5.8 4.2 6 6 0 0 0-4.11 3 6.07 6.07 0 0 0 .73 6.62 5.98 5.98 0 0 0 .52 4.85 6.07 6.07 0 0 0 6.52 2.9 6 6 0 0 0 4.63 2.08 6.07 6.07 0 0 0 5.8-4.2 6 6 0 0 0 4.11-3 6.07 6.07 0 0 0-.73-6.62zM12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z" />
      </svg>
    )
  },
  {
    name: 'Stripe Payments',
    color: '#635BFF',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#635BFF">
        <path d="M13.98 11.07c-1.3-.35-2.22-.68-2.22-1.34 0-.56.55-.95 1.5-.95 1.68 0 3.12.63 4.1 1.25l1.24-2.85C17.43 6.42 15.65 5.8 13.5 5.8c-3.4 0-5.8 1.74-5.8 4.6 0 3.63 5 4.3 5 6.22 0 .72-.65 1.12-1.74 1.12-2.02 0-3.87-.9-5.02-1.8l-1.3 2.9c1.4 1.12 3.62 1.95 6.22 1.95 3.65 0 6.1-1.7 6.1-4.7 0-3.88-5.18-4.45-5.18-6.32z" />
      </svg>
    )
  },
  {
    name: 'Vercel Platform',
    color: '#000000',
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0F172A">
        <path d="M12 1L24 22H0L12 1Z" />
      </svg>
    )
  },
  {
    name: 'Google Cloud',
    color: '#4285F4',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#4285F4">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </svg>
    )
  },
  {
    name: 'Meta AI',
    color: '#0668E1',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#0668E1">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
      </svg>
    )
  },
  {
    name: 'PostgreSQL',
    color: '#336791',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#336791">
        <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    )
  },
  {
    name: 'Python Engine',
    color: '#3776AB',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#3776AB">
        <path d="M12 2c-5.5 0-5 2.4-5 2.4v2.5h5.1v.7H5c-2.4 0-4.4 1.4-4.4 4.8 0 3.4 1.7 4.7 4.4 4.7h1.4v-2.1c0-2.4 2-4.4 4.4-4.4h5.1c1.5 0 2.7-1.2 2.7-2.7V4.4c0-2.4-2.7-2.4-6.6-2.4z" />
      </svg>
    )
  },
  {
    name: 'WhatsApp Business API',
    color: '#25D366',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z" />
      </svg>
    )
  },
  {
    name: 'Resend & SendGrid',
    color: '#EA4335',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#EA4335">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    )
  }
]

export default function PartnersStrip({ lang = 'en', darkBg = false }) {
  const t = getT(lang)

  return (
    <div 
      className="logos-section" 
      style={{ 
        paddingTop: '36px', 
        paddingBottom: '36px', 
        background: darkBg ? '#030712' : '#ffffff',
        borderTop: darkBg ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15, 23, 42, 0.06)',
        borderBottom: darkBg ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15, 23, 42, 0.06)'
      }}
    >
      <div 
        className="logos-label" 
        style={{ 
          color: darkBg ? '#94A3B8' : '#64748B',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: '20px'
        }}
      >
        {t.logosLabel || (lang === 'nl' ? "Onze Partners & API's" : 'Our Partners & APIs')}
      </div>
      <div className="logos-track-container">
        <div className="logos-track">
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((l, i) => (
            <div key={i} className="logo-item">
              <div 
                className="logo-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  height: '46px',
                  padding: '0 22px',
                  background: darkBg ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  border: darkBg ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15, 23, 42, 0.08)',
                  borderRadius: '50px',
                  minWidth: 'max-content',
                  boxShadow: darkBg ? 'none' : '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {l.svg}
                </div>
                <span style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                  color: darkBg ? '#F8FAFC' : '#0F172A',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em'
                }}>
                  {l.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
