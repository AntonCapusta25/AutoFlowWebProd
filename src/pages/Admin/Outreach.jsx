import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

export default function OutreachLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [history, setHistory] = useState([])
  const [isImporting, setIsImporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [noteModalLead, setNoteModalLead] = useState(null)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 50

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    if (selectedLead) {
      fetchUnifiedHistory(selectedLead.id)
    }
  }, [selectedLead])

  async function fetchLeads(targetPage = null) {
    const p = targetPage !== null ? targetPage : page
    setLoading(true)
    
    // Fetch total count and page data in parallel
    const [countRes, dataRes] = await Promise.all([
      supabase.from('outreach_leads').select('*', { count: 'exact', head: true }),
      supabase.from('outreach_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .range(p * pageSize, (p + 1) * pageSize - 1)
    ])

    if (!countRes.error) setTotalCount(countRes.count || 0)
    if (!dataRes.error) {
      setLeads(dataRes.data || [])
      setPage(p)
    }
    setLoading(false)
  }

  async function fetchUnifiedHistory(leadId) {
    const [emails, interactions] = await Promise.all([
      supabase.from('outreach_emails').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
      supabase.from('lead_history').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
    ])

    const combined = [
      ...(emails.data || []).map(e => ({ ...e, type: 'email', event_type: 'email', content: `Email Sent: ${e.subject}` })),
      ...(interactions.data || [])
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setHistory(combined)
  }

  async function addComment(lead, content) {
    if (!content.trim()) return
    const { error } = await supabase.from('lead_history').insert({
      lead_id: lead.id,
      lead_type: 'outreach',
      event_type: 'note',
      content: content
    })
    if (!error) {
      if (selectedLead?.id === lead.id) fetchUnifiedHistory(lead.id)
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, notes: content } : l))
    }
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase.from('outreach_leads').update({ status: newStatus }).eq('id', id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
      if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, status: newStatus }))
      
      await supabase.from('lead_history').insert({
        lead_id: id,
        lead_type: 'outreach',
        event_type: 'status_change',
        content: `Status updated to ${newStatus}`
      })
      if (selectedLead?.id === id) fetchUnifiedHistory(id)
    }
  }

  async function logCall(lead) {
    const newCount = (lead.call_attempts || 0) + 1
    const { error } = await supabase.from('outreach_leads').update({ call_attempts: newCount }).eq('id', lead.id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, call_attempts: newCount } : l))
      if (selectedLead?.id === lead.id) setSelectedLead(prev => ({ ...prev, call_attempts: newCount }))

      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: 'outreach',
        event_type: 'call',
        content: `Call attempt #${newCount}`
      })
      fetchUnifiedHistory(lead.id)
    }
  }

  async function deleteHistoryItem(id) {
    if (!confirm('Delete this comment?')) return
    const { error } = await supabase.from('lead_history').delete().eq('id', id)
    if (!error) {
      setHistory(prev => prev.filter(item => item.id !== id))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scraped': return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.2)' }
      case 'Contacted': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.2)' }
      case 'Interested': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.2)' }
      case 'Not Interested': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.2)' }
      case 'Promoted': return { bg: 'rgba(233, 30, 99, 0.1)', text: '#f472b6', border: 'rgba(233, 30, 99, 0.2)' }
      default: return { bg: 'rgba(255,255,255,0.05)', text: '#94A3B8', border: 'rgba(255,255,255,0.1)' }
    }
  }

  async function deleteLead(lead) {
    if (!confirm('Permanently delete this scraped lead?')) return
    const { error } = await supabase.from('outreach_leads').delete().eq('id', lead.id)
    if (error) {
      console.error('Delete error:', error)
      alert('Error deleting lead: ' + error.message)
    } else {
      setLeads(prev => prev.filter(l => l.id !== lead.id))
      if (selectedLead?.id === lead.id) setSelectedLead(null)
    }
  }

  async function batchDelete() {
    if (!selectedIds.length) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) return
    
    const { error } = await supabase.from('outreach_leads').delete().in('id', selectedIds)
    if (error) {
      console.error('Batch delete error:', error)
      alert('Error during batch delete: ' + error.message)
    } else {
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)))
      setSelectedIds([])
      if (selectedLead && selectedIds.includes(selectedLead.id)) setSelectedLead(null)
    }
  }

  async function promoteToClient(lead) {
    if (!confirm(`Promote ${lead.name || lead.email} to an active inbound lead?`)) return
    const { error: insertError } = await supabase.from('contact_leads').insert([{
      name: lead.name || 'Promoted Lead',
      email: lead.email,
      company: lead.company,
      message: `Promoted from Outreach. Original Notes: ${lead.notes || 'None'}`,
      status: 'New'
    }])
    if (!insertError) {
      await updateStatus(lead.id, 'Promoted')
      alert('Successfully promoted to Inbound Leads!')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const csvData = event.target.result
      
      // Robust CSV Parser
      const parseCSV = (text) => {
        const rows = []
        let row = []
        let col = ''
        let inQuotes = false
        for (let i = 0; i < text.length; i++) {
          const char = text[i]
          const next = text[i+1]
          if (inQuotes) {
            if (char === '"' && next === '"') { col += '"'; i++ }
            else if (char === '"') { inQuotes = false }
            else { col += char }
          } else {
            if (char === '"') { inQuotes = true }
            else if (char === ',') { row.push(col); col = '' }
            else if (char === '\r' || char === '\n') {
              row.push(col); rows.push(row); row = []; col = ''
              if (char === '\r' && next === '\n') i++
            }
            else { col += char }
          }
        }
        if (row.length || col) { row.push(col); rows.push(row) }
        return rows
      }

      const rows = parseCSV(csvData)
      if (rows.length < 2) { setIsImporting(false); return }
      
      const headers = rows[0].map(h => h.trim().toLowerCase())
      const newLeads = []
      
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i]
        if (!values.some(v => v.trim())) continue
        const lead = {}
        headers.forEach((header, index) => {
          let val = values[index]?.replace(/^["']|["']$/g, '').trim()
          if (!val) return
          if (header.includes('email')) lead.email = val
          if (header.includes('name')) lead.name = val
          if (header.includes('company')) lead.company = val
          if (header.includes('website') || header.includes('url')) lead.website = val
          if (header.includes('linkedin')) lead.linkedin = val
          if (header.includes('industry')) lead.industry = val
          if (header.includes('location')) lead.location = val
          if (header.includes('phone') || header.includes('tel')) lead.phone = val
        })
        if (lead.email) newLeads.push(lead)
      }
      if (newLeads.length > 0) {
        const { error } = await supabase.from('outreach_leads').insert(newLeads)
        if (!error) { fetchLeads() }
      }
      setIsImporting(false)
    }
    reader.readAsText(file)
  }

  function toggleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Lead Bank / Outreach</h1>
          <p style={{ color: '#94A3B8' }}>Manage and promote your scraped potential leads.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {selectedIds.length > 0 && (
            <button onClick={batchDelete} style={{ padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <label style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #e91e63, #9c27b0)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            {isImporting ? 'Importing...' : 'Upload CSV'}
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isImporting} />
          </label>
          <button onClick={fetchLeads} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 480px' : '1fr', gap: '24px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '24px 20px', width: '40px' }}>
                  <input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? leads.map(l => l.id) : [])} checked={selectedIds.length === leads.length && leads.length > 0} />
                </th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scraped Profile</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Comment</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading scraped leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No outreach leads found.</td></tr>
              ) : leads.map(lead => {
                const s = getStatusColor(lead.status)
                return (
                  <tr 
                    key={lead.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: selectedLead?.id === lead.id ? 'rgba(233, 30, 99, 0.04)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <td style={{ padding: '20px' }}>
                      <input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} />
                    </td>
                    <td style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setSelectedLead(lead)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>{(lead.name || lead.email).charAt(0).toUpperCase()}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{lead.name || 'Unnamed'}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{lead.company || 'Private'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      {lead.website ? (() => {
                        let url = lead.website.trim().replace(/^https?:\/*/, '')
                        const fullUrl = `https://${url}`
                        return (
                          <a 
                            href={fullUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', 
                              fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
                              background: 'rgba(59, 130, 246, 0.05)', padding: '6px 12px', borderRadius: '8px', width: 'fit-content'
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Visit
                          </a>
                        )
                      })() : (
                        <span style={{ color: '#475569', fontSize: '0.85rem' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span>{lead.phone || 'N/A'}</span>
                        {lead.phone && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(lead.phone);
                              const target = e.currentTarget;
                              const originalInner = target.innerHTML;
                              target.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                              setTimeout(() => target.innerHTML = originalInner, 2000);
                            }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.5 }}
                            title="Copy Phone"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <select 
                        value={lead.status} 
                        onChange={e => updateStatus(lead.id, e.target.value)}
                        style={{ 
                          padding: '8px 12px', background: s.bg, border: `1px solid ${s.border}`, 
                          borderRadius: '10px', color: s.text, fontSize: '0.8rem', fontWeight: 700, outline: 'none', cursor: 'pointer' 
                        }}
                      >
                        <option value="Scraped">Scraped</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Promoted">Promoted</option>
                      </select>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', 
                          borderRadius: '10px', color: lead.notes ? '#CBD5E1' : '#475569', fontSize: '0.85rem', 
                          minHeight: '40px', display: 'flex', alignItems: 'center', fontStyle: lead.notes ? 'normal' : 'italic',
                          maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {lead.notes || 'No notes yet...'}
                        </div>
                        <button 
                          onClick={() => setNoteModalLead(lead)}
                          style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(233, 30, 99, 0.1)', 
                            border: '1px solid rgba(233, 30, 99, 0.2)', color: '#e91e63', fontSize: '1.2rem', 
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => logCall(lead)}
                          title="Log Call"
                          style={{ 
                            padding: '8px 12px', background: 'rgba(233, 30, 99, 0.08)', border: '1px solid rgba(233, 30, 99, 0.1)', 
                            color: '#e91e63', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{lead.call_attempts || 0}</span>
                        </button>
                        
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          title="View History"
                          style={{ 
                            padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                            color: '#94A3B8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {totalCount > pageSize && (
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <button 
                disabled={page === 0 || loading} 
                onClick={() => fetchLeads(page - 1)}
                style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page === 0 ? '#475569' : 'white', borderRadius: '8px', cursor: page === 0 ? 'default' : 'pointer', fontWeight: 600 }}
              >
                Prev
              </button>
              
              {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }).map((_, i) => {
                const totalPages = Math.ceil(totalCount / pageSize)
                let pageNum = i
                if (totalPages > 5 && page > 2) {
                  pageNum = Math.min(page - 2 + i, totalPages - 5 + i)
                }
                return (
                  <button 
                    key={pageNum}
                    onClick={() => fetchLeads(pageNum)}
                    style={{ 
                      width: '40px', height: '40px', borderRadius: '8px', 
                      background: page === pageNum ? '#e91e63' : 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', color: 'white', 
                      cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s'
                    }}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}

              <button 
                disabled={page >= Math.ceil(totalCount / pageSize) - 1 || loading} 
                onClick={() => fetchLeads(page + 1)}
                style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page >= Math.ceil(totalCount / pageSize) - 1 ? '#475569' : 'white', borderRadius: '8px', cursor: page >= Math.ceil(totalCount / pageSize) - 1 ? 'default' : 'pointer', fontWeight: 600 }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {selectedLead && (
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '32px', position: 'sticky', top: '40px', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{(selectedLead.name || selectedLead.email).charAt(0).toUpperCase()}</div>
                <div>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{selectedLead.name || 'Unnamed'}</h3>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Outreach Lead</p>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <button 
              onClick={() => promoteToClient(selectedLead)}
              disabled={selectedLead.status === 'Promoted'}
              style={{ width: '100%', padding: '16px', marginBottom: '32px', background: selectedLead.status === 'Promoted' ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${selectedLead.status === 'Promoted' ? 'transparent' : '#10b981'}`, color: selectedLead.status === 'Promoted' ? '#64748B' : '#10b981', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {selectedLead.status === 'Promoted' ? (
                'Already Promoted'
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.09-3.05a3.5 3.5 0 0 1-.09-3.05c-.62-.92-.62-2.21.09-3.05 1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.13.71-3.05.09a3.5 3.5 0 0 1-3.05-.09c-.92.62-2.21.62-3.05-.09z"></path><path d="M11.5 9.5l4-4"></path><path d="M15.5 5.5l2-2"></path><circle cx="15.5" cy="8.5" r="3.5"></circle></svg>
                  Promote to Client
                </>
              )}
            </button>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Add Comment</label>
              <div style={{ position: 'relative' }}>
                <textarea 
                  id="sidebar-comment"
                  placeholder="Share an update or internal note..."
                  style={{ width: '100%', height: '100px', padding: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none', resize: 'none', fontSize: '0.9rem', lineHeight: '1.5' }}
                />
                <button 
                  onClick={() => {
                    const el = document.getElementById('sidebar-comment')
                    addComment(selectedLead, el.value)
                    el.value = ''
                  }}
                  style={{ position: 'absolute', bottom: '12px', right: '12px', padding: '8px 16px', background: '#e91e63', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Save Comment
                </button>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Timeline</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>{history.length} events</span>
              </h4>
              <div style={{ display: 'grid', gap: '0' }}>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px' }}>
                    <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No activity logged for this lead yet.</p>
                  </div>
                ) : history.map((item, idx) => (
                  <div key={item.id} style={{ display: 'flex', gap: '20px', position: 'relative', paddingBottom: idx === history.length - 1 ? 0 : '24px' }}>
                    {idx !== history.length - 1 && <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: 0, width: '2px', background: 'rgba(255,255,255,0.05)' }} />}
                    <div style={{ 
                      width: '16px', height: '16px', borderRadius: '50%', 
                      background: item.event_type === 'call' ? '#e91e63' : item.event_type === 'note' ? '#3b82f6' : item.event_type === 'email' ? '#f59e0b' : '#10b981', 
                      zIndex: 1, marginTop: '4px', flexShrink: 0,
                      boxShadow: `0 0 10px ${item.event_type === 'call' ? 'rgba(233, 30, 99, 0.3)' : 'transparent'}`
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <p style={{ margin: 0, color: 'white', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.content}</p>
                        {item.event_type === 'note' && (
                          <button onClick={() => deleteHistoryItem(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        )}
                      </div>
                      <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem' }}>{new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
               <button onClick={() => logCall(selectedLead)} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                 Log Call
               </button>
               <button onClick={() => deleteLead(selectedLead)} style={{ padding: '14px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {noteModalLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>Outreach Comment</h3>
              <button onClick={() => setNoteModalLead(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <textarea 
              id="modal-outreach-note"
              autoFocus
              placeholder="What happened?"
              style={{ width: '100%', height: '120px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none', resize: 'none', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  const content = document.getElementById('modal-outreach-note').value
                  addComment(noteModalLead, content)
                  setNoteModalLead(null)
                }}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Save Outreach Note
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
