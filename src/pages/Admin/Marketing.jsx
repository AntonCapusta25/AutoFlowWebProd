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

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getWeekRange(dateStr) {
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

function getDailyChartData(endDateStr, raw) {
  const points = []
  for (let i = 9; i >= 0; i--) {
    const d = new Date(endDateStr)
    d.setDate(d.getDate() - i)
    const dateStr = getLocalDateString(d)
    
    const dayRows = raw.filter(r => r.record_date === dateStr)
    const hits = KPI_DEFINITIONS.filter(kpi => kpi.period === 'daily').filter(kpi => {
      const row = dayRows.find(r => r.kpi_id === kpi.id)
      const actual = row ? row.actual : 0
      return actual >= kpi.target
    }).length
    
    const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    const pct = Math.round((hits / 6) * 100)
    
    points.push({ label, value: pct, tooltip: `${label}: ${pct}% completion (${hits}/6 targets hit)` })
  }
  return points
}

function getWeeklyChartData(endDateStr, raw) {
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

function getQuarterlyChartData(endDateStr, raw) {
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

export default function Marketing() {
  const { user, salespeople, profile } = useAdmin()
  const [activeTab, setActiveTab] = useState('kpis') // 'kpis' | 'tasks'

  // --- KPI Tracker State ---
  const [recordDate, setRecordDate] = useState(getLocalDateString())
  const [actuals, setActuals] = useState({})
  const [weeklySums, setWeeklySums] = useState({})
  const [rawData, setRawData] = useState([])
  const [saving, setSaving] = useState({})
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('daily')
  const [hoveredPoint, setHoveredPoint] = useState(null)

  // --- Trello Board State ---
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [dragOverCol, setDragOverCol] = useState(null)

  // New task form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newAssigneeIds, setNewAssigneeIds] = useState([])

  // Modal input states
  const [newCommentText, setNewCommentText] = useState('')
  const [newAttachmentName, setNewAttachmentName] = useState('')
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('')

  // Fetch KPI data
  const fetchKPIs = useCallback(async (selectedDate) => {
    setLoading(true)
    const start = new Date(selectedDate)
    start.setDate(start.getDate() - 365)
    const startDateStr = getLocalDateString(start)

    const { data } = await supabase
      .from('marketing_kpis')
      .select('*')
      .gte('record_date', startDateStr)
      .lte('record_date', selectedDate)

    if (data) {
      const dayMap = {}
      data.filter(r => r.record_date === selectedDate).forEach(row => {
        dayMap[row.kpi_id] = row.actual
      })
      setActuals(dayMap)

      const { monday, sunday } = getWeekRange(selectedDate)
      const sumMap = {}
      data.filter(r => r.record_date >= monday && r.record_date <= sunday).forEach(row => {
        sumMap[row.kpi_id] = (sumMap[row.kpi_id] || 0) + row.actual
      })
      setWeeklySums(sumMap)
      setRawData(data)
    } else {
      setActuals({})
      setWeeklySums({})
      setRawData([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'kpis') {
      fetchKPIs(recordDate)
    }
  }, [recordDate, fetchKPIs, activeTab])

  // --- Trello persist callbacks ---
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true)
    const { data } = await supabase
      .from('marketing_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setTasks(data)
    }
    setTasksLoading(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks()
    }
  }, [activeTab, fetchTasks])

  async function saveActual(kpiId, value) {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 0) return

    setSaving(prev => ({ ...prev, [kpiId]: true }))
    const prevDayVal = actuals[kpiId] || 0
    const diff = num - prevDayVal

    setActuals(prev => ({ ...prev, [kpiId]: num }))
    setWeeklySums(prev => ({ ...prev, [kpiId]: (prev[kpiId] || 0) + diff }))
    setRawData(prev => {
      const idx = prev.findIndex(r => r.record_date === recordDate && r.kpi_id === kpiId)
      if (idx > -1) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], actual: num }
        return updated
      } else {
        return [...prev, { record_date: recordDate, kpi_id: kpiId, actual: num }]
      }
    })

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
  const dailyKpis = KPI_DEFINITIONS.filter(k => k.period === 'daily')
  const dailyTargetsHit = dailyKpis.filter(kpi => {
    const actual = actuals[kpi.id] || 0
    return actual >= kpi.target
  }).length

  const totalWeeklyScore = KPI_DEFINITIONS.reduce((acc, kpi) => {
    const sum = weeklySums[kpi.id] || 0
    const weeklyTarget = kpi.period === 'weekly' ? kpi.target : kpi.target * 7
    return acc + Math.min(sum / weeklyTarget, 1)
  }, 0)
  const overallWeeklyPct = Math.round((totalWeeklyScore / KPI_DEFINITIONS.length) * 100)

  const chartPoints = timeframe === 'daily'
    ? getDailyChartData(recordDate, rawData)
    : timeframe === 'weekly'
      ? getWeeklyChartData(recordDate, rawData)
      : getQuarterlyChartData(recordDate, rawData)

  const width = 600
  const height = 220
  const paddingLeft = 45
  const paddingRight = 20
  const paddingTop = 25
  const paddingBottom = 30

  const svgPoints = chartPoints.map((p, idx) => {
    const x = paddingLeft + (idx / (chartPoints.length - 1 || 1)) * (width - paddingLeft - paddingRight)
    const y = height - paddingBottom - (p.value / 100) * (height - paddingTop - paddingBottom)
    return { x, y, ...p }
  })

  let pathD = ''
  let areaD = ''
  if (svgPoints.length > 0) {
    pathD = `M ${svgPoints[0].x} ${svgPoints[0].y} ` + svgPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${height - paddingBottom} L ${svgPoints[0].x} ${height - paddingBottom} Z`
  }

  const { monday, sunday } = getWeekRange(recordDate)

  // --- Kanban Board Notifications Helper ---
  const notifyAssignees = async (task, newAssigneeIdsList) => {
    for (const assigneeId of newAssigneeIdsList) {
      const sp = salespeople.find(s => s.id === assigneeId)
      if (sp && sp.email) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'status_change',
            recipient: sp.email,
            name: sp.name || sp.email.split('@')[0],
            status: task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done',
            subject: '[AutoFlow Board] Task Assigned: {{service}}',
            body: 'Hi {{name}},\n\nYou have been assigned to the marketing task: "{{service}}".\n\nDescription:\n{{company}}\n\nStatus: {{status}}\n\nGo to the Marketing Board to view details.',
            service: task.title,
            company: task.description || '(No description)'
          }
        })
      }
    }
  }

  const notifyStatusChange = async (task, newStatus) => {
    const statusText = newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'
    const currentAssigneeIds = task.assignee_ids || []
    for (const assigneeId of currentAssigneeIds) {
      const sp = salespeople.find(s => s.id === assigneeId)
      if (sp && sp.email) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'status_change',
            recipient: sp.email,
            name: sp.name || sp.email.split('@')[0],
            status: statusText,
            subject: '[AutoFlow Board] Status Updated: "{{service}}" is now {{status}}',
            body: 'Hi {{name}},\n\nThe status of your assigned marketing task "{{service}}" has been updated.\n\nNew Status: {{status}}\n\nGo to the Marketing Board to view details.',
            service: task.title,
            company: task.description || '(No description)'
          }
        })
      }
    }
  }

  // --- Kanban Board Actions ---
  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTitle.trim()) return

    const { data } = await supabase
      .from('marketing_tasks')
      .insert([{
        title: newTitle.trim(),
        description: newDesc.trim(),
        status: 'todo',
        assignee_ids: newAssigneeIds,
        attachments: [],
        comments: []
      }])
      .select()
      .single()

    if (data) {
      setTasks(prev => [data, ...prev])
      setNewTitle('')
      setNewDesc('')
      setNewAssigneeIds([])
      setIsNewTaskOpen(false)

      if (data.assignee_ids && data.assignee_ids.length > 0) {
        notifyAssignees(data, data.assignee_ids)
      }
    }
  }

  async function handleUpdateStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const prevStatus = task.status

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => ({ ...prev, status: newStatus }))
    }
    await supabase
      .from('marketing_tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (prevStatus !== newStatus) {
      notifyStatusChange(task, newStatus)
    }
  }

  async function handleAddComment(taskId) {
    if (!newCommentText.trim()) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      user_name: profile?.name || profile?.email?.split('@')[0] || 'Team User',
      text: newCommentText.trim(),
      created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const updatedComments = [...(task.comments || []), newComment]
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: updatedComments } : t))
    setSelectedTask(prev => ({ ...prev, comments: updatedComments }))
    setNewCommentText('')

    await supabase
      .from('marketing_tasks')
      .update({ comments: updatedComments })
      .eq('id', taskId)
  }

  async function handleAddAttachment(taskId) {
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim()) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    let url = newAttachmentUrl.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    const newAttachment = {
      name: newAttachmentName.trim(),
      url: url
    }

    const updatedAttachments = [...(task.attachments || []), newAttachment]
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, attachments: updatedAttachments } : t))
    setSelectedTask(prev => ({ ...prev, attachments: updatedAttachments }))
    setNewAttachmentName('')
    setNewAttachmentUrl('')

    await supabase
      .from('marketing_tasks')
      .update({ attachments: updatedAttachments })
      .eq('id', taskId)
  }

  async function handleSaveTaskDetails(taskId, updates) {
    const task = tasks.find(t => t.id === taskId)
    const oldAssignees = task ? (task.assignee_ids || []) : []

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
    setSelectedTask(prev => ({ ...prev, ...updates }))
    await supabase
      .from('marketing_tasks')
      .update(updates)
      .eq('id', taskId)

    if (updates.assignee_ids && task) {
      const newlyAdded = updates.assignee_ids.filter(id => !oldAssignees.includes(id))
      if (newlyAdded.length > 0) {
        notifyAssignees({ ...task, ...updates }, newlyAdded)
      }
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return
    setTasks(prev => prev.filter(t => t.id !== taskId))
    setSelectedTask(null)
    await supabase
      .from('marketing_tasks')
      .delete()
      .eq('id', taskId)
  }

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      handleUpdateStatus(taskId, targetStatus)
    }
  }

  const toggleAssignee = (id, currentList) => {
    if (currentList.includes(id)) {
      return currentList.filter(x => x !== id)
    } else {
      return [...currentList, id]
    }
  }

  return (
    <AdminLayout>
      <style>{`
        @keyframes barFill { from { width: 0 } }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .kpi-card:hover { transform: translateY(-2px); }
        .kpi-input::-webkit-inner-spin-button, .kpi-input::-webkit-outer-spin-button { opacity: 0.5; }
        
        /* Tab Selectors */
        .marketing-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 32px;
          padding-bottom: 2px;
        }
        .marketing-tab-btn {
          background: transparent;
          border: none;
          color: #64748B;
          padding: 12px 20px;
          font-weight: 700;
          font-size: 0.95rem;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }
        .marketing-tab-btn:hover {
          color: white;
        }
        .marketing-tab-btn.active {
          color: #7949da;
        }
        .marketing-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #7949da, #db77b7);
          border-radius: 999px;
        }

        .tf-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: #94A3B8;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tf-btn.active {
          background: linear-gradient(135deg, #7949da, #5646e4);
          border: none;
          color: white;
          box-shadow: 0 4px 12px rgba(121, 73, 218, 0.25);
        }
        .chart-circle { transition: r 0.2s, fill 0.2s; }
        .chart-circle:hover { r: 7; fill: white; }

        /* Kanban Column / Cards */
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .kanban-board { grid-template-columns: 1fr; }
        }
        .kanban-column {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 20px;
          min-height: 500px;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .kanban-column.drag-over {
          border-color: #7949da;
          background: rgba(121,73,218,0.03);
        }
        .kanban-card {
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 16px;
          cursor: grab;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kanban-card:hover {
          transform: translateY(-2px);
          border-color: rgba(121,73,218,0.4);
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }
        .kanban-card:active {
          cursor: grabbing;
        }
        .avatar-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7949da, #db77b7);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0d0d0d;
          margin-left: -8px;
        }
      `}</style>

      {/* Primary Top Tab Row */}
      <div className="marketing-tabs">
        <button 
          className={`marketing-tab-btn ${activeTab === 'kpis' ? 'active' : ''}`}
          onClick={() => setActiveTab('kpis')}
        >
          KPI Tracker
        </button>
        <button 
          className={`marketing-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Marketing Board (Trello)
        </button>
      </div>

      {activeTab === 'kpis' ? (
        // ==========================================
        // 📈 TAB 1: KPI TRACKER (EXISTING VIEW)
        // ==========================================
        <>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>
                  Marketing KPIs
                </h1>
                <p style={{ color: '#64748B', margin: 0 }}>Daily KPI tracking with weekly aggregated targets</p>
              </div>

              {/* Date Selector & Calendar Picker */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={prevDay}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', color: '#94A3B8', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="date"
                      value={recordDate}
                      max={getLocalDateString()}
                      onChange={e => e.target.value && setRecordDate(e.target.value)}
                      style={{
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        color: 'white',
                        padding: '10px 16px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: "'Space Grotesk', sans-serif",
                        textAlign: 'center'
                      }}
                    />
                  </div>

                  <button
                    onClick={nextDay}
                    disabled={isToday}
                    style={{
                      background: isToday ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', color: isToday ? '#334155' : '#94A3B8', cursor: isToday ? 'default' : 'pointer', padding: '10px', display: 'flex', alignItems: 'center'
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
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
                <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#475569' }}>Number of daily targets hit on the selected date</p>
              </div>

              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Weekly Aggregate Score</span>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', color: overallWeeklyPct >= 80 ? '#10b981' : overallWeeklyPct >= 50 ? '#f59e0b' : '#7949da' }}>
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
                        : 'linear-gradient(90deg, #7949da, #7949da)',
                    transition: 'width 0.4s ease-out',
                  }} />
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#475569' }}>Completion percentage over the entire week (Mon-Sun)</p>
              </div>
            </div>
          </div>

          {/* KPI Completion Trend Graph */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>KPI Performance Trend</h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.75rem' }}>Average target achievement percentage over time</p>
              </div>
              
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button className={`tf-btn ${timeframe === 'daily' ? 'active' : ''}`} onClick={() => setTimeframe('daily')}>Daily</button>
                <button className={`tf-btn ${timeframe === 'weekly' ? 'active' : ''}`} onClick={() => setTimeframe('weekly')}>Weekly</button>
                <button className={`tf-btn ${timeframe === 'quarterly' ? 'active' : ''}`} onClick={() => setTimeframe('quarterly')}>Quarterly</button>
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
              {loading ? (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>Loading trend...</div>
              ) : (
                <div style={{ minWidth: '600px', position: 'relative' }}>
                  {hoveredPoint && (
                    <div style={{
                      position: 'absolute',
                      left: `${(hoveredPoint.x / width) * 100}%`,
                      top: `${hoveredPoint.y - 45}px`,
                      transform: 'translateX(-50%)',
                      background: 'rgba(10, 10, 10, 0.95)',
                      border: '1px solid rgba(121, 73, 218, 0.4)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      pointerEvents: 'none',
                      zIndex: 10,
                      whiteSpace: 'nowrap'
                    }}>
                      {hoveredPoint.tooltip}
                    </div>
                  )}

                  <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220px" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7949da" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#5646e4" stopOpacity="0.0"/>
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7949da"/>
                        <stop offset="100%" stopColor="#5646e4"/>
                      </linearGradient>
                    </defs>

                    {[0, 25, 50, 75, 100].map(val => {
                      const yVal = height - paddingBottom - (val / 100) * (height - paddingTop - paddingBottom)
                      return (
                        <g key={val}>
                          <line
                            x1={paddingLeft}
                            y1={yVal}
                            x2={width - paddingRight}
                            y2={yVal}
                            stroke="rgba(255,255,255,0.06)"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={paddingLeft - 10}
                            y={yVal + 4}
                            fill="#475569"
                            fontSize="10"
                            fontWeight="700"
                            textAnchor="end"
                          >
                            {val}%
                          </text>
                        </g>
                      )
                    })}

                    {svgPoints.map((p, idx) => (
                      <g key={idx}>
                        <line
                          x1={p.x}
                          y1={height - paddingBottom}
                          x2={p.x}
                          y2={height - paddingBottom + 5}
                          stroke="rgba(255,255,255,0.15)"
                        />
                        <text
                          x={p.x}
                          y={height - paddingBottom + 18}
                          fill="#64748B"
                          fontSize="9.5"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {p.label}
                        </text>
                      </g>
                    ))}

                    {areaD && <path d={areaD} fill="url(#chartGradient)" />}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {svgPoints.map((p, idx) => (
                      <circle
                        key={idx}
                        className="chart-circle"
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill={hoveredPoint && hoveredPoint.label === p.label ? 'white' : '#7949da'}
                        stroke="#0a0a0a"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </svg>
                </div>
              )}
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

                const isWeekly = kpi.period === 'weekly'
                const target = kpi.targetMax || kpi.target
                const kpiTargetWeekly = isWeekly ? target : target * 7

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
                      border: `1px solid ${isAchievedToday && !isWeekly ? `rgba(121,73,218,0.25)` : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: isAchievedToday && !isWeekly ? `0 0 30px rgba(121,73,218,0.15)` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
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
                              background: isWeekly ? 'rgba(59,130,246,0.1)' : 'rgba(121, 73, 218,0.08)',
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

                    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        </>
      ) : (
        // ==========================================
        // 📋 TAB 2: TRELLO BOARD (KANBAN BOARD)
        // ==========================================
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'white' }}>
                Marketing Task Board
              </h2>
              <p style={{ color: '#64748B', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Collaborate on tasks, attach documents, and assign salespeople</p>
            </div>
            <button
              onClick={() => setIsNewTaskOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #7949da, #db77b7)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(121, 73, 218, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Task
            </button>
          </div>

          {tasksLoading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>Loading Trello board...</div>
          ) : (
            <div className="kanban-board">
              
              {/* --- 1. TO DO COLUMN --- */}
              <div 
                className={`kanban-column ${dragOverCol === 'todo' ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol('todo'); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, 'todo')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4a7d' }}></span>
                    To Do
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                    {tasks.filter(t => t.status === 'todo').length}
                  </span>
                </div>

                {tasks.filter(t => t.status === 'todo').map(task => renderTaskCard(task))}
              </div>

              {/* --- 2. IN PROGRESS COLUMN --- */}
              <div 
                className={`kanban-column ${dragOverCol === 'in_progress' ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol('in_progress'); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, 'in_progress')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
                    In Progress
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </span>
                </div>

                {tasks.filter(t => t.status === 'in_progress').map(task => renderTaskCard(task))}
              </div>

              {/* --- 3. DONE COLUMN --- */}
              <div 
                className={`kanban-column ${dragOverCol === 'done' ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol('done'); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, 'done')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                    Done
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                    {tasks.filter(t => t.status === 'done').length}
                  </span>
                </div>

                {tasks.filter(t => t.status === 'done').map(task => renderTaskCard(task))}
              </div>

            </div>
          )}
        </>
      )}

      {/* ==========================================
          MODAL: CREATE TASK
      ========================================== */}
      {isNewTaskOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <form 
            onSubmit={handleCreateTask}
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}
          >
            <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '1.3rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Create Marketing Task</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Design new landing page graphics"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Description</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Details about the task..."
                style={{ width: '100%', height: '100px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Assign Team Members (Select Multiple)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                {salespeople.map(sp => {
                  const isSelected = newAssigneeIds.includes(sp.id)
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setNewAssigneeIds(toggleAssignee(sp.id, newAssigneeIds))}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isSelected ? 'rgba(121,73,218,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? '#7949da' : 'rgba(255,255,255,0.08)'}`,
                        color: isSelected ? 'white' : '#94a3b8'
                      }}
                    >
                      {sp.name || sp.email.split('@')[0]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsNewTaskOpen(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#7949da,#db77b7)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          MODAL: TASK DETAILS (TRELLO DETAIL VIEW)
      ========================================== */}
      {selectedTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{
            background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
            width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', overflow: 'hidden'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: selectedTask.status === 'todo' ? 'rgba(255,74,125,0.15)' : selectedTask.status === 'in_progress' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                  color: selectedTask.status === 'todo' ? '#ff4a7d' : selectedTask.status === 'in_progress' ? '#3b82f6' : '#10b981'
                }}>
                  {selectedTask.status.replace('_', ' ')}
                </span>
                <h3 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedTask.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Content Drawer grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px', padding: '32px', overflowY: 'auto', flex: 1 }}>
              
              {/* Left Column: Details, Attachments, Comments */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Description */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>Description</h4>
                  <textarea
                    value={selectedTask.description || ''}
                    onChange={e => handleSaveTaskDetails(selectedTask.id, { description: e.target.value })}
                    placeholder="Add details for this task..."
                    style={{ width: '100%', height: '100px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#94a3b8', outline: 'none', resize: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Attachments Section */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    Attachments (Docs & Links)
                  </h4>
                  
                  {/* File List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {(selectedTask.attachments || []).length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>No files or links attached yet.</span>
                    ) : (
                      (selectedTask.attachments || []).map((att, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <a href={att.url} target="_blank" rel="noreferrer" style={{ color: '#c084fc', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            {att.name}
                          </a>
                          <button
                            onClick={() => {
                              const updated = selectedTask.attachments.filter((_, i) => i !== idx)
                              handleSaveTaskDetails(selectedTask.id, { attachments: updated })
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add File Input fields */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Doc name (e.g. Brief)"
                      value={newAttachmentName}
                      onChange={e => setNewAttachmentName(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Link/URL"
                      value={newAttachmentUrl}
                      onChange={e => setNewAttachmentUrl(e.target.value)}
                      style={{ flex: 1.5, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }}
                    />
                    <button
                      onClick={() => handleAddAttachment(selectedTask.id)}
                      style={{ padding: '8px 16px', background: 'rgba(121,73,218,0.2)', border: '1px solid #7949da', color: '#c084fc', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Attach
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Comments / Activity
                  </h4>
                  
                  {/* Comments list wrapper */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto', paddingRight: '6px', marginBottom: '14px' }}>
                    {(selectedTask.comments || []).length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>No comments left yet.</span>
                    ) : (
                      (selectedTask.comments || []).map(comment => (
                        <div key={comment.id} style={{ background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.75rem' }}>{comment.user_name}</span>
                            <span style={{ color: '#475569', fontSize: '0.65rem' }}>{comment.created_at}</span>
                          </div>
                          <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.8rem', lineHeight: '1.4' }}>{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedTask.id)}
                      style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button
                      onClick={() => handleAddComment(selectedTask.id)}
                      style={{ padding: '10px 16px', background: '#7949da', border: 'none', color: 'white', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Post
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Meta (Assignees, Status Dropdown, Delete) */}
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Status selection */}
                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Task Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={e => handleUpdateStatus(selectedTask.id, e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                {/* Team Assignment (Multi-Select toggle list) */}
                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Assigned People</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {salespeople.map(sp => {
                      const isAssigned = (selectedTask.assignee_ids || []).includes(sp.id)
                      return (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => {
                            const updated = toggleAssignee(sp.id, selectedTask.assignee_ids || [])
                            handleSaveTaskDetails(selectedTask.id, { assignee_ids: updated })
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            background: isAssigned ? 'rgba(121,73,218,0.12)' : 'transparent',
                            border: `1px solid ${isAssigned ? '#7949da' : 'rgba(255,255,255,0.05)'}`,
                            color: isAssigned ? 'white' : '#64748b',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{sp.name || sp.email.split('@')[0]}</span>
                          {isAssigned && <span style={{ color: '#c084fc', fontSize: '0.8rem' }}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Danger actions */}
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <button
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#f87171', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  >
                    Delete Task
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  )

  // --- RENDERING HELPER: KANBAN CARD ---
  function renderTaskCard(task) {
    const cardAssignees = salespeople.filter(sp => (task.assignee_ids || []).includes(sp.id))
    
    return (
      <div
        key={task.id}
        className="kanban-card"
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        onClick={() => setSelectedTask(task)}
      >
        <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4 }}>
          {task.title}
        </h4>
        
        {task.description && (
          <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.78rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {task.description}
          </p>
        )}

        {/* Card footer details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Icons: Attachments & Comments counters */}
          <div style={{ display: 'flex', gap: '10px', color: '#475569' }}>
            {(task.attachments || []).length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                {(task.attachments || []).length}
              </span>
            )}
            {(task.comments || []).length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                {(task.comments || []).length}
              </span>
            )}
          </div>

          {/* Assignee circles (overlapping circles list) */}
          <div style={{ display: 'flex', paddingLeft: '8px' }}>
            {cardAssignees.slice(0, 3).map((sp, idx) => {
              const namePart = sp.name || sp.email.split('@')[0]
              const initials = namePart.substring(0, 2).toUpperCase()
              return (
                <div key={sp.id} className="avatar-circle" title={namePart}>
                  {initials}
                </div>
              )
            })}
            {cardAssignees.length > 3 && (
              <div className="avatar-circle" style={{ background: '#334155' }}>
                +{cardAssignees.length - 3}
              </div>
            )}
          </div>

        </div>
      </div>
    )
  }
}
