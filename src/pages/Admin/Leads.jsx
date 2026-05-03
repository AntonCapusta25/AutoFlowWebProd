import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

export default function AdminLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    const [bookings, contacts] = await Promise.all([
      supabase.from('booking_leads').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_leads').select('*').order('created_at', { ascending: false })
    ])

    const combined = [
      ...(bookings.data || []).map(l => ({ ...l, type: 'Booking' })),
      ...(contacts.data || []).map(l => ({ ...l, type: 'Contact' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setLeads(combined)
    setLoading(false)
  }

  async function updateStatus(id, type, newStatus) {
    const table = type === 'Booking' ? 'booking_leads' : 'contact_leads'
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
      if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, status: newStatus }))
    }
  }

  async function updateNotes(id, type, notes) {
    const table = type === 'Booking' ? 'booking_leads' : 'contact_leads'
    const { error } = await supabase.from(table).update({ notes }).eq('id', id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l))
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>CRM / Leads</h1>
          <p style={{ color: '#94A3B8' }}>Manage your relationship with potential clients.</p>
        </div>
        <button onClick={fetchLeads} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 400px' : '1fr', gap: '24px', transition: 'all 0.3s' }}>
        {/* Table Container */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>LEAD</th>
                <th style={{ padding: '20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>SOURCE</th>
                <th style={{ padding: '20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No leads found.</td></tr>
              ) : leads.map(lead => (
                <tr 
                  key={lead.id} 
                  onClick={() => setSelectedLead(lead)}
                  style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer',
                    background: selectedLead?.id === lead.id ? 'rgba(233, 30, 99, 0.05)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => !selectedLead || selectedLead.id !== lead.id ? e.currentTarget.style.background = 'rgba(255,255,255,0.02)' : null}
                  onMouseOut={e => !selectedLead || selectedLead.id !== lead.id ? e.currentTarget.style.background = 'transparent' : null}
                >
                  <td style={{ padding: '20px' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'white' }}>{lead.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>{lead.email}</p>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                      background: lead.type === 'Booking' ? 'rgba(156, 39, 176, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: lead.type === 'Booking' ? '#d8b4fe' : '#93c5fd'
                    }}>
                      {lead.type}
                    </span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                      background: lead.status === 'New' ? 'rgba(233, 30, 99, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: lead.status === 'New' ? '#f472b6' : '#6ee7b7'
                    }}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px', color: '#64748B', fontSize: '0.85rem' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Details Sidebar */}
        {selectedLead && (
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px', position: 'sticky', top: '40px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Status</label>
              <select 
                value={selectedLead.status} 
                onChange={e => updateStatus(selectedLead.id, selectedLead.type, e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Notes</label>
              <textarea 
                defaultValue={selectedLead.notes || ''}
                onBlur={e => updateNotes(selectedLead.id, selectedLead.type, e.target.value)}
                placeholder="Add private notes about this lead..."
                style={{ width: '100%', height: '120px', padding: '12px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 4px', color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>EMAIL</p>
                <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>{selectedLead.email}</p>
              </div>
              {selectedLead.company && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px', color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>COMPANY</p>
                  <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>{selectedLead.company}</p>
                </div>
              )}
              {selectedLead.service && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px', color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>SERVICE INTEREST</p>
                  <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>{selectedLead.service}</p>
                </div>
              )}
              {selectedLead.size && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 4px', color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>BUSINESS SIZE</p>
                  <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>{selectedLead.size}</p>
                </div>
              )}
              {(selectedLead.message) && (
                <div>
                  <p style={{ margin: '0 0 4px', color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>MESSAGE / NOTES</p>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.6 }}>{selectedLead.message}</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (confirm('Are you sure you want to PERMANENTLY delete this lead?')) {
                  const table = selectedLead.type === 'Booking' ? 'booking_leads' : 'contact_leads'
                  supabase.from(table).delete().eq('id', selectedLead.id).then(({ error }) => {
                    if (!error) {
                      setLeads(prev => prev.filter(l => l.id !== selectedLead.id))
                      setSelectedLead(null)
                    }
                  })
                }
              }}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Delete Lead
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
