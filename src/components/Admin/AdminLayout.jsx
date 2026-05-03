import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const menu = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/leads', label: 'Inbound Leads', icon: '📥' },
    { to: '/admin/outreach', label: 'Outreach / Scraped', icon: '🚀' },
    { to: '/admin/segments', label: 'Segments', icon: '🎯' },
    { to: '/admin/campaigns', label: 'Campaigns', icon: '✉️' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', background: '#0a0a0a', borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', flexDirection: 'column', padding: '24px' 
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 800 }}>
            Auto<span style={{ color: '#f06292' }}>Flow</span> <span style={{ fontSize: '0.7rem', color: '#94A3B8', verticalAlign: 'middle', marginLeft: '4px' }}>ADMIN</span>
          </h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menu.map(item => (
            <Link 
              key={item.to} to={item.to}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                borderRadius: '12px', textDecoration: 'none', color: location.pathname === item.to ? 'white' : '#94A3B8',
                background: location.pathname === item.to ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          style={{ 
            marginTop: 'auto', padding: '12px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '12px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
