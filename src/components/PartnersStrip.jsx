import React from 'react'
import { getT } from '../i18n/translations'

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

export default function PartnersStrip({ lang = 'en', darkBg = true }) {
  const t = getT(lang)

  return (
    <div 
      className="logos-section" 
      style={{ 
        paddingTop: '40px', 
        paddingBottom: '40px', 
        background: darkBg ? '#030712' : '#ffffff',
        borderTop: darkBg ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
        borderBottom: darkBg ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
      }}
    >
      <div 
        className="logos-label" 
        style={{ 
          color: darkBg ? '#94A3B8' : '#64748B',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: '24px'
        }}
      >
        {t.logosLabel || (lang === 'nl' ? "Onze Partners & API's" : 'Our Partners & APIs')}
      </div>
      <div className="logos-track-container">
        <div className="logos-track">
          {[...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
            <div key={i} className="logo-item">
              <div 
                className="logo-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '52px',
                  padding: '0 28px',
                  background: darkBg ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: darkBg ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '50px',
                  minWidth: 'max-content',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {l.type === 'image' ? (
                  <img 
                    src={l.src} 
                    alt={l.name}
                    width="70"
                    height={l.name === 'Recraft' ? 46 : l.name === 'Oceanlove' ? 48 : 32}
                    style={{ 
                      height: l.name === 'Recraft' ? '42px' : l.name === 'Oceanlove' ? '44px' : '28px', 
                      width: 'auto', 
                      maxWidth: '220px',
                      objectFit: 'contain',
                      filter: darkBg ? 'brightness(0) invert(1)' : 'none'
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: darkBg ? '#F8FAFC' : '#0F172A',
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
  )
}
