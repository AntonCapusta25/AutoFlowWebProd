import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'
import { supabase } from '../../lib/supabase'

export default function AdminCalendar() {
  const { profile } = useAdmin()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('scheduler')
  const [followupsCalendarId, setFollowupsCalendarId] = useState('')
  const [tikTokCalendarId, setTikTokCalendarId] = useState('')
  const [linkedInCalendarId, setLinkedInCalendarId] = useState('')
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const shortLink = 'https://calendar.app.google/BVJPx8LMquzT35pE9'

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  useEffect(() => {
    if (activeTab === 'followups' && !followupsCalendarId) {
      fetchFollowupsCalendarId()
    } else if (activeTab === 'marketing' && (!tikTokCalendarId || !linkedInCalendarId)) {
      fetchMarketingCalendars()
    }
  }, [activeTab])

  const getDurationMinutes = (item) => {
    const text = ((item.concept_or_topic || '') + ' ' + (item.notes || '') + ' ' + (item.format || '')).toLowerCase()
    if (text.includes('15–20 min') || text.includes('15-20 min')) {
      return 20
    }
    if (text.includes('60 second') || text.includes('60-second') || text.includes('60s')) {
      return 10
    }
    if (text.includes('30 min')) {
      return 30
    }
    return 60 // 1 hour default
  }

  const [syncingCalendar, setSyncingCalendar] = useState(false)
  const syncLock = useRef(false)

  const syncGoogleCalendar = async (items) => {
    if (syncLock.current || syncingCalendar || !profile) return
    const isAdmin = profile.role === 'admin' || profile.role === 'Napoleon'
    if (!isAdmin) return
    
    const postsToSync = items.filter(p => !p.google_event_id)
    if (postsToSync.length === 0) return

    syncLock.current = true
    setSyncingCalendar(true)
    try {
      const slotsRegistry = {}
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

      const mappedPosts = postsToSync.map(item => {
        let dateStr = item.scheduled_date
        let isRecurring = false
        
        if (!dateStr && item.date_label) {
          const label = item.date_label.toLowerCase()
          if (label.includes('wk1') || label.includes('wk 1') || label.includes('week 1')) {
            dateStr = '2026-07-27'
          } else if (label.includes('wk2') || label.includes('wk 2') || label.includes('week 2')) {
            dateStr = '2026-08-03'
          } else if (label.includes('wk3') || label.includes('wk 3') || label.includes('week 3')) {
            dateStr = '2026-08-10'
          } else if (label.includes('wk4') || label.includes('wk 4') || label.includes('week 4')) {
            dateStr = '2026-08-17'
          }
          
          if (item.day_of_week && (item.day_of_week.includes('Mon–Sun') || item.day_of_week.includes('Mon-Sun') || item.day_of_week.includes('daily'))) {
            isRecurring = true
          }
        }
        
        if (!dateStr) {
          dateStr = new Date().toISOString().split('T')[0]
        }
        
        const duration = getDurationMinutes(item)
        let startHour = 10
        let startMin = 0
        
        if (isRecurring) {
          startHour = 9
          startMin = 0
        } else {
          const count = slotsRegistry[dateStr] || 0
          slotsRegistry[dateStr] = count + 1
          
          if (count === 0) {
            startHour = 10
          } else if (count === 1) {
            startHour = 13
          } else if (count === 2) {
            startHour = 15
          } else {
            startHour = 17
          }
        }

        const pad = (n) => String(n).padStart(2, '0')
        const formatLocalISO = (d) => {
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
        }

        const startDt = new Date(`${dateStr}T00:00:00`)
        startDt.setHours(startHour, startMin, 0, 0)
        const endDt = new Date(startDt.getTime() + duration * 60 * 1000)

        return {
          ...item,
          startTime: formatLocalISO(startDt),
          endTime: formatLocalISO(endDt),
          timeZone,
          recurrenceRule: isRecurring ? 'RRULE:FREQ=DAILY;COUNT=7' : null
        }
      })

      for (const p of mappedPosts) {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'create_marketing_event',
            platform: p.platform,
            scheduledDate: p.scheduled_date,
            dateLabel: p.date_label,
            dayOfWeek: p.day_of_week,
            account: p.account,
            pillar: p.pillar,
            format: p.format,
            hook: p.hook,
            conceptOrTopic: p.concept_or_topic,
            captionOrDestination: p.caption_or_destination,
            cta: p.cta,
            notes: p.notes,
            startTime: p.startTime,
            endTime: p.endTime,
            timeZone: p.timeZone,
            recurrenceRule: p.recurrenceRule
          }
        })
        if (!error && data?.eventId) {
          await supabase
            .from('marketing_calendar_items')
            .update({ google_event_id: data.eventId })
            .eq('id', p.id)
        }
      }
    } catch (err) {
      console.error('[Calendar] Error syncing content items to Google Calendar:', err)
    } finally {
      setSyncingCalendar(false)
      syncLock.current = false
    }
  }

  useEffect(() => {
    const isAdmin = profile?.role === 'admin' || profile?.role === 'Napoleon'
    if (activeTab === 'marketing' && isAdmin) {
      const runSync = async () => {
        const hasClearedOldGCal = localStorage.getItem('has_cleared_old_gcal_v7')
        if (!hasClearedOldGCal) {
          await supabase
            .from('marketing_calendar_items')
            .update({ google_event_id: null })
            .not('id', 'is', null)
          localStorage.setItem('has_cleared_old_gcal_v7', 'true')
        }
        
        const { data } = await supabase
          .from('marketing_calendar_items')
          .select('*')
        if (data) {
          await syncGoogleCalendar(data)
        }
      }
      runSync()
    }
  }, [activeTab, profile])

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true })
      if (!error && data) {
        setTeamMembers(data)
      }
    } catch (err) {
      console.error('[Calendar] Error fetching team profiles:', err)
    }
  }

  const fetchFollowupsCalendarId = async () => {
    setLoadingCalendar(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { type: 'get_followups_calendar_id' }
      })
      if (!error && data?.calendarId) {
        setFollowupsCalendarId(data.calendarId)
      } else {
        console.error('[Calendar] Error fetching follow-ups calendar ID:', error)
      }
    } catch (err) {
      console.error('[Calendar] Exception fetching calendar ID:', err)
    }
    setLoadingCalendar(false)
  }

  const fetchMarketingCalendars = async () => {
    setLoadingCalendar(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { type: 'get_marketing_calendars' }
      })
      if (!error && data?.tikTokCalendarId && data?.linkedInCalendarId) {
        setTikTokCalendarId(data.tikTokCalendarId)
        setLinkedInCalendarId(data.linkedInCalendarId)
      } else {
        console.error('[Calendar] Error fetching marketing calendars:', error)
      }
    } catch (err) {
      console.error('[Calendar] Exception fetching marketing calendars:', err)
    }
    setLoadingCalendar(false)
  }

  const handleForceResetSync = async () => {
    if (!confirm('Are you sure you want to reset all synced events? This will clear all calendar IDs in the database and trigger a fresh sync.')) return
    setLoadingCalendar(true)
    try {
      const { error } = await supabase
        .from('marketing_calendar_items')
        .update({ google_event_id: null })
        .not('id', 'is', null)
      if (!error) {
        alert('Database connections cleared! Starting fresh sync...')
        setTikTokCalendarId('')
        setLinkedInCalendarId('')
        await fetchMarketingCalendars()
      } else {
        alert('Error resetting database: ' + error.message)
      }
    } catch (err) {
      alert('Exception resetting sync: ' + err.message)
    }
    setLoadingCalendar(false)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const GCAL_COLORS = ['1','2','3','4','5','6','7','8','9','10','11']
  const COLOR_MAP = {
    '1': { name: 'Lavender', hex: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
    '2': { name: 'Sage', hex: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
    '3': { name: 'Grape', hex: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
    '4': { name: 'Tomato', hex: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
    '5': { name: 'Banana', hex: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
    '6': { name: 'Tangerine', hex: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' },
    '7': { name: 'Peacock', hex: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    '8': { name: 'Graphite', hex: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
    '9': { name: 'Blueberry', hex: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
    '10': { name: 'Basil', hex: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
    '11': { name: 'Flamingo', hex: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)' }
  }

  const getGoogleCalendarColor = (name) => {
    const norm = (name || '').trim().toLowerCase()
    if (!norm) return COLOR_MAP['9']
    let hash = 0
    for (let i = 0; i < norm.length; i++) {
      hash = ((hash << 5) - hash) + norm.charCodeAt(i)
      hash |= 0 // Convert to 32-bit integer
    }
    const colorId = GCAL_COLORS[Math.abs(hash) % GCAL_COLORS.length]
    return COLOR_MAP[colorId]
  }

  const getAdminColorBadge = (name) => {
    const colorObj = getGoogleCalendarColor(name)
    return { label: `${colorObj.name} (Your Color)`, color: colorObj.hex, bg: colorObj.bg }
  }

  const badge = getAdminColorBadge(profile?.name || profile?.email)

  return (
    <AdminLayout>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>Calendar Hub</h1>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', fontWeight: 500 }}>Manage client bookings and internal team follow-ups.</p>
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
              background: copied ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #d1bbfb, #5646e4)',
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
              boxShadow: copied ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(209, 187, 251,0.3)'
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

      {/* Sub-tabs Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '6px', borderRadius: '14px', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('scheduler')}
            style={{
              background: activeTab === 'scheduler' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: activeTab === 'scheduler' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
              color: activeTab === 'scheduler' ? 'white' : '#64748B',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📅 Client Booking Scheduler
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            style={{
              background: activeTab === 'followups' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: activeTab === 'followups' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
              color: activeTab === 'followups' ? 'white' : '#64748B',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔔 Team Follow-Ups Calendar
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            style={{
              background: activeTab === 'marketing' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: activeTab === 'marketing' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
              color: activeTab === 'marketing' ? 'white' : '#64748B',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📣 Marketing Content Calendar
          </button>
        </div>

        {activeTab === 'marketing' && (profile?.role === 'admin' || profile?.role === 'Napoleon') && (
          <button
            onClick={handleForceResetSync}
            disabled={syncingCalendar || loadingCalendar}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔄 Reset & Sync Calendars
          </button>
        )}
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
            {activeTab === 'scheduler' ? (
              <iframe 
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1QPv4EeVy2duOD95DWsndpXHj5szlOnQob7iBc2pSm0hX00QceACDO3PhdsNGin5Kupdyfa1N-?gv=true" 
                style={{ 
                  border: 0, 
                  width: '100%', 
                  height: '700px', 
                  display: 'block',
                  background: '#ffffff',
                  filter: 'invert(0.9) hue-rotate(180deg)'
                }}
                frameBorder="0"
              ></iframe>
            ) : activeTab === 'followups' ? (
              loadingCalendar ? (
                <div style={{ height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontWeight: 600 }}>
                  Loading Follow-Ups Calendar...
                </div>
              ) : followupsCalendarId ? (
                <iframe 
                  src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(followupsCalendarId)}&mode=WEEK&showPrint=0&showTabs=0&showCalendars=0&showTz=1`}
                  style={{ 
                    border: 0, 
                    width: '100%', 
                    height: '700px', 
                    display: 'block',
                    background: '#ffffff',
                    filter: 'invert(0.9) hue-rotate(180deg)'
                  }}
                  frameBorder="0"
                ></iframe>
              ) : (
                <div style={{ height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontWeight: 600, textAlign: 'center', padding: '0 24px' }}>
                  Failed to load Follow-Ups calendar.<br />Please ensure the edge function is deployed and access token is valid.
                </div>
              )
            ) : (
              loadingCalendar ? (
                <div style={{ height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontWeight: 600 }}>
                  Loading Marketing Calendars...
                </div>
              ) : (tikTokCalendarId && linkedInCalendarId) ? (
                <iframe 
                  src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(linkedInCalendarId)}&color=%233b82f6&src=${encodeURIComponent(tikTokCalendarId)}&color=%23ec4899&mode=AGENDA&showPrint=0&showTabs=0&showCalendars=0&showTz=1`}
                  style={{ 
                    border: 0, 
                    width: '100%', 
                    height: '700px', 
                    display: 'block',
                    background: '#ffffff',
                    filter: 'invert(0.9) hue-rotate(180deg)'
                  }}
                  frameBorder="0"
                ></iframe>
              ) : (
                <div style={{ height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontWeight: 600, textAlign: 'center', padding: '0 24px' }}>
                  Failed to load Marketing calendars.<br />Please ensure the edge function is deployed and access token is valid.
                </div>
              )
            )}
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
                background: 'linear-gradient(135deg, #d1bbfb, #5646e4)',
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
              {teamMembers.map(member => {
                const name = member.name || member.email?.split('@')[0] || 'Team Member'
                const colorObj = getGoogleCalendarColor(name)
                return (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{name}</span>
                    <span style={{ color: colorObj.hex, background: colorObj.bg, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>{colorObj.name}</span>
                  </div>
                )
              })}
              {teamMembers.length === 0 && (
                <p style={{ color: '#64748B', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>No team members loaded.</p>
              )}
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
