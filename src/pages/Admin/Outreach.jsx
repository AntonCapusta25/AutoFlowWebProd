import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

export default function OutreachLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [emailHistory, setEmailHistory] = useState([])
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    if (selectedLead) {
      fetchEmailHistory(selectedLead.id)
    }
  }, [selectedLead])

  async function fetchLeads() {
    setLoading(true)
    const { data, error } = await supabase
      .from('outreach_leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setLeads(data || [])
    setLoading(false)
  }

  async function fetchEmailHistory(leadId) {
    const { data, error } = await supabase
      .from('outreach_emails')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    
    if (!error) setEmailHistory(data || [])
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase.from('outreach_leads').update({ status: newStatus }).eq('id', id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
      if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, status: newStatus }))
    }
  }

  async function promoteToClient(lead) {
    if (!confirm(`Promote ${lead.name || lead.email} to an active inbound lead?`)) return

    // 1. Insert into contact_leads (as a standardized "client" entry)
    const { error: insertError } = await supabase.from('contact_leads').insert([{
      name: lead.name || 'Promoted Lead',
      email: lead.email,
      company: lead.company,
      message: `Promoted from Outreach. Original Notes: ${lead.notes || 'None'}`,
      status: 'New'
    }])

    if (!insertError) {
      // 2. Mark as Promoted in outreach_leads
      await updateStatus(lead.id, 'Promoted')
      alert('Successfully promoted to Inbound Leads!')
    } else {
      alert('Error promoting lead: ' + insertError.message)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const csvData = event.target.result
      const lines = csvData.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const newLeads = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const values = lines[i].split(',').map(v => v.trim())
        const lead = {}
        headers.forEach((header, index) => {
          // Simple mapping logic
          if (header.includes('email')) lead.email = values[index]
          if (header.includes('name')) lead.name = values[index]
          if (header.includes('company')) lead.company = values[index]
          if (header.includes('website')) lead.website = values[index]
          if (header.includes('linkedin')) lead.linkedin = values[index]
          if (header.includes('industry')) lead.industry = values[index]
          if (header.includes('location')) lead.location = values[index]
        })
        if (lead.email) newLeads.push(lead)
      }

      if (newLeads.length > 0) {
        const { error } = await supabase.from('outreach_leads').insert(newLeads)
        if (!error) {
          alert(`Successfully imported ${newLeads.length} leads!`)
          fetchLeads()
        } else {
          alert('Error importing leads: ' + error.message)
        }
      }
      setIsImporting(false)
    }
    reader.readAsText(file)
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Lead Bank / Outreach</h1>
          <p style={{ color: '#94A3B8' }}>Manage and promote your scraped potential leads.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label style={{ 
            padding: '10px 20px', background: 'linear-gradient(135deg, #e91e63, #9c27b0)', 
            color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' 
          }}>
            {isImporting ? 'Importing...' : 'Upload CSV'}
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isImporting} />
          </label>
          <button onClick={fetchLeads} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 450px' : '1fr', gap: '24px', transition: 'all 0.3s' }}>
        {/* Table Container */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>LEAD / COMPANY</th>
                <th style={{ padding: '20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>INDUSTRY</th>
                <th style={{ padding: '20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>LINKS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Loading outreach bank...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No scraped leads found. Upload a CSV to get started.</td></tr>
              ) : leads.map(lead => (
                <tr 
                  key={lead.id} 
                  onClick={() => setSelectedLead(lead)}
                  style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer',
                    background: selectedLead?.id === lead.id ? 'rgba(233, 30, 99, 0.05)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '20px' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'white' }}>{lead.name || 'Unnamed Lead'}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>{lead.company || lead.email}</p>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ color: '#E2E8F0', fontSize: '0.85rem' }}>{lead.industry || '—'}</span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                      background: lead.status === 'Promoted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: lead.status === 'Promoted' ? '#6ee7b7' : '#94A3B8'
                    }}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#9c27b0' }}>🌐</a>}
                      {lead.linkedin && <a href={lead.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#0a66c2' }}>🔗</a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        {selectedLead && (
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px', position: 'sticky', top: '40px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Lead Profile</h3>
              <button onClick={() => setSelectedLead(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <button 
              onClick={() => promoteToClient(selectedLead)}
              disabled={selectedLead.status === 'Promoted'}
              style={{ 
                width: '100%', padding: '14px', marginBottom: '24px',
                background: selectedLead.status === 'Promoted' ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${selectedLead.status === 'Promoted' ? 'transparent' : '#10b981'}`,
                color: selectedLead.status === 'Promoted' ? '#64748B' : '#10b981',
                borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              {selectedLead.status === 'Promoted' ? 'Already Promoted' : 'Promote to Client'}
            </button>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Email History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {emailHistory.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No outbound emails sent yet.</p>
                ) : emailHistory.map(email => (
                  <div key={email.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{email.subject}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{new Date(email.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: email.status === 'Opened' ? '#10b981' : '#94A3B8' }}>
                      Status: {email.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
               <p style={{ margin: '0 0 12px', color: '#64748B', fontSize: '0.75rem', fontWeight: 800 }}>RAW DATA</p>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'white' }}><strong>Email:</strong> {selectedLead.email}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'white' }}><strong>Location:</strong> {selectedLead.location || '—'}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'white' }}><strong>Industry:</strong> {selectedLead.industry || '—'}</p>
               </div>
            </div>

            <button 
              onClick={() => {
                if (confirm('Permanently delete this scraped lead?')) {
                  supabase.from('outreach_leads').delete().eq('id', selectedLead.id).then(({ error }) => {
                    if (!error) {
                      setLeads(prev => prev.filter(l => l.id !== selectedLead.id))
                      setSelectedLead(null)
                    }
                  })
                }
              }}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Delete Scraped Lead
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
