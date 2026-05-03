import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalLeads: 0, bookingLeads: 0, contactLeads: 0, newsletterSubs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [bookings, contacts, subs] = await Promise.all([
        supabase.from('booking_leads').select('*', { count: 'exact', head: true }),
        supabase.from('contact_leads').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter_subs').select('*', { count: 'exact', head: true })
      ])

      setStats({
        bookingLeads: bookings.count || 0,
        contactLeads: contacts.count || 0,
        newsletterSubs: subs.count || 0,
        totalLeads: (bookings.count || 0) + (contacts.count || 0)
      })
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
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 4px' }}>{title}</p>
        <h3 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{value}</h3>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Dashboard Overview</h1>
        <p style={{ color: '#94A3B8' }}>Here's how AutoFlow Studio is performing today.</p>
      </div>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <StatCard title="Total Leads" value={stats.totalLeads} icon="🔥" color="#e91e63" />
          <StatCard title="Booking Requests" value={stats.bookingLeads} icon="📅" color="#9c27b0" />
          <StatCard title="Contact Queries" value={stats.contactLeads} icon="💬" color="#3b82f6" />
          <StatCard title="Subscribers" value={stats.newsletterSubs} icon="📧" color="#10b981" />
        </div>
      )}

      {/* Placeholder for Recent Activity */}
      <div style={{ marginTop: '40px', background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px' }}>
        <h3 style={{ color: 'white', marginBottom: '20px' }}>Recent Activity</h3>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Activity log and real-time alerts will appear here.</p>
      </div>
    </AdminLayout>
  )
}
