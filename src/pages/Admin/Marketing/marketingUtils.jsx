// ============================================================
// KPI Definitions & Pure Helper Functions
// Shared between MarketingKPIs, MarketingBoard, MarketingSocials
// ============================================================

export const KPI_DEFINITIONS = [
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

export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getWeekRange(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
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

export function getDailyChartData(endDateStr, raw) {
  const points = []
  for (let i = 9; i >= 0; i--) {
    const d = new Date(endDateStr)
    d.setDate(d.getDate() - i)
    const dateStr = getLocalDateString(d)
    const dayRows = raw.filter(r => r.record_date === dateStr)
    const hits = KPI_DEFINITIONS.filter(kpi => kpi.period === 'daily').filter(kpi => {
      const row = dayRows.find(r => r.kpi_id === kpi.id)
      return (row ? row.actual : 0) >= kpi.target
    }).length
    const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    const pct = Math.round((hits / 6) * 100)
    points.push({ label, value: pct, tooltip: `${label}: ${pct}% completion (${hits}/6 targets hit)` })
  }
  return points
}

export function getWeeklyChartData(endDateStr, raw) {
  const points = []
  const currentMonday = new Date(getWeekRange(endDateStr).monday)
  for (let i = 7; i >= 0; i--) {
    const monday = new Date(currentMonday)
    monday.setDate(monday.getDate() - i * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const mondayStr = getLocalDateString(monday)
    const sundayStr = getLocalDateString(sunday)
    const weekRows = raw.filter(r => r.record_date >= mondayStr && r.record_date <= sundayStr)
    const scores = KPI_DEFINITIONS.map(kpi => {
      const sum = weekRows.filter(r => r.kpi_id === kpi.id).reduce((acc, r) => acc + r.actual, 0)
      const target = kpi.period === 'weekly' ? kpi.target : kpi.target * 7
      return Math.min(sum / target, 1)
    })
    const sumScore = scores.reduce((acc, s) => acc + s, 0)
    const pct = Math.round((sumScore / KPI_DEFINITIONS.length) * 100)
    const label = monday.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    points.push({ label, value: pct, tooltip: `Week of ${label}: ${pct}% completion` })
  }
  return points
}

export function getQuarterlyChartData(endDateStr, raw) {
  const points = []
  const endD = new Date(endDateStr)
  for (let i = 3; i >= 0; i--) {
    const d = new Date(endD)
    d.setMonth(d.getMonth() - i * 3)
    const quarter = Math.floor(d.getMonth() / 3) + 1
    const year = d.getFullYear()
    let startM, endM, endDNum
    if (quarter === 1) { startM = 0; endM = 2; endDNum = 31 }
    else if (quarter === 2) { startM = 3; endM = 5; endDNum = 30 }
    else if (quarter === 3) { startM = 6; endM = 8; endDNum = 30 }
    else { startM = 9; endM = 11; endDNum = 31 }
    const qStart = new Date(year, startM, 1)
    const qEnd = new Date(year, endM, endDNum)
    const qStartStr = getLocalDateString(qStart)
    const qEndStr = getLocalDateString(qEnd)
    const qRows = raw.filter(r => r.record_date >= qStartStr && r.record_date <= qEndStr)
    const daysInQ = Math.round((qEnd - qStart) / (1000 * 60 * 60 * 24)) + 1
    const weeksInQ = daysInQ / 7
    const scores = KPI_DEFINITIONS.map(kpi => {
      const sum = qRows.filter(r => r.kpi_id === kpi.id).reduce((acc, r) => acc + r.actual, 0)
      const target = kpi.period === 'weekly' ? kpi.target * weeksInQ : kpi.target * daysInQ
      return Math.min(sum / target, 1)
    })
    const sumScore = scores.reduce((acc, s) => acc + s, 0)
    const pct = Math.round((sumScore / KPI_DEFINITIONS.length) * 100)
    const label = `Q${quarter} ${year}`
    points.push({ label, value: pct, tooltip: `${label}: ${pct}% completion` })
  }
  return points
}
