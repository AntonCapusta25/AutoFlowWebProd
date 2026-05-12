import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalLeads: 0, bookingLeads: 0, contactLeads: 0, newsletterSubs: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activity')
  const [dailyData, setDailyData] = useState([])
  const [statusDistribution, setStatusDistribution] = useState([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [bookings, contacts, subs, history] = await Promise.all([
        supabase.from('booking_leads').select('*'),
        supabase.from('contact_leads').select('*'),
        supabase.from('newsletter_subs').select('*', { count: 'exact', head: true }),
        supabase.from('lead_history').select('*').order('created_at', { ascending: false })
      ])

      setStats({
        bookingLeads: bookings.data?.length || 0,
        contactLeads: contacts.data?.length || 0,
        newsletterSubs: subs.count || 0,
        totalLeads: (bookings.data?.length || 0) + (contacts.data?.length || 0)
      })
      setRecentActivity((history.data || []).slice(0, 10))

      // Process Status Distribution
      const allLeads = [...(bookings.data || []), ...(contacts.data || [])]
      const dist = allLeads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {})
      setStatusDistribution(Object.entries(dist).map(([name, value]) => ({ name, value })))

      // Process 7-day Activity
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toISOString().split('T')[0]
      }).reverse()

      const dailyLeads = last7Days.map(date => ({
        date: date.split('-').slice(1).join('/'),
        count: allLeads.filter(l => l.created_at.startsWith(date)).length
      }))

      const dailyCalls = last7Days.map(date => ({
        date: date.split('-').slice(1).join('/'),
        count: (history.data || []).filter(h => h.event_type === 'call' && h.created_at.startsWith(date)).length
      }))

      setDailyData({ dailyLeads, dailyCalls })
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
    // Dynamic headroom: if data is low, use a small max. If higher, add buffer.
    const gridMax = maxCount <= 4 ? 6 : Math.max(maxCount + 2, 10)
    
    return (
      <div style={{ height: '220px', position: 'relative', padding: '30px 0 20px' }}>
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <div key={i} style={{ 
            position: 'absolute', bottom: `${p * 180 + 20}px`, left: 0, right: 0, 
            borderTop: '1px dashed rgba(255,255,255,0.05)', pointerEvents: 'none' 
          }} />
        ))}

        <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '12px', position: 'relative', zIndex: 1 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
              {/* Permanent Label */}
              <span style={{ 
                fontSize: '0.7rem', fontWeight: 800, 
                color: d.count > 0 ? color : 'transparent',
                transition: 'all 0.3s',
                marginBottom: '4px'
              }}>
                {d.count > 0 ? d.count : ''}
              </span>
              
              <div 
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ 
                  width: '100%', 
                  height: `${(d.count / gridMax) * 180}px`, 
                  background: hoveredIndex === i ? color : `linear-gradient(to top, ${color}20, ${color})`,
                  borderRadius: '4px 4px 0 0',
                  minHeight: d.count > 0 ? '8px' : '0px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: d.count > 0 ? `0 4px 12px ${color}30` : 'none',
                  opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.6
                }} 
              >
                {hoveredIndex === i && d.count > 0 && (
                   <div style={{ 
                    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-15px)',
                    background: 'white', color: 'black', padding: '4px 8px', borderRadius: '6px', 
                    fontSize: '0.75rem', fontWeight: 800, zIndex: 10, whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    {d.count} Events
                  </div>
                )}
              </div>
              <span style={{ color: hoveredIndex === i ? 'white' : '#64748B', fontSize: '0.65rem', fontWeight: 700, transition: 'all 0.2s' }}>{d.date}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Dashboard Overview</h1>
        <p style={{ color: '#94A3B8' }}>Here's how AutoFlow Studio is performing today.</p>
      </div>

      {loading ? (
        <div style={{ padding: '100px', textAlign: 'center', color: '#94A3B8' }}>Initialising analytics...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            <StatCard title="Total Leads" value={stats.totalLeads} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} color="#e91e63" />
            <StatCard title="Booking Requests" value={stats.bookingLeads} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9c27b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>} color="#9c27b0" />
            <StatCard title="Contact Queries" value={stats.contactLeads} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.1a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>} color="#3b82f6" />
            <StatCard title="Subscribers" value={stats.newsletterSubs} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>} color="#10b981" />
          </div>

          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.02)' }}>
              {[
                { id: 'activity', label: 'Activity Feed' },
                { id: 'growth', label: 'Daily Growth' },
                { id: 'analytics', label: 'Lead Distribution' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                    padding: '20px 32px', background: 'transparent', border: 'none', 
                    color: activeTab === tab.id ? '#e91e63' : '#64748B', 
                    borderBottom: activeTab === tab.id ? '2px solid #e91e63' : 'none',
                    fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem',
                    transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '40px' }}>
              {activeTab === 'activity' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {recentActivity.length === 0 ? (
                    <p style={{ color: '#64748B', textAlign: 'center', padding: '40px' }}>No activity recorded yet.</p>
                  ) : recentActivity.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '12px', 
                        background: item.event_type === 'call' ? 'rgba(233, 30, 99, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {item.event_type === 'call' ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 6px', color: 'white', fontWeight: 600, fontSize: '1rem' }}>{item.content}</p>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'growth' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: 'white', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 800 }}>Leads Added (7 Days)</h4>
                    <BarChart data={dailyData.dailyLeads} color="#e91e63" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: 'white', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 800 }}>Calls Logged (7 Days)</h4>
                    <BarChart data={dailyData.dailyCalls} color="#3b82f6" />
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', padding: '48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
