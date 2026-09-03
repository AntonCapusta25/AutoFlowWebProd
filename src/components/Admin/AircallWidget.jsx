import React, { useEffect } from 'react'

/**
 * Aircall Pop-out Window Dialer Launcher
 *
 * Opens Aircall Web Phone in a dedicated top-level pop-out window (width=380, height=660).
 * Top-level window execution bypasses Chrome cross-origin iframe WebRTC microphone restrictions completely.
 */
export function openAircallPhoneWindow(phone = '') {
  const url = `https://phone.aircall.io${phone ? `?number=${encodeURIComponent(phone)}` : ''}`
  const width = 380
  const height = 660
  const left = window.screen.width ? window.screen.width - width - 40 : 100
  const top = 100

  const features = `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no`
  const phoneWindow = window.open(url, 'AircallWebPhoneWindow', features)
  if (phoneWindow) {
    phoneWindow.focus()
  }
  return phoneWindow
}

export default function AircallWidget() {
  useEffect(() => {
    function handleDialEvent(e) {
      if (e.detail && e.detail.phone) {
        openAircallPhoneWindow(e.detail.phone)
      }
    }

    window.addEventListener('aircall:dial', handleDialEvent)
    return () => window.removeEventListener('aircall:dial', handleDialEvent)
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'Arial, sans-serif' }}>
      <button
        onClick={() => openAircallPhoneWindow('')}
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
        title="Open Aircall Web Phone Window"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        Aircall Phone
      </button>
    </div>
  )
}
