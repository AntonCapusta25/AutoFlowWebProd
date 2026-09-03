import React, { useState, useEffect } from 'react'

/**
 * Aircall Floating Web Phone & CTI Dialer Widget
 *
 * Embeds official Aircall Web Phone (https://phone.aircall.io).
 * Automatically requests parent window microphone permission so Chrome
 * grants audio access to the embedded iframe without permission error banners.
 */
export default function AircallWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeNumber, setActiveNumber] = useState('')
  const [activeLeadName, setActiveLeadName] = useState('')
  const [micStatus, setMicStatus] = useState('prompt') // 'prompt', 'granted', 'denied'

  // Request browser microphone permission on parent window
  async function requestMicrophonePermission() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('[aircall-widget] Microphone permission granted!')
        setMicStatus('granted')
        // Stop temporary track stream
        stream.getTracks().forEach(track => track.stop())
      } catch (err) {
        console.warn('[aircall-widget] Microphone permission denied or prompt error:', err)
        setMicStatus('denied')
      }
    }
  }

  useEffect(() => {
    function handleDialEvent(e) {
      if (e.detail && e.detail.phone) {
        setActiveNumber(e.detail.phone)
        setActiveLeadName(e.detail.leadName || e.detail.company || '')
        setIsOpen(true)
        requestMicrophonePermission()
      }
    }

    window.addEventListener('aircall:dial', handleDialEvent)
    return () => window.removeEventListener('aircall:dial', handleDialEvent)
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
    requestMicrophonePermission()
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'Arial, sans-serif' }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
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
            height: '640px',
            maxWidth: '92vw',
            maxHeight: '88vh',
            background: '#0d1117',
            border: '1px solid rgba(0, 178, 169, 0.4)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
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

          {/* Microphone Permission Prompt Bar if denied/not granted */}
          {micStatus !== 'granted' && (
            <div style={{ padding: '10px 16px', background: 'rgba(245, 158, 11, 0.15)', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fbbf24' }}>
              <span>🎙️ Allow Microphone Access for Calls</span>
              <button
                onClick={requestMicrophonePermission}
                style={{
                  padding: '4px 10px',
                  background: '#f59e0b',
                  color: 'black',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Enable Mic
              </button>
            </div>
          )}

          {/* Active Lead Info Sub-bar */}
          {activeNumber && (
            <div style={{ padding: '10px 16px', background: 'rgba(0, 178, 169, 0.12)', borderBottom: '1px solid rgba(0, 178, 169, 0.2)', fontSize: '0.85rem', color: '#80e5e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Target: <strong>{activeLeadName || activeNumber}</strong> ({activeNumber})</span>
              <button
                onClick={() => setActiveNumber('')}
                style={{ background: 'transparent', border: 'none', color: '#80e5e0', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Embedded Aircall Phone Iframe */}
          <iframe
            src={`https://phone.aircall.io${activeNumber ? `?number=${encodeURIComponent(activeNumber)}` : ''}`}
            title="Aircall Web Phone"
            allow="microphone; camera; autoplay; clipboard-read; clipboard-write; display-capture; speaker-selection; hid"
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
