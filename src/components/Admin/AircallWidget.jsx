import React, { useState, useEffect } from 'react'

/**
 * Aircall Floating Web Phone & Call Launcher Widget
 *
 * Provides a floating web dialer in bottom-right corner of CRM with:
 * - Direct iframe to Aircall Web Phone (https://phone.aircall.io)
 * - Quick dial input for any phone number
 * - Listens for 'aircall:dial' events triggered from lead table / calendar
 */
export default function AircallWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeNumber, setActiveNumber] = useState('')
  const [lastDialedLead, setLastDialedLead] = useState(null)

  useEffect(() => {
    function handleDialEvent(e) {
      if (e.detail && e.detail.phone) {
        setActiveNumber(e.detail.phone)
        setLastDialedLead(e.detail)
        setIsOpen(true)
      }
    }
    window.addEventListener('aircall:dial', handleDialEvent)
    return () => window.removeEventListener('aircall:dial', handleDialEvent)
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'Arial, sans-serif' }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #00B2A9, #008080)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0, 178, 169, 0.4)',
            transition: 'transform 0.2s, boxShadow 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Aircall Phone
        </button>
      )}

      {/* Expanded Aircall Web Dialer Drawer */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            height: '600px',
            background: '#0d1117',
            border: '1px solid rgba(0, 178, 169, 0.4)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #00B2A9, #006666)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.95rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Aircall Web Dialer
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
                opacity: 0.8,
              }}
            >
              ✕
            </button>
          </div>

          {/* Target Lead Info bar */}
          {lastDialedLead && (
            <div style={{ padding: '10px 16px', background: 'rgba(0, 178, 169, 0.1)', borderBottom: '1px solid rgba(0, 178, 169, 0.2)', fontSize: '0.8rem', color: '#80e5e0' }}>
              Calling: <strong>{lastDialedLead.leadName || lastDialedLead.company || activeNumber}</strong> ({activeNumber})
            </div>
          )}

          {/* Embedded Aircall Web Phone */}
          <iframe
            src={`https://phone.aircall.io${activeNumber ? `?number=${encodeURIComponent(activeNumber)}` : ''}`}
            title="Aircall Web Phone"
            allow="microphone; autoplay; clipboard-read; clipboard-write"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#ffffff',
            }}
          />
        </div>
      )}
    </div>
  )
}
