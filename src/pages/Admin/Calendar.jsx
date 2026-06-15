import { useState } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'

export default function AdminCalendar() {
  const { profile } = useAdmin()
  const [copied, setCopied] = useState(false)
  const shortLink = 'https://calendar.app.google/BVJPx8LMquzT35pE9'

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getAdminColorBadge = (name) => {
    const norm = (name || '').toLowerCase()
    if (norm.includes('justin')) {
      return { label: 'Lavender / Blue', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' }
    }
    if (norm.includes('mzi')) {
      return { label: 'Tomato / Red', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' }
    }
    return { label: 'Lavender / Blue (Default)', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' }
  }

  const badge = getAdminColorBadge(profile?.name || profile?.email)

  return (
    <AdminLayout>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>Shared Scheduling Hub</h1>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', fontWeight: 500 }}>View team appointments and share your scheduling link with clients.</p>
        </div>
        
        {/* Quick share action */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '16px', 
          padding: '12px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Booking Link</p>
            <p style={{ margin: 0, color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600 }}>calendar.app.google/BVJPx8L...</p>
          </div>
          <button 
            onClick={handleCopyLink}
            style={{ 
              background: copied ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #e91e63, #9c27b0)',
              border: 'none', 
              color: 'white', 
              padding: '10px 18px', 
              borderRadius: '10px', 
              fontWeight: 700, 
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: copied ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(233,30,99,0.3)'
            }}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
        
        {/* Calendar Frame */}
        <div style={{ 
          background: '#0a0a0a', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid rgba(255,255,255,0.05)',
            background: '#111'
          }}>
            <iframe 
              src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1QPv4EeVy2duOD95DWsndpXHj5szlOnQob7iBc2pSm0hX00QceACDO3PhdsNGin5Kupdyfa1N-?gv=true" 
              style={{ border: 0, width: '100%', height: '700px', display: 'block' }}
              frameBorder="0"
            ></iframe>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div style={{ display: 'grid', gap: '24px' }}>
          
          {/* Active Profile Info */}
          <div style={{ 
            background: '#0a0a0a', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: '24px', 
            padding: '24px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ margin: '0 0 20px', color: 'white', fontSize: '1rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Your Scheduling Profile</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: 'white',
                fontSize: '0.9rem'
              }}>
                {(profile?.name || profile?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{profile?.name || 'Admin'}</p>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem' }}>{profile?.email}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <p style={{ margin: '0 0 6px', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Event Color</p>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: badge.bg, 
                  color: badge.color, 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 800 
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: badge.color }} />
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Color Mapping Reference */}
          <div style={{ 
            background: '#0a0a0a', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: '24px', 
            padding: '24px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ margin: '0 0 16px', color: 'white', fontSize: '1rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Team Color Codes</h4>
            <p style={{ margin: '0 0 20px', color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5' }}>Events are color-coded in the primary calendar based on the agent booking them:</p>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>Justin</span>
                <span style={{ color: '#818cf8', background: 'rgba(129, 140, 248, 0.15)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>Lavender</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>Mzi</span>
                <span style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.15)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>Tomato</span>
              </div>
            </div>
          </div>

          {/* Sync Status Info */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(16,185,129,0.05))', 
            border: '1px solid rgba(59, 130, 246, 0.15)', 
            borderRadius: '24px', 
            padding: '24px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px', color: '#93c5fd', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              CRM Pipeline Sync
            </h4>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', lineHeight: '1.6' }}>
              Booking a call through this hub automatically transitions the lead's status to <strong>"Meeting Booked"</strong> and creates a deal in your revenue splits tracker.
            </p>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
