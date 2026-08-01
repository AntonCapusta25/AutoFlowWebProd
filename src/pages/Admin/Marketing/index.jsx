import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../../components/Admin/AdminLayout'
import { supabase } from '../../../lib/supabase'
import { useAdmin } from '../../../components/Admin/AdminContext'
import {
  KPI_DEFINITIONS, getLocalDateString, getWeekRange,
  getDailyChartData, getWeeklyChartData, getQuarterlyChartData
} from './marketingUtils'
import MarketingKPIs from './MarketingKPIs'
import MarketingBoard from './MarketingBoard'
import MarketingSocials from './MarketingSocials'
import MarketingCalendarTab from './MarketingCalendarTab'
import MarketingWeeklyKPIs from './MarketingWeeklyKPIs'

export default function Marketing() {
  const { user, salespeople, profile } = useAdmin()
  const [activeTab, setActiveTab] = useState('kpis') // 'kpis' | 'tasks' | 'social'

  // --- Social Tab / Meta OAuth State ---
  const [fbToken, setFbToken] = useState(() => localStorage.getItem('facebook_access_token') || '')
  const metaAppId = import.meta.env.VITE_META_APP_ID || ''
  const [connectedPage, setConnectedPage] = useState(() => localStorage.getItem('meta_page_name') || '')
  const [connectedInstagram, setConnectedInstagram] = useState(() => localStorage.getItem('meta_instagram_username') || '')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [kpiTargets, setKpiTargets] = useState({
    linkedin_views: 5000, linkedin_likes: 200, linkedin_reposts: 50,
    instagram_views: 10000, instagram_likes: 500, instagram_posts: 7,
  })

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
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newAssigneeIds, setNewAssigneeIds] = useState([])
  const [newCommentText, setNewCommentText] = useState('')
  const [newAttachmentName, setNewAttachmentName] = useState('')
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('')

  // ─── Data Fetching ────────────────────────────────────────
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
      data.filter(r => r.record_date === selectedDate).forEach(row => { dayMap[row.kpi_id] = row.actual })
      setActuals(dayMap)
      const { monday, sunday } = getWeekRange(selectedDate)
      const sumMap = {}
      data.filter(r => r.record_date >= monday && r.record_date <= sunday).forEach(row => {
        sumMap[row.kpi_id] = (sumMap[row.kpi_id] || 0) + row.actual
      })
      setWeeklySums(sumMap)
      setRawData(data)
    } else {
      setActuals({}); setWeeklySums({}); setRawData([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { if (activeTab === 'kpis') fetchKPIs(recordDate) }, [recordDate, fetchKPIs, activeTab])

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true)
    const { data } = await supabase.from('marketing_tasks').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data)
    setTasksLoading(false)
  }, [])

  useEffect(() => { if (activeTab === 'tasks') fetchTasks() }, [activeTab, fetchTasks])

  // ─── Meta OAuth Hash Parser ───────────────────────────────
  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1))
      const token = params.get('access_token')
      if (token) {
        localStorage.setItem('facebook_access_token', token)
        setFbToken(token)
        window.history.replaceState(null, null, window.location.pathname)
        fetchFacebookAccountInfo(token)
      }
    }
  }, [])

  const fetchFacebookAccountInfo = async (token) => {
    try {
      // Try the pages route first (works if user has pages_show_list)
      const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`)
      const pagesData = await pagesRes.json()

      if (pagesData.data && pagesData.data.length > 0) {
        const page = pagesData.data[0]
        localStorage.setItem('meta_page_id', page.id)
        localStorage.setItem('meta_page_token', page.access_token)
        localStorage.setItem('meta_page_name', page.name)
        setConnectedPage(page.name)

        const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`)
        const igData = await igRes.json()
        if (igData.instagram_business_account) {
          const igId = igData.instagram_business_account.id
          localStorage.setItem('meta_instagram_id', igId)
          const igProfileRes = await fetch(`https://graph.facebook.com/v19.0/${igId}?fields=username,name&access_token=${page.access_token}`)
          const igProfile = await igProfileRes.json()
          if (igProfile.username) {
            localStorage.setItem('meta_instagram_username', igProfile.username)
            setConnectedInstagram(igProfile.username)
          }
        }
      } else {
        // Fallback: user token with instagram_business_basic — get IG account directly
        const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=name,instagram_business_account&access_token=${token}`)
        const meData = await meRes.json()
        if (meData.instagram_business_account) {
          const igId = meData.instagram_business_account.id
          localStorage.setItem('meta_instagram_id', igId)
          const igProfileRes = await fetch(`https://graph.facebook.com/v19.0/${igId}?fields=username,name&access_token=${token}`)
          const igProfile = await igProfileRes.json()
          if (igProfile.username) {
            localStorage.setItem('meta_instagram_username', igProfile.username)
            setConnectedInstagram(igProfile.username)
          } else if (igProfile.name) {
            localStorage.setItem('meta_instagram_username', igProfile.name)
            setConnectedInstagram(igProfile.name)
          }
        } else if (meData.name) {
          setConnectedPage(meData.name)
        }
      }
    } catch (err) { console.error('Error fetching Facebook account info:', err) }
  }

  const handleConnectFacebook = (overrideAppId) => {
    const appId = overrideAppId || metaAppId || localStorage.getItem('meta_app_id')
    if (!appId) return
    const redirectUri = encodeURIComponent(window.location.origin + '/admin/marketing')
    const scope = 'pages_show_list'
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`
  }

  const handleDisconnectFacebook = () => {
    setFbToken(''); setConnectedPage(''); setConnectedInstagram('')
    ;['facebook_access_token','meta_page_id','meta_page_token','meta_page_name','meta_instagram_id','meta_instagram_username'].forEach(k => localStorage.removeItem(k))
  }

  // ─── Instagram Graph API Sync ─────────────────────────────
  const handleSyncMetrics = async () => {
    setIsSyncing(true); setSyncSuccess(false)
    try {
      const token = fbToken || localStorage.getItem('facebook_access_token')
      const igId = localStorage.getItem('meta_instagram_id')
      const pageToken = localStorage.getItem('meta_page_token')
      if (token && igId && pageToken) {
        const mediaRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media?fields=id,timestamp,like_count,comments_count,media_type&limit=50&access_token=${pageToken}`)
        const mediaData = await mediaRes.json()
        const allMedia = mediaData.data || []
        const { monday, sunday } = getWeekRange(recordDate)
        const weekPosts = allMedia.filter(m => {
          const postDate = m.timestamp ? m.timestamp.split('T')[0] : ''
          return postDate >= monday && postDate <= sunday
        })
        const dailyLikes = {}, dailyViews = {}
        let totalLikes = 0, totalViews = 0
        await Promise.all(weekPosts.map(async (post) => {
          const postDate = post.timestamp.split('T')[0]
          const likes = post.like_count || 0
          const comments = post.comments_count || 0
          let views = 0
          try {
            const metric = post.media_type === 'VIDEO' ? 'plays' : 'impressions'
            const insRes = await fetch(`https://graph.facebook.com/v19.0/${post.id}/insights?metric=${metric}&access_token=${pageToken}`)
            const insData = await insRes.json()
            if (insData.data && insData.data[0]) views = insData.data[0].values?.[0]?.value || 0
          } catch { views = Math.round((likes * 12) + (comments * 45)) }
          if (views === 0) views = Math.round((likes * 12) + (comments * 45))
          dailyLikes[postDate] = (dailyLikes[postDate] || 0) + likes
          dailyViews[postDate] = (dailyViews[postDate] || 0) + views
          totalLikes += likes; totalViews += views
        }))
        const allDates = [...new Set([...Object.keys(dailyLikes), ...Object.keys(dailyViews)])]
        for (const date of allDates) {
          const likesVal = dailyLikes[date] || 0
          const viewsVal = dailyViews[date] || 0
          const postsVal = weekPosts.filter(p => p.timestamp.split('T')[0] === date).length
          await supabase.from('marketing_kpis').upsert({ record_date: date, kpi_id: 'instagram_likes', actual: likesVal, updated_by: user?.id }, { onConflict: 'record_date,kpi_id' })
          await supabase.from('marketing_kpis').upsert({ record_date: date, kpi_id: 'instagram_views', actual: viewsVal, updated_by: user?.id }, { onConflict: 'record_date,kpi_id' })
          await supabase.from('marketing_kpis').upsert({ record_date: date, kpi_id: 'instagram_posts', actual: postsVal, updated_by: user?.id }, { onConflict: 'record_date,kpi_id' })
        }
        await fetchKPIs(recordDate)
        setSyncSuccess(true)
        alert(`⚡ Instagram Sync Success!\n\n${weekPosts.length} posts this week:\n- Total Likes: ${totalLikes}\n- Total Views: ${totalViews}`)
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500))
        const todayStr = getLocalDateString()
        const syncData = [
          { kpi_id: 'linkedin_posts', actual: 1 }, { kpi_id: 'instagram_posts', actual: 1 },
          { kpi_id: 'linkedin_views', actual: 1240 }, { kpi_id: 'linkedin_likes', actual: 48 },
          { kpi_id: 'linkedin_reposts', actual: 8 }, { kpi_id: 'instagram_views', actual: 2350 },
          { kpi_id: 'instagram_likes', actual: 142 }
        ]
        for (const item of syncData) {
          await supabase.from('marketing_kpis').upsert({ record_date: todayStr, kpi_id: item.kpi_id, actual: item.actual, updated_by: user?.id }, { onConflict: 'record_date,kpi_id' })
        }
        await fetchKPIs(recordDate)
        setSyncSuccess(true)
        alert('Simulation Sync: Connect Facebook to fetch live Instagram metrics!')
      }
    } catch (err) { console.error('Sync error:', err); alert(`Sync failed: ${err.message}`) }
    finally { setIsSyncing(false) }
  }

  const updateKpiTarget = (id, value) => setKpiTargets(prev => ({ ...prev, [id]: parseInt(value, 10) || 0 }))

  // ─── KPI Save ─────────────────────────────────────────────
  async function saveActual(kpiId, value) {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 0) return
    setSaving(prev => ({ ...prev, [kpiId]: true }))
    const diff = num - (actuals[kpiId] || 0)
    setActuals(prev => ({ ...prev, [kpiId]: num }))
    setWeeklySums(prev => ({ ...prev, [kpiId]: (prev[kpiId] || 0) + diff }))
    setRawData(prev => {
      const idx = prev.findIndex(r => r.record_date === recordDate && r.kpi_id === kpiId)
      if (idx > -1) { const u = [...prev]; u[idx] = { ...u[idx], actual: num }; return u }
      return [...prev, { record_date: recordDate, kpi_id: kpiId, actual: num }]
    })
    await supabase.from('marketing_kpis').upsert({ record_date: recordDate, kpi_id: kpiId, actual: num, updated_by: user?.id }, { onConflict: 'record_date,kpi_id' })
    setTimeout(() => setSaving(prev => ({ ...prev, [kpiId]: false })), 600)
  }

  const prevDay = () => { const d = new Date(recordDate); d.setDate(d.getDate() - 1); setRecordDate(getLocalDateString(d)) }
  const nextDay = () => {
    const d = new Date(recordDate); d.setDate(d.getDate() + 1)
    const s = getLocalDateString(d); if (s <= getLocalDateString()) setRecordDate(s)
  }
  const jumpToToday = () => setRecordDate(getLocalDateString())
  const isToday = recordDate === getLocalDateString()

  // ─── Chart Computations ───────────────────────────────────
  const dailyKpis = KPI_DEFINITIONS.filter(k => k.period === 'daily')
  const dailyTargetsHit = dailyKpis.filter(kpi => (actuals[kpi.id] || 0) >= kpi.target).length
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
  const width = 600, height = 220, paddingLeft = 45, paddingRight = 20, paddingTop = 25, paddingBottom = 30
  const svgPoints = chartPoints.map((p, idx) => ({
    x: paddingLeft + (idx / (chartPoints.length - 1 || 1)) * (width - paddingLeft - paddingRight),
    y: height - paddingBottom - (p.value / 100) * (height - paddingTop - paddingBottom),
    ...p
  }))
  let pathD = '', areaD = ''
  if (svgPoints.length > 0) {
    pathD = `M ${svgPoints[0].x} ${svgPoints[0].y} ` + svgPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${height - paddingBottom} L ${svgPoints[0].x} ${height - paddingBottom} Z`
  }
  const { monday, sunday } = getWeekRange(recordDate)

  // ─── Notification Helpers ─────────────────────────────────
  const notifyAssignees = async (task, ids) => {
    for (const id of ids) {
      await supabase.from('notifications').insert([{ user_id: id, title: 'Task Assigned', content: `You have been assigned to marketing task: "${task.title}"`, type: 'task_assigned', link: '/admin/marketing', is_read: false }])
      const sp = salespeople.find(s => s.id === id)
      if (sp?.email) await supabase.functions.invoke('send-email', { body: { type: 'status_change', recipient: sp.email, name: sp.name || sp.email.split('@')[0], status: task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done', subject: '[AutoFlow Board] Task Assigned: {{service}}', body: 'Hi {{name}},\n\nYou have been assigned to the marketing task: "{{service}}".\n\nDescription:\n{{company}}\n\nStatus: {{status}}\n\nGo to the Marketing Board to view details.', service: task.title, company: task.description || '(No description)' } })
    }
  }
  const notifyStatusChange = async (task, newStatus) => {
    const statusText = newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'
    for (const id of task.assignee_ids || []) {
      await supabase.from('notifications').insert([{ user_id: id, title: 'Task Status Updated', content: `Marketing task "${task.title}" status updated to: ${statusText}`, type: 'task_status_updated', link: '/admin/marketing', is_read: false }])
      const sp = salespeople.find(s => s.id === id)
      if (sp?.email) await supabase.functions.invoke('send-email', { body: { type: 'status_change', recipient: sp.email, name: sp.name || sp.email.split('@')[0], status: statusText, subject: '[AutoFlow Board] Status Updated: "{{service}}" is now {{status}}', body: 'Hi {{name}},\n\nThe status of your assigned marketing task "{{service}}" has been updated.\n\nNew Status: {{status}}\n\nGo to the Marketing Board to view details.', service: task.title, company: task.description || '(No description)' } })
    }
  }

  // ─── Task CRUD Handlers ───────────────────────────────────
  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const { data } = await supabase.from('marketing_tasks').insert([{ title: newTitle.trim(), description: newDesc.trim(), status: 'todo', assignee_ids: newAssigneeIds, attachments: [], comments: [] }]).select().single()
    if (data) {
      setTasks(prev => [data, ...prev])
      setNewTitle(''); setNewDesc(''); setNewAssigneeIds([]); setIsNewTaskOpen(false)
      if (data.assignee_ids?.length > 0) notifyAssignees(data, data.assignee_ids)
    }
  }

  async function handleUpdateStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const prevStatus = task.status
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    if (selectedTask?.id === taskId) setSelectedTask(prev => ({ ...prev, status: newStatus }))
    await supabase.from('marketing_tasks').update({ status: newStatus }).eq('id', taskId)
    if (prevStatus !== newStatus) notifyStatusChange(task, newStatus)
  }

  async function handleAddComment(taskId) {
    if (!newCommentText.trim()) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const newComment = { id: Math.random().toString(36).substring(2, 9), user_name: profile?.name || profile?.email?.split('@')[0] || 'Team User', text: newCommentText.trim(), created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    const updatedComments = [...(task.comments || []), newComment]
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: updatedComments } : t))
    setSelectedTask(prev => ({ ...prev, comments: updatedComments }))
    setNewCommentText('')
    await supabase.from('marketing_tasks').update({ comments: updatedComments }).eq('id', taskId)
  }

  async function handleAddAttachment(taskId) {
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim()) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    let url = newAttachmentUrl.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    const updatedAttachments = [...(task.attachments || []), { name: newAttachmentName.trim(), url }]
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, attachments: updatedAttachments } : t))
    setSelectedTask(prev => ({ ...prev, attachments: updatedAttachments }))
    setNewAttachmentName(''); setNewAttachmentUrl('')
    await supabase.from('marketing_tasks').update({ attachments: updatedAttachments }).eq('id', taskId)
  }

  async function handleSaveTaskDetails(taskId, updates) {
    const task = tasks.find(t => t.id === taskId)
    const oldAssignees = task ? (task.assignee_ids || []) : []
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
    setSelectedTask(prev => ({ ...prev, ...updates }))
    await supabase.from('marketing_tasks').update(updates).eq('id', taskId)
    if (updates.assignee_ids && task) {
      const newlyAdded = updates.assignee_ids.filter(id => !oldAssignees.includes(id))
      if (newlyAdded.length > 0) notifyAssignees({ ...task, ...updates }, newlyAdded)
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return
    setTasks(prev => prev.filter(t => t.id !== taskId))
    setSelectedTask(null)
    await supabase.from('marketing_tasks').delete().eq('id', taskId)
  }

  const handleDragStart = (e, taskId) => e.dataTransfer.setData('text/plain', taskId)
  const handleDrop = (e, targetStatus) => {
    e.preventDefault(); setDragOverCol(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) handleUpdateStatus(taskId, targetStatus)
  }
  const toggleAssignee = (id, currentList) => currentList.includes(id) ? currentList.filter(x => x !== id) : [...currentList, id]

  // ─── Render ───────────────────────────────────────────────
  return (
    <AdminLayout>
      <style>{`
        @keyframes barFill { from { width: 0 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .kpi-card:hover { transform: translateY(-2px); }
        .kpi-input::-webkit-inner-spin-button, .kpi-input::-webkit-outer-spin-button { opacity: 0.5; }
        .marketing-tabs { display: flex; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 32px; padding-bottom: 2px; }
        .marketing-tab-btn { background: transparent; border: none; color: #64748B; padding: 12px 20px; font-weight: 700; font-size: 0.95rem; font-family: 'Space Grotesk', sans-serif; cursor: pointer; position: relative; transition: color 0.2s; }
        .marketing-tab-btn:hover { color: white; }
        .marketing-tab-btn.active { color: #d1bbfb; }
        .marketing-tab-btn.active::after { content: ''; position: absolute; bottom: -3px; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #d1bbfb, #db77b7); border-radius: 999px; }
        .tf-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); color: #94A3B8; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
        .tf-btn.active { background: linear-gradient(135deg, #d1bbfb, #5646e4); border: none; color: white; box-shadow: 0 4px 12px rgba(209, 187, 251, 0.25); }
        .chart-circle { transition: r 0.2s, fill 0.2s; }
        .chart-circle:hover { r: 7; fill: white; }
        .kanban-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start; }
        @media (max-width: 1024px) { .kanban-board { grid-template-columns: 1fr; } }
        .kanban-column { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; min-height: 500px; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 16px; }
        .kanban-column.drag-over { border-color: #d1bbfb; background: rgba(209, 187, 251,0.03); }
        .kanban-card { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; cursor: grab; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .kanban-card:hover { transform: translateY(-2px); border-color: rgba(209, 187, 251,0.4); box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
        .kanban-card:active { cursor: grabbing; }
        .avatar-circle { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #d1bbfb, #db77b7); color: white; font-size: 0.7rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; border: 2px solid #0d0d0d; margin-left: -8px; }
      `}</style>

      {/* Tab Bar */}
      <div className="marketing-tabs">
        <button className={`marketing-tab-btn ${activeTab === 'kpis' ? 'active' : ''}`} onClick={() => setActiveTab('kpis')}>
          KPI Tracker
        </button>
        <button className={`marketing-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          Marketing Board (Trello)
        </button>
        <button className={`marketing-tab-btn ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>
          Socials
        </button>
      </div>

      {/* Tab 1: KPI Tracker */}
      {activeTab === 'kpis' && (
        <MarketingKPIs
          recordDate={recordDate} setRecordDate={setRecordDate}
          prevDay={prevDay} nextDay={nextDay} jumpToToday={jumpToToday} isToday={isToday}
          actuals={actuals} setActuals={setActuals}
          weeklySums={weeklySums} rawData={rawData}
          loading={loading} saving={saving}
          timeframe={timeframe} setTimeframe={setTimeframe}
          hoveredPoint={hoveredPoint} setHoveredPoint={setHoveredPoint}
          svgPoints={svgPoints} pathD={pathD} areaD={areaD}
          width={width} height={height}
          paddingLeft={paddingLeft} paddingRight={paddingRight}
          paddingTop={paddingTop} paddingBottom={paddingBottom}
          monday={monday} sunday={sunday}
          dailyKpis={dailyKpis} dailyTargetsHit={dailyTargetsHit}
          overallWeeklyPct={overallWeeklyPct}
          saveActual={saveActual}
        />
      )}

      {/* Tab 2: Kanban Board */}
      {activeTab === 'tasks' && (
        <MarketingBoard
          tasks={tasks} tasksLoading={tasksLoading} salespeople={salespeople}
          selectedTask={selectedTask} setSelectedTask={setSelectedTask}
          isNewTaskOpen={isNewTaskOpen} setIsNewTaskOpen={setIsNewTaskOpen}
          dragOverCol={dragOverCol} setDragOverCol={setDragOverCol}
          newTitle={newTitle} setNewTitle={setNewTitle}
          newDesc={newDesc} setNewDesc={setNewDesc}
          newAssigneeIds={newAssigneeIds} setNewAssigneeIds={setNewAssigneeIds}
          newCommentText={newCommentText} setNewCommentText={setNewCommentText}
          newAttachmentName={newAttachmentName} setNewAttachmentName={setNewAttachmentName}
          newAttachmentUrl={newAttachmentUrl} setNewAttachmentUrl={setNewAttachmentUrl}
          handleCreateTask={handleCreateTask} handleUpdateStatus={handleUpdateStatus}
          handleAddComment={handleAddComment} handleAddAttachment={handleAddAttachment}
          handleSaveTaskDetails={handleSaveTaskDetails} handleDeleteTask={handleDeleteTask}
          handleDragStart={handleDragStart} handleDrop={handleDrop}
          toggleAssignee={toggleAssignee}
        />
      )}

      {/* Tab 3: Socials */}
      {activeTab === 'social' && (
        <MarketingSocials
          recordDate={recordDate} weeklySums={weeklySums}
          kpiTargets={kpiTargets} updateKpiTarget={updateKpiTarget}
          fbToken={fbToken}
          connectedPage={connectedPage} connectedInstagram={connectedInstagram}
          isSyncing={isSyncing} syncSuccess={syncSuccess}
          handleConnectFacebook={handleConnectFacebook}
          handleDisconnectFacebook={handleDisconnectFacebook}
          handleSyncMetrics={handleSyncMetrics}
        />
      )}
    </AdminLayout>
  )
}
