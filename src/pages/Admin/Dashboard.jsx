import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalLeads: 0, 
    bookingLeads: 0, 
    contactLeads: 0, 
    newsletterSubs: 0,
    allLeads: [],
    activityLeads: []
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activity')
  const [dailyData, setDailyData] = useState({ dailyLeads: [], dailyCalls: [] })
  const [statusDistribution, setStatusDistribution] = useState([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Build last 7 days in local time
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
        const label = `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`
        return { label, dayStart: dayStart.toISOString(), dayEnd: dayEnd.toISOString() }
      }).reverse()

      // 1. Overall Stats & Recent History
      const [bookings, contacts, outreach, subs, history] = await Promise.all([
        supabase.from('booking_leads').select('*', { count: 'exact', head: true }),
        supabase.from('contact_leads').select('*', { count: 'exact', head: true }),
        supabase.from('outreach_leads').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter_subs').select('*', { count: 'exact', head: true }),
        supabase.from('lead_history').select('*').order('created_at', { ascending: false }).limit(20)
      ])

      // 2. Parallel Daily Counts
      const [dailyLeadResults, dailyCallResults] = await Promise.all([
        Promise.all(last7Days.map(({ dayStart, dayEnd }) => 
          supabase.from('outreach_leads').select('*', { count: 'exact', head: true }).gte('created_at', dayStart).lt('created_at', dayEnd)
        )),
        Promise.all(last7Days.map(({ dayStart, dayEnd }) => 
          supabase.from('lead_history').select('*', { count: 'exact', head: true }).eq('event_type', 'call').gte('created_at', dayStart).lt('created_at', dayEnd)
        ))
      ])

      const dailyLeads = last7Days.map((day, i) => ({ date: day.label, count: dailyLeadResults[i].count || 0 }))
      const dailyCalls = last7Days.map((day, i) => ({ date: day.label, count: dailyCallResults[i].count || 0 }))

      // 3. Fetch names for leads in recent activity
      const leadIds = [...new Set(history.data?.map(h => h.lead_id).filter(Boolean) || [])]
      let activityLeads = []
      if (leadIds.length > 0) {
        const [bLeads, oLeads] = await Promise.all([
          supabase.from('booking_leads').select('id, name').in('id', leadIds),
          supabase.from('outreach_leads').select('id, name, email').in('id', leadIds)
        ])
        activityLeads = [...(bLeads.data || []), ...(oLeads.data || []).map(l => ({ ...l, name: l.name || l.email }))]
      }

      const totalLeadsCount = (bookings.count || 0) + (contacts.count || 0) + (outreach.count || 0)

      setStats({
        bookingLeads: bookings.count || 0,
        contactLeads: contacts.count || 0,
        newsletterSubs: subs.count || 0,
        totalLeads: totalLeadsCount,
        allLeads: [],
        activityLeads: activityLeads
      })
      
      setRecentActivity(history.data || [])
      setDailyData({ dailyLeads, dailyCalls })
      
      // 4. Status distribution (Fetch ALL statuses in chunks of 1000 to bypass cap)
      let allStatuses = []
      let fromIdx = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data: statusChunk } = await supabase
          .from('outreach_leads')
          .select('status')
          .range(fromIdx, fromIdx + pageSize - 1)
        
        if (statusChunk && statusChunk.length > 0) {
          allStatuses = [...allStatuses, ...statusChunk]
          fromIdx += pageSize
          if (statusChunk.length < pageSize) hasMore = false
        } else {
          hasMore = false
        }
        if (fromIdx > 50000) hasMore = false 
      }

      const dist = allStatuses.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {})
      setStatusDistribution(Object.entries(dist).map(([name, value]) => ({ name, value })))

      setLoading(false)
    }
    fetchData()
  }, [])

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{ 
      background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', 
      borderRadius: '24px', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px'
    }}>
      <div style={{ 
        width: '64px', height: '64px', borderRadius: '16px', background: `${color}20`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 4px' }}>{title}</p>
        <h3 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{value}</h3>
      </div>
    </div>
  )

  const PieChart = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let cumulativePercent = 0
    
    function getCoordinatesForPercent(percent) {
      const x = Math.cos(2 * Math.PI * percent)
      const y = Math.sin(2 * Math.PI * percent)
      return [x, y]
    }

    const colors = ['#e91e63', '#3b82f6', '#10b981', '#f59e0b', '#9c27b0']

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          <svg viewBox="-1 -1 2 2" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {data.length === 0 ? <circle cx="0" cy="0" r="1" fill="rgba(255,255,255,0.05)" /> : data.map((slice, i) => {
              const [startX, startY] = getCoordinatesForPercent(cumulativePercent)
              cumulativePercent += slice.value / total
              const [endX, endY] = getCoordinatesForPercent(cumulativePercent)
              const largeArcFlag = slice.value / total > 0.5 ? 1 : 0
              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
              ].join(' ')
              return (
                <path 
                  key={i} d={pathData} fill={colors[i % colors.length]} 
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.6, transform: hoveredIndex === i ? 'scale(1.05)' : 'scale(1)' }}
                />
              )
            })}
            <circle cx="0" cy="0" r="0.65" fill="#0a0a0a" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            {hoveredIndex !== null ? (
              <>
                <p style={{ margin: 0, color: colors[hoveredIndex % colors.length], fontSize: '1.2rem', fontWeight: 800 }}>{data[hoveredIndex].value}</p>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{data[hoveredIndex].name}</p>
              </>
            ) : (
              <>
                <p style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>{total}</p>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Total</p>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {data.map((slice, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4, transition: 'all 0.2s' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: colors[i % colors.length] }} />
              <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{slice.name}: <strong>{slice.value}</strong></span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const BarChart = ({ data, color }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const maxCount = Math.max(...data.map(d => d.count), 0)
    const gridMax = maxCount <= 4 ? 6 : Math.max(maxCount + 2, 10)
    
    return (
      <div style={{ height: '220px', position: 'relative', padding: '30px 0 20px' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <div key={i} style={{ 
            position: 'absolute', bottom: `${p * 180 + 20}px`, left: 0, right: 0, 
            borderTop: '1px dashed rgba(255,255,255,0.05)', pointerEvents: 'none' 
          }} />
        ))}

        <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '12px', position: 'relative', zIndex: 1 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', position: 'relative' }}>
              <span style={{ 
                color: hoveredIndex === i ? 'white' : '#475569', fontSize: '0.7rem', fontWeight: 800, transition: 'all 0.2s' 
              }}>{d.count}</span>
              <div 
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ 
                  width: '100%', height: `${(d.count / gridMax) * 100}%`, background: color, borderRadius: '4px 4px 0 0', 
                  opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                  boxShadow: hoveredIndex === i ? `0 0 20px ${color}40` : 'none',
                  minHeight: d.count > 0 ? '2px' : '0'
                }} 
              />
              <span style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 600, marginTop: '4px' }}>{d.date}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      {loading ? (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="shimmer" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e91e63', margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>PREPARING DASHBOARD...</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Dashboard</h1>
              <p style={{ color: '#94A3B8', fontSize: '1.1rem', fontWeight: 500 }}>Real-time growth analytics and activity.</p>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {['activity', 'growth', 'analytics'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: activeTab === tab ? '#e91e63' : 'transparent',
                    color: activeTab === tab ? 'white' : '#94A3B8',
                    fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
            <StatCard title="Total Leads" value={stats.totalLeads} color="#e91e63" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} />
            <StatCard title="Booking Leads" value={stats.bookingLeads} color="#3b82f6" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>} />
            <StatCard title="Contact Leads" value={stats.contactLeads} color="#10b981" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>} />
            <StatCard title="Newsletters" value={stats.newsletterSubs} color="#f59e0b" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>} />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '40px' }}>
              {activeTab === 'activity' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {recentActivity.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#475569', padding: '40px' }}>No recent activity found.</p>
                  ) : recentActivity.map((item, i) => {
                    const lead = stats.activityLeads.find(l => l.id === item.lead_id)
                    return (
                      <div key={item.id} style={{ 
                        display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', 
                        background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ 
                          width: '44px', height: '44px', borderRadius: '12px', background: item.event_type === 'call' ? 'rgba(233, 30, 99, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {item.event_type === 'call' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px', color: 'white', fontWeight: 700 }}>{lead ? lead.name : 'Unknown Lead'}</p>
                          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>{item.content}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'growth' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h4 style={{ color: 'white', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 800 }}>Leads Added (7 Days)</h4>
                    <BarChart data={dailyData.dailyLeads} color="#e91e63" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h4 style={{ color: 'white', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 800 }}>Calls Logged (7 Days)</h4>
                    <BarChart data={dailyData.dailyCalls} color="#3b82f6" />
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <h4 style={{ color: 'white', marginBottom: '32px', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}>Lead Status Distribution</h4>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PieChart data={statusDistribution} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
