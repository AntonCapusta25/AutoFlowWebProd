import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { supabase } from '../../lib/supabase'
import { useAdmin } from '../../components/Admin/AdminContext'

const KPI_DEFINITIONS = [
  {
    id: 'linkedin_posts',
    label: 'LinkedIn Posts',
    target: 1,
    targetMax: null,
    unit: 'posts',
    period: 'daily',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: '#0077B5',
    gradient: 'linear-gradient(135deg, #0077B5, #00a0dc)',
    glow: 'rgba(0, 119, 181, 0.3)',
  },
  {
    id: 'x_posts',
    label: 'X (Twitter) Posts',
    target: 3,
    targetMax: 5,
    unit: 'posts',
    period: 'daily',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: '#e7e9ea',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    glow: 'rgba(231, 233, 234, 0.15)',
  },
  {
    id: 'instagram_posts',
    label: 'Instagram Posts',
    target: 1,
    targetMax: null,
    unit: 'posts',
    period: 'daily',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    glow: 'rgba(225, 48, 108, 0.3)',
  },
  {
    id: 'linkedin_connections',
    label: 'Nieuwe LinkedIn Connecties',
    target: 50,
    targetMax: null,
    unit: 'connections',
    period: 'weekly',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: '#0077B5',
    gradient: 'linear-gradient(135deg, #0077B5, #00a0dc)',
    glow: 'rgba(0, 119, 181, 0.3)',
  },
  {
    id: 'sales_dms',
    label: "Sales DM's",
    target: 20,
    targetMax: null,
    unit: 'messages',
    period: 'daily',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  {
    id: 'cold_emails',
    label: 'Cold Emails',
    target: 30,
    targetMax: 50,
    unit: 'emails',
    period: 'daily',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  {
    id: 'sales_calls',
    label: 'Sales Calls',
    target: 2,
    targetMax: 5,
    unit: 'calls',
    period: 'daily',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
    glow: 'rgba(245, 158, 11, 0.3)',
  }
]

// Get local date string YYYY-MM-DD
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getWeekRange(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday (0) to make monday first day
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  
  return {
    monday: getLocalDateString(monday),
    sunday: getLocalDateString(sunday)
  }
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Marketing() {
  const { user } = useAdmin()
  const [recordDate, setRecordDate] = useState(getLocalDateString())
  const [actuals, setActuals] = useState({})
  const [weeklySums, setWeeklySums] = useState({})
  const [saving, setSaving] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchKPIs = useCallback(async (selectedDate) => {
    setLoading(true)
    const { monday, sunday } = getWeekRange(selectedDate)

    const { data } = await supabase
      .from('marketing_kpis')
      .select('*')
      .gte('record_date', monday)
      .lte('record_date', sunday)

    if (data) {
      // 1. Build map for selected day
      const dayMap = {}
      data.filter(r => r.record_date === selectedDate).forEach(row => {
        dayMap[row.kpi_id] = row.actual
      })
      setActuals(dayMap)

      // 2. Build map for weekly sums
      const sumMap = {}
      data.forEach(row => {
        sumMap[row.kpi_id] = (sumMap[row.kpi_id] || 0) + row.actual
      })
      setWeeklySums(sumMap)
    } else {
      setActuals({})
      setWeeklySums({})
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchKPIs(recordDate)
  }, [recordDate, fetchKPIs])

  async function saveActual(kpiId, value) {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 0) return

    setSaving(prev => ({ ...prev, [kpiId]: true }))

    // Update local state immediately for snappy feel
    const prevDayVal = actuals[kpiId] || 0
    const diff = num - prevDayVal

    setActuals(prev => ({ ...prev, [kpiId]: num }))
    setWeeklySums(prev => ({ ...prev, [kpiId]: (prev[kpiId] || 0) + diff }))

    await supabase
      .from('marketing_kpis')
      .upsert({ record_date: recordDate, kpi_id: kpiId, actual: num, updated_by: user?.id }, { onConflict: 'record_date,kpi_id' })

    setTimeout(() => setSaving(prev => ({ ...prev, [kpiId]: false })), 600)
  }

  const prevDay = () => {
    const d = new Date(recordDate)
    d.setDate(d.getDate() - 1)
    setRecordDate(getLocalDateString(d))
  }

  const nextDay = () => {
    const d = new Date(recordDate)
    d.setDate(d.getDate() + 1)
    const nextStr = getLocalDateString(d)
    if (nextStr <= getLocalDateString()) {
      setRecordDate(nextStr)
    }
  }

  const jumpToToday = () => {
    setRecordDate(getLocalDateString())
  }

  const isToday = recordDate === getLocalDateString()

  // Overall calculations
  const dailyKpis = KPI_DEFINITIONS.filter(k => k.period === 'daily')
  const weeklyKpis = KPI_DEFINITIONS.filter(k => k.period === 'weekly')

  // Calculate daily targets hit today
  const dailyTargetsHit = dailyKpis.filter(kpi => {
    const actual = actuals[kpi.id] || 0
    return actual >= kpi.target
  }).length

  // Calculate overall weekly score
  const totalWeeklyScore = KPI_DEFINITIONS.reduce((acc, kpi) => {
    if (kpi.period === 'weekly') {
      const sum = weeklySums[kpi.id] || 0
      return acc + Math.min(sum / kpi.target, 1)
    } else {
      // Daily KPI: target for the week is daily_target * 7
      const sum = weeklySums[kpi.id] || 0
      const weeklyTarget = kpi.target * 7
      return acc + Math.min(sum / weeklyTarget, 1)
    }
  }, 0)
  const overallWeeklyPct = Math.round((totalWeeklyScore / KPI_DEFINITIONS.length) * 100)

  const { monday, sunday } = getWeekRange(recordDate)

  return (
    <AdminLayout>
      <style>{`
        @keyframes kpiPulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
        @keyframes barFill { from { width: 0 } }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .kpi-card:hover { transform: translateY(-2px); }
        .kpi-input::-webkit-inner-spin-button, .kpi-input::-webkit-outer-spin-button { opacity: 0.5; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>
              Marketing KPIs
            </h1>
            <p style={{ color: '#64748B', margin: 0 }}>Daily KPI tracking with weekly aggregated targets</p>
          </div>

          {/* Date & Week Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={prevDay}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: '#94A3B8', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              
              <div style={{
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                padding: '8px 16px', textAlign: 'center', minWidth: '220px'
              }}>
                <div style={{ fontSize: '0.7rem', color: isToday ? '#10b981' : '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  {isToday ? '🟢 Today' : 'Selected Day'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{formatDayLabel(recordDate)}</div>
              </div>

              <button
                onClick={nextDay}
                disabled={isToday}
                style={{
                  background: isToday ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: isToday ? '#334155' : '#94A3B8', cursor: isToday ? 'default' : 'pointer', padding: '8px', display: 'flex', alignItems: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Week: {monday} to {sunday}</span>
              {!isToday && (
                <button
                  onClick={jumpToToday}
                  style={{
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: '8px', color: '#34d399', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', cursor: 'pointer'
                  }}
                >
                  Back to Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
          
          {/* Daily checklist completion */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Daily Target Checklist</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: dailyTargetsHit === dailyKpis.length ? '#10b981' : '#f59e0b' }}>
                {dailyTargetsHit} / {dailyKpis.length} Hit
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(dailyTargetsHit / dailyKpis.length) * 100}%`,
                borderRadius: '999px',
                background: dailyTargetsHit === dailyKpis.length
                  ? 'linear-gradient(90deg, #059669, #34d399)'
                  : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                transition: 'width 0.4s ease-out',
              }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#475569' }}>Tracks number of daily targets hit on this day</p>
          </div>

          {/* Weekly cumulative completion */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Weekly Aggregate Score</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: overallWeeklyPct >= 80 ? '#10b981' : overallWeeklyPct >= 50 ? '#f59e0b' : '#e91e63' }}>
                {overallWeeklyPct}%
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${overallWeeklyPct}%`,
                borderRadius: '999px',
                background: overallWeeklyPct >= 80
                  ? 'linear-gradient(90deg, #059669, #34d399)'
                  : overallWeeklyPct >= 50
                    ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                    : 'linear-gradient(90deg, #e91e63, #f06292)',
                transition: 'width 0.4s ease-out',
              }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#475569' }}>Progress against targets across the entire week</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>Loading KPIs...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {KPI_DEFINITIONS.map(kpi => {
            const dayVal = actuals[kpi.id] ?? ''
            const dayValNum = parseInt(dayVal, 10) || 0
            const weekSum = weeklySums[kpi.id] || 0

            // Target calculations
            const isWeekly = kpi.period === 'weekly'
            const target = kpi.targetMax || kpi.target
            const kpiTargetWeekly = isWeekly ? target : target * 7

            // Percentages
            const progressPct = Math.min(Math.round((dayValNum / target) * 100), 100)
            const weeklyProgressPct = Math.min(Math.round((weekSum / kpiTargetWeekly) * 100), 100)

            const isAchievedToday = dayValNum >= kpi.target
            const isOverToday = kpi.targetMax && dayValNum > kpi.targetMax

            return (
              <div
                key={kpi.id}
                className="kpi-card"
                style={{
                  background: '#0a0a0a',
                  border: `1px solid ${isAchievedToday && !isWeekly ? `rgba(${kpi.color.slice(1).match(/../g).map(x=>parseInt(x,16)).join(',')}, 0.25)` : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: isAchievedToday && !isWeekly ? `0 0 30px ${kpi.glow}` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '14px',
                      background: kpi.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                      boxShadow: `0 4px 12px ${kpi.glow}`
                    }}>
                      {kpi.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem', lineHeight: 1.2 }}>{kpi.label}</span>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '6px',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: isWeekly ? 'rgba(59,130,246,0.1)' : 'rgba(233,30,99,0.08)',
                          color: isWeekly ? '#60a5fa' : '#f472b6'
                        }}>{kpi.period}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        Target: {kpi.targetMax ? `${kpi.target}–${kpi.targetMax}` : kpi.target} {kpi.unit} / {isWeekly ? 'week' : 'day'}
                      </div>
                    </div>
                  </div>
                  {isAchievedToday && !isWeekly && (
                    <div style={{
                      background: isOverToday ? 'rgba(249,115,22,0.15)' : 'rgba(16,185,129,0.15)',
                      color: isOverToday ? '#f97316' : '#34d399',
                      border: `1px solid ${isOverToday ? 'rgba(249,115,22,0.3)' : 'rgba(16,185,129,0.3)'}`,
                      borderRadius: '20px', padding: '4px 10px',
                      fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      {isOverToday ? '🔥 Over' : '✓ Done'}
                    </div>
                  )}
                </div>

                {/* Progress bars (Daily & Weekly) */}
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Daily Target Progress */}
                  {!isWeekly && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Today's Target</span>
                        <span style={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: 600 }}>{dayValNum} / {kpi.targetMax ? `${kpi.target}–${kpi.targetMax}` : kpi.target}</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${progressPct}%`,
                          borderRadius: '999px',
                          background: kpi.gradient,
                          transition: 'width 0.4s ease-out',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Weekly Target Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B' }}>{isWeekly ? 'Weekly Target' : 'Weekly Cumulative'}</span>
                      <span style={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: 600 }}>
                        {weekSum} / {kpiTargetWeekly}
                      </span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${weeklyProgressPct}%`,
                        borderRadius: '999px',
                        background: isWeekly ? kpi.gradient : 'linear-gradient(90deg, #334155, #64748b)',
                        transition: 'width 0.4s ease-out',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      className="kpi-input"
                      type="number"
                      min="0"
                      value={dayVal}
                      onChange={e => setActuals(prev => ({ ...prev, [kpi.id]: e.target.value }))}
                      onBlur={e => saveActual(kpi.id, e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveActual(kpi.id, e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        color: 'white', fontSize: '1.1rem', fontWeight: 700,
                        padding: '10px 16px', outline: 'none',
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}
                      onFocus={e => e.target.style.borderColor = kpi.color}
                      onBlurCapture={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: saving[kpi.id] ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                    border: saving[kpi.id] ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}>
                    {saving[kpi.id] ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p style={{ marginTop: '32px', color: '#334155', fontSize: '0.75rem', textAlign: 'center' }}>
        Values auto-save on blur or Enter · Input updates the value for the selected day · Weekly scores calculate Mon–Sun sums
      </p>
    </AdminLayout>
  )
}
