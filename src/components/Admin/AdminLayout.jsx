import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [segments, setSegments] = useState([])

  useEffect(() => {
    async function fetchSegments() {
      const { data } = await supabase.from('segments').select('id, name').order('name')
      if (data) setSegments(data)
    }
    fetchSegments()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const menu = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg> },
    { to: '/admin/leads', label: 'Inbound Leads', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
    { to: '/admin/outreach', label: 'Outreach / Scraped', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg> },
    { 
      to: '/admin/segments', label: 'Segments', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
      children: segments.map(s => ({ to: `/admin/segments/${s.id}`, label: s.name }))
    },
    { to: '/admin/campaigns', label: 'Campaigns', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: isCollapsed ? '80px' : '260px', background: '#0a0a0a', borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', flexDirection: 'column', padding: isCollapsed ? '24px 12px' : '24px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          {!isCollapsed && (
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Auto<span style={{ color: '#f06292' }}>Flow</span> <span style={{ fontSize: '0.7rem', color: '#94A3B8', verticalAlign: 'middle', marginLeft: '4px' }}>ADMIN</span>
            </h2>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', 
              cursor: 'pointer', padding: '8px', borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? <polyline points="13 17 18 12 13 7"></polyline> : <polyline points="11 17 6 12 11 7"></polyline>}
              {isCollapsed ? <line x1="6" y1="12" x2="18" y2="12"></line> : <line x1="18" y1="12" x2="6" y2="12"></line>}
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px' }}>
          {menu.map(item => (
            <div key={item.to}>
              <Link 
                to={item.to}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: isCollapsed ? '0' : '12px', padding: '12px', 
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: '12px', textDecoration: 'none', color: location.pathname.startsWith(item.to) ? 'white' : '#94A3B8',
                  background: location.pathname.startsWith(item.to) ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
                  transition: 'all 0.2s',
                  overflow: 'hidden'
                }}
                title={isCollapsed ? item.label : ''}
              >
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
                {!isCollapsed && <span style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{item.label}</span>}
              </Link>
              {!isCollapsed && item.children && location.pathname.startsWith(item.to) && (
                <div style={{ marginLeft: '42px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                  {item.children.map(child => (
                    <Link 
                      key={child.to} to={child.to}
                      style={{ 
                        padding: '8px 12px', color: location.pathname === child.to ? 'white' : '#64748B',
                        fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', borderRadius: '8px',
                        background: location.pathname === child.to ? 'rgba(255,255,255,0.03)' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          style={{ 
            marginTop: 'auto', padding: '12px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '12px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
