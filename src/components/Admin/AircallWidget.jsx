import React, { useEffect, useState, useRef } from 'react'
import AircallWorkspaceModule from 'aircall-everywhere'
import {
  setAircallWorkspaceInstance,
  requestMicPermission,
  showStatusToast
} from '../../lib/aircall'

const AircallWorkspace = AircallWorkspaceModule.default || AircallWorkspaceModule

/**
 * Open pop-out window if user prefers separate floating window
 */
export function openAircallPhoneWindow(phone = '') {
  const url = `https://workspace.aircall.io${phone ? `?number=${encodeURIComponent(phone)}` : ''}`
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
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [micGranted, setMicGranted] = useState(true)
  const [activeCall, setActiveCall] = useState(null)
  const workspaceRef = useRef(null)

  useEffect(() => {
    // 1. Prompt top-level microphone permission for Chrome WebRTC cross-origin iframe delegation
    requestMicPermission().then(granted => {
      setMicGranted(granted)
    })

    // 2. Initialize Aircall Everywhere Workspace SDK
    try {
      const workspace = new AircallWorkspace({
        domToLoadWorkspace: '#aircall-workspace-frame',
        size: 'auto',
        debug: false,
        onLogin: (data) => {
          console.log('[aircall-widget] Logged into Aircall Workspace:', data)
          setIsLoggedIn(true)
          setAircallWorkspaceInstance(workspace)
        },
        onLogout: () => {
          console.log('[aircall-widget] Logged out of Aircall Workspace')
          setIsLoggedIn(false)
          setAircallWorkspaceInstance(null)
        }
      })

      workspaceRef.current = workspace
      setAircallWorkspaceInstance(workspace)

      // Event listeners for active call states
      workspace.on('outgoing_call', (data) => {
        console.log('[aircall-widget] Outgoing call started:', data)
        setActiveCall({ type: 'outgoing', ...data })
        setIsOpen(true)
      })

      workspace.on('incoming_call', (data) => {
        console.log('[aircall-widget] Incoming call ringing:', data)
        setActiveCall({ type: 'incoming', ...data })
        setIsOpen(true)
      })

      workspace.on('call_ended', (data) => {
        console.log('[aircall-widget] Call ended:', data)
        setActiveCall(null)
      })
    } catch (err) {
      console.warn('[aircall-widget] Failed to initialize AircallWorkspace:', err)
    }

    // Handle external dial events
    function handleDialEvent(e) {
      setIsOpen(true)
    }

    function handleWidgetOpen() {
      setIsOpen(true)
    }

    window.addEventListener('aircall:dial', handleDialEvent)
    window.addEventListener('aircall:widget:open', handleWidgetOpen)

    return () => {
      window.removeEventListener('aircall:dial', handleDialEvent)
      window.removeEventListener('aircall:widget:open', handleWidgetOpen)
    }
  }, [])

  const handleGrantMic = async () => {
    const granted = await requestMicPermission()
    setMicGranted(granted)
    if (granted) {
      showStatusToast('🎙️ Microphone access granted!')
    } else {
      alert('Microphone access was denied. Please allow microphone access in your browser settings bar (lock icon).')
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'Arial, sans-serif' }}>
      {/* Expanded Phone Container Panel */}
      <div
        style={{
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          width: '380px',
          height: '660px',
          background: '#0f172a',
          borderRadius: '20px',
          border: '1px solid rgba(0, 178, 169, 0.4)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          marginBottom: '12px',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: activeCall ? '#22c55e' : (isLoggedIn ? '#00B2A9' : '#f59e0b'),
                boxShadow: activeCall ? '0 0 10px #22c55e' : 'none',
              }}
            />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>
              {activeCall ? 'Active Call' : (isLoggedIn ? 'Aircall Online' : 'Aircall Phone')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!micGranted && (
              <button
                onClick={handleGrantMic}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Click to allow microphone"
              >
                🎙️ Enable Mic
              </button>
            )}

            {/* Pop-out Window Button */}
            <button
              onClick={() => openAircallPhoneWindow('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              title="Open in pop-out window"
            >
              ↗
            </button>

            {/* Minimize Panel Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              title="Minimize panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mic Permission Banner if disabled */}
        {!micGranted && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Browser microphone permission required for WebRTC.</span>
            <button
              onClick={handleGrantMic}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Allow Mic
            </button>
          </div>
        )}

        {/* Embedded Workspace Frame (Aircall Everywhere SDK injection target) */}
        <div
          id="aircall-workspace-frame"
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            background: '#0d1117',
          }}
        />
      </div>

      {/* Launcher Floating Button */}
      <button
        onClick={() => {
          if (!micGranted) requestMicPermission().then(setMicGranted)
          setIsOpen(!isOpen)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          background: activeCall ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00B2A9, #008080)',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          boxShadow: activeCall ? '0 10px 25px rgba(16, 185, 129, 0.5)' : '0 10px 25px rgba(0, 178, 169, 0.4)',
          transition: 'transform 0.2s, boxShadow 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Toggle Aircall Web Phone"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span>{activeCall ? 'In Call...' : 'Aircall Phone'}</span>
        {!micGranted && (
          <span style={{ fontSize: '0.75rem', background: '#ef4444', padding: '2px 6px', borderRadius: '10px' }}>
            Mic Off
          </span>
        )}
      </button>
    </div>
  )
}
