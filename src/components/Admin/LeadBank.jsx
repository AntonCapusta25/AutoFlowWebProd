import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LeadBank({ filters = {}, title = "Lead Bank", subtitle = "Manage your leads." }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [history, setHistory] = useState([])
  const [isImporting, setIsImporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [noteModalLead, setNoteModalLead] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [activeIndustries, setActiveIndustries] = useState([])
  const [tableIndustryFilter, setTableIndustryFilter] = useState('')
  const [tableTagFilter, setTableTagFilter] = useState('')
  const [dbIndustries, setDbIndustries] = useState([])
  const [dbTags, setDbTags] = useState([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [importIndustry, setImportIndustry] = useState('')
  const [importTags, setImportTags] = useState('')
  const [newNote, setNewNote] = useState('')
  const pageSize = 50

  const statusOptions = [
    { label: 'All' },
    { label: 'New' },
    { label: 'Contacted' },
    { label: 'In Progress' },
    { label: 'Converted' },
    { label: 'Lost' }
  ]

  async function fetchLeads(targetPage = null) {
    const p = targetPage !== null ? targetPage : page
    setLoading(true)
    
    try {
      let query = supabase
        .from('outreach_leads')
        .select('*', { count: 'exact' })

      // Apply Global Segment Filters
      if (filters.industry) query = query.ilike('industry', `%${filters.industry}%`)
      if (filters.tags) query = query.contains('tags', [filters.tags])

      // Apply Status Toggle Filter
      if (statusFilter !== 'All') query = query.eq('status', statusFilter)

      // Apply Excel-style Column Filters
      if (tableIndustryFilter) query = query.eq('industry', tableIndustryFilter)
      if (tableTagFilter) query = query.contains('tags', [tableTagFilter])

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`)
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(p * pageSize, (p + 1) * pageSize - 1)

      if (!error) {
        setLeads(data || [])
        setTotalCount(count || 0)
        if (targetPage !== null) setPage(targetPage)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads(0)
  }, [searchTerm, statusFilter, tableIndustryFilter, tableTagFilter, JSON.stringify(filters)])

  useEffect(() => {
    async function fetchFilterOptions() {
      const { data } = await supabase.from('outreach_leads').select('industry, tags').limit(10000)
      if (data) {
        setDbIndustries([...new Set(data.map(d => d.industry).filter(Boolean))].sort())
        setDbTags([...new Set(data.flatMap(d => Array.isArray(d.tags) ? d.tags : []).filter(Boolean))].sort())
      }
    }
    fetchFilterOptions()
  }, [])

  async function fetchUnifiedHistory(leadId) {
    const [emails, interactions] = await Promise.all([
      supabase.from('outreach_emails').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
      supabase.from('lead_history').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
    ])

    const combined = [
      ...(emails.data || []).map(e => ({ ...e, type: 'email', event_type: 'email', content: `Email Sent: ${e.subject}` })),
      ...(interactions.data || [])
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const uniqueHistory = Array.from(new Map(combined.map(item => [item.id, item])).values())
    setHistory(uniqueHistory)
  }

  useEffect(() => {
    if (selectedLead?.id) {
      fetchUnifiedHistory(selectedLead.id)
    }
  }, [selectedLead?.id])

  async function addComment(lead, content) {
    if (!content.trim() || isActionLoading) return
    setIsActionLoading(true)
    const [historyRes, leadRes] = await Promise.all([
      supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: 'outreach',
        event_type: 'note',
        content: content
      }),
      supabase.from('outreach_leads').update({ notes: content }).eq('id', lead.id)
    ])
    if (!historyRes.error && !leadRes.error) {
      if (selectedLead?.id === lead.id) {
        fetchUnifiedHistory(lead.id)
        setSelectedLead(prev => ({ ...prev, notes: content }))
        setNewNote('')
      }
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, notes: content } : l))
    }
    setIsActionLoading(false)
  }

  async function updateStatus(id, newStatus) {
    if (isActionLoading) return
    setIsActionLoading(true)
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
    setIsActionLoading(false)
  }

  async function logCall(lead) {
    if (isActionLoading) return
    setIsActionLoading(true)
    const newCount = (lead.call_attempts || 0) + 1
    const { error } = await supabase.from('outreach_leads').update({ call_attempts: newCount }).eq('id', lead.id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, call_attempts: newCount } : l))
      if (selectedLead?.id === lead.id) setSelectedLead(prev => ({ ...prev, call_attempts: newCount }))

      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: 'outreach',
        event_type: 'call',
        content: `Call attempt #${newCount} to ${lead.name || lead.email}`
      })
      fetchUnifiedHistory(lead.id)
    }
    setIsActionLoading(false)
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
      case 'New': return { bg: 'rgba(233, 30, 99, 0.1)', text: 'rgb(244, 114, 182)', border: '1px solid rgba(233, 30, 99, 0.2)' }
      case 'Contacted': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.2)' }
      case 'In Progress': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.2)' }
      case 'Converted': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.2)' }
      case 'Lost': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }
      // legacy support
      case 'Scraped': return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94A3B8', border: '1px solid rgba(148, 163, 184, 0.2)' }
      case 'Interested': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.2)' }
      case 'Not Interested': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }
      case 'Promoted': return { bg: 'rgba(233, 30, 99, 0.1)', text: '#f472b6', border: '1px solid rgba(233, 30, 99, 0.2)' }
      default: return { bg: 'rgba(233, 30, 99, 0.1)', text: 'rgb(244, 114, 182)', border: '1px solid rgba(233, 30, 99, 0.2)' }
    }
  }

  async function deleteLead(lead) {
    if (!confirm('Permanently delete this scraped lead?')) return
    const { error } = await supabase.from('outreach_leads').delete().eq('id', lead.id)
    if (!error) {
      setLeads(prev => prev.filter(l => l.id !== lead.id))
      if (selectedLead?.id === lead.id) setSelectedLead(null)
    }
  }

  async function batchDelete() {
    if (!selectedIds.length) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) return
    
    const { error } = await supabase.from('outreach_leads').delete().in('id', selectedIds)
    if (!error) {
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)))
      setSelectedIds([])
      if (selectedLead && selectedIds.includes(selectedLead.id)) setSelectedLead(null)
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return
    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const csvData = event.target.result
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
          if (header.includes('email')) lead.email = val.toLowerCase()
          if (header.includes('name')) lead.name = val
          if (header.includes('company')) lead.company = val
          if (header.includes('website') || header.includes('url')) lead.website = val
          if (header.includes('linkedin')) lead.linkedin = val
          if (header.includes('industry')) lead.industry = val || importIndustry
          if (header.includes('location')) lead.location = val
          if (header.includes('phone') || header.includes('tel')) lead.phone = val
        })
        
        if (lead.email) {
          if (importTags) {
            const extraTags = importTags.split(',').map(t => t.trim()).filter(Boolean)
            lead.tags = extraTags
          }
          newLeads.push(lead)
        }
      }

      if (newLeads.length > 0) {
        const emailsToImport = [...new Set(newLeads.map(l => l.email))]
        const existingEmails = new Set()
        for (let i = 0; i < emailsToImport.length; i += 1000) {
          const chunk = emailsToImport.slice(i, i + 1000)
          const { data } = await supabase.from('outreach_leads').select('email').in('email', chunk)
          if (data) data.forEach(d => existingEmails.add(d.email.toLowerCase()))
        }

        const uniqueLeads = newLeads.filter(l => !existingEmails.has(l.email))
        const duplicateCount = newLeads.length - uniqueLeads.length

        if (uniqueLeads.length > 0) {
          const { error } = await supabase.from('outreach_leads').insert(uniqueLeads)
          if (!error) {
            alert(`Import Successful!\nAdded: ${uniqueLeads.length} new leads.\nSkipped: ${duplicateCount} duplicates.`)
            fetchLeads()
            setShowImportModal(false)
          } else {
            alert('Import Error: ' + error.message)
          }
        } else {
          alert(`No new leads found. All ${newLeads.length} leads are already in the database.`)
        }
      }
      setIsImporting(false)
    }
    reader.readAsText(file)
  }


  async function batchIndustryUpdate() {
    if (!selectedIds.length) return
    const industry = prompt('Enter industry for selected leads:')
    if (!industry || !industry.trim()) return
    
    setIsActionLoading(true)
    try {
      const { error } = await supabase.from('outreach_leads').update({ industry: industry.trim() }).in('id', selectedIds)
      if (!error) {
        fetchLeads()
        setSelectedIds([])
      }
    } catch (err) {
      console.error('Batch industry error:', err)
    } finally {
      setIsActionLoading(false)
    }
  }

  async function batchAddTag() {
    if (!selectedIds.length) return
    const tag = prompt('Enter tag to add to selected leads:')
    if (!tag || !tag.trim()) return
    
    setIsActionLoading(true)
    try {
      // Fetch current tags first
      const { data: currentLeads } = await supabase.from('outreach_leads').select('id, tags').in('id', selectedIds)
      
      const updates = currentLeads.map(l => {
        const existingTags = Array.isArray(l.tags) ? l.tags : []
        if (!existingTags.includes(tag.trim())) {
          return { id: l.id, tags: [...existingTags, tag.trim()] }
        }
        return null
      }).filter(Boolean)

      if (updates.length > 0) {
        for (const update of updates) {
          await supabase.from('outreach_leads').update({ tags: update.tags }).eq('id', update.id)
        }
        fetchLeads()
        setSelectedIds([])
      }
    } catch (err) {
      console.error('Batch tag error:', err)
    } finally {
      setIsActionLoading(false)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  async function deduplicateDatabase() {
    if (!confirm('This will scan your entire database for duplicate emails and keep only the most recent one for each. Proceed?')) return
    
    setIsActionLoading(true)
    try {
      // 1. Fetch all email addresses and IDs (using chunks if necessary, but 10k is usually safe for this metadata)
      const { data, error } = await supabase.from('outreach_leads').select('id, email, created_at').limit(50000)
      
      if (error) throw error
      if (!data) return

      // 2. Group by email
      const emailMap = {}
      data.forEach(lead => {
        const email = (lead.email || '').toLowerCase().trim()
        if (!email) return
        if (!emailMap[email]) emailMap[email] = []
        emailMap[email].push(lead)
      })

      // 3. Identify duplicates to delete
      const idsToDelete = []
      Object.values(emailMap).forEach(leads => {
        if (leads.length > 1) {
          // Sort by created_at descending (newest first)
          leads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          // Keep the first (newest), add others to delete list
          leads.slice(1).forEach(l => idsToDelete.push(l.id))
        }
      })

      if (idsToDelete.length === 0) {
        alert('No duplicates found! Your database is clean.')
      } else {
        if (confirm(`Found ${idsToDelete.length} duplicates. Delete them now?`)) {
          // Delete in chunks of 500
          for (let i = 0; i < idsToDelete.length; i += 500) {
            const chunk = idsToDelete.slice(i, i + 500)
            await supabase.from('outreach_leads').delete().in('id', chunk)
          }
          alert(`Success! Removed ${idsToDelete.length} duplicate leads.`)
          fetchLeads()
        }
      }
    } catch (err) {
      console.error('Dedup error:', err)
      alert('Cleanup failed: ' + err.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>{title}</h1>
          <p style={{ color: '#94A3B8' }}>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(0)
              }}
              style={{ 
                padding: '10px 16px 10px 38px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '12px', color: 'white', fontSize: '0.9rem', outline: 'none', width: '260px',
                transition: 'all 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(233, 30, 99, 0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={batchIndustryUpdate} style={{ padding: '10px 20px', background: 'rgba(156, 39, 176, 0.1)', border: '1px solid rgba(156, 39, 176, 0.2)', color: '#d8b4fe', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
                Update Industry
              </button>
              <button onClick={batchAddTag} style={{ padding: '10px 20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
                Add Tag
              </button>
              <button onClick={batchDelete} style={{ padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
                Delete ({selectedIds.length})
              </button>
            </div>
          )}
          <button onClick={deduplicateDatabase} disabled={isActionLoading} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            {isActionLoading ? 'Cleaning...' : 'Cleanup Duplicates'}
          </button>
          <button onClick={() => setShowImportModal(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #e91e63, #9c27b0)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', border: 'none' }}>
            {isImporting ? 'Importing...' : 'Upload CSV'}
          </button>
          <button onClick={() => fetchLeads()} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Refresh</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', alignItems: 'center' }}>
        <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Filter Status:</p>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'white', padding: '10px 16px', borderRadius: '12px', fontSize: '0.9rem',
            outline: 'none', cursor: 'pointer', fontWeight: 600
          }}
        >
          {statusOptions.map(opt => (
            <option key={opt.label} value={opt.label} style={{ background: '#0a0a0a', color: 'white' }}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 440px' : '1fr', gap: '24px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', overflowX: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '24px 20px', width: '40px' }}>
                  <input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? leads.map(l => l.id) : [])} checked={selectedIds.length === leads.length && leads.length > 0} />
                </th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scraped Profile</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Industry
                    <select 
                      value={tableIndustryFilter} 
                      onChange={e => setTableIndustryFilter(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#3b82f6', outline: 'none', cursor: 'pointer', fontWeight: 800 }}
                    >
                      <option value="" style={{ background: '#0a0a0a', color: 'white' }}>All</option>
                      {dbIndustries.map(ind => (
                        <option key={ind} value={ind} style={{ background: '#0a0a0a', color: 'white' }}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Tags
                    <select 
                      value={tableTagFilter} 
                      onChange={e => setTableTagFilter(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#3b82f6', outline: 'none', cursor: 'pointer', fontWeight: 800 }}
                    >
                      <option value="" style={{ background: '#0a0a0a', color: 'white' }}>All</option>
                      {dbTags.map(tag => (
                        <option key={tag} value={tag} style={{ background: '#0a0a0a', color: 'white' }}>{tag}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Status
                    <select 
                      value={statusFilter} 
                      onChange={e => setStatusFilter(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#3b82f6', outline: 'none', cursor: 'pointer', fontWeight: 800 }}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.label} value={opt.label} style={{ background: '#0a0a0a', color: 'white' }}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Comment</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', position: 'sticky', right: 0, background: '#0a0a0a', zIndex: 10, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading scraped leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="9" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No outreach leads match table filters.</td></tr>
              ) : leads.map(lead => {
                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: selectedLead?.id === lead.id ? 'rgba(233, 30, 99, 0.04)' : 'transparent', transition: 'all 0.2s' }}>
                    <td style={{ padding: '20px' }}>
                      <input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} />
                    </td>
                    <td style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setSelectedLead(lead)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', minWidth: '40px', flexShrink: 0, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>{(lead.name || lead.email).charAt(0).toUpperCase()}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{lead.name || lead.email}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{lead.company || 'Private'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      {lead.website ? (() => {
                        let url = lead.website.trim().replace(/^https?:\/*/, '')
                        const fullUrl = `https://${url}`
                        return (
                          <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(59, 130, 246, 0.05)', padding: '6px 12px', borderRadius: '8px', width: 'fit-content' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Visit
                          </a>
                        )
                      })() : <span style={{ color: '#475569', fontSize: '0.85rem' }}>N/A</span>}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span>{lead.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <input 
                        type="text" placeholder="Industry"
                        value={lead.industry || ''}
                        onChange={async (e) => {
                          const val = e.target.value
                          setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, industry: val } : l))
                        }}
                        onBlur={async (e) => {
                          await supabase.from('outreach_leads').update({ industry: e.target.value }).eq('id', lead.id)
                        }}
                        style={{ background: 'transparent', border: '1px solid transparent', color: '#CBD5E1', fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', width: '100px' }}
                        onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.border = '1px solid transparent'}
                      />
                    </td>
                    <td style={{ padding: '20px' }}>
                      <input 
                        type="text" placeholder="Tags"
                        value={Array.isArray(lead.tags) ? lead.tags.join(', ') : (lead.tags || '')}
                        onChange={async (e) => {
                          const val = e.target.value
                          setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, tags: val } : l))
                        }}
                        onBlur={async (e) => {
                          const tagArray = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          await supabase.from('outreach_leads').update({ tags: tagArray }).eq('id', lead.id)
                        }}
                        style={{ background: 'transparent', border: '1px solid transparent', color: '#CBD5E1', fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', width: '100px' }}
                        onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.border = '1px solid transparent'}
                      />
                    </td>
                    <td style={{ padding: '20px' }}>
                      <select
                        value={lead.status || 'New'}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          background: getStatusColor(lead.status).bg,
                          border: getStatusColor(lead.status).border,
                          borderRadius: '10px',
                          color: getStatusColor(lead.status).text,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="New" style={{ background: '#0a0a0a', color: 'white' }}>New</option>
                        <option value="Contacted" style={{ background: '#0a0a0a', color: 'white' }}>Contacted</option>
                        <option value="In Progress" style={{ background: '#0a0a0a', color: 'white' }}>In Progress</option>
                        <option value="Converted" style={{ background: '#0a0a0a', color: 'white' }}>Converted</option>
                        <option value="Lost" style={{ background: '#0a0a0a', color: 'white' }}>Lost</option>
                      </select>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div onClick={() => setSelectedLead(lead)} style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', padding: '10px 40px 10px 14px', minHeight: '44px' }}>
                        <div style={{ color: lead.notes ? '#CBD5E1' : '#475569', fontSize: '0.85rem', fontStyle: lead.notes ? 'normal' : 'italic', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.notes || 'No notes yet...'}</div>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6', fontSize: '1.1rem', fontWeight: 800, opacity: 0.6 }}>+</div>
                      </div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'center', position: 'sticky', right: 0, background: selectedLead?.id === lead.id ? '#1a0b12' : '#0a0a0a', zIndex: 10, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => logCall(lead)} style={{ padding: '8px 12px', background: 'rgba(233, 30, 99, 0.08)', border: '1px solid rgba(233, 30, 99, 0.1)', color: '#e91e63', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
                Showing <span style={{ color: 'white' }}>{page * pageSize + 1}</span> to <span style={{ color: 'white' }}>{Math.min((page + 1) * pageSize, totalCount)}</span> of <span style={{ color: 'white' }}>{totalCount}</span> leads
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  disabled={page === 0 || loading} 
                  onClick={() => fetchLeads(page - 1)}
                  style={{ 
                    padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: page === 0 ? '#475569' : 'white', borderRadius: '10px', cursor: page === 0 ? 'default' : 'pointer',
                    fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s'
                  }}
                >
                  Prev
                </button>
                
                <div style={{ display: 'flex', gap: '6px' }}>
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
                          width: '40px', height: '40px', borderRadius: '10px', 
                          background: page === pageNum ? '#e91e63' : 'rgba(255,255,255,0.03)', 
                          border: page === pageNum ? 'none' : '1px solid rgba(255,255,255,0.08)', 
                          color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', 
                          transition: 'all 0.2s',
                          boxShadow: page === pageNum ? '0 4px 15px rgba(233, 30, 99, 0.3)' : 'none'
                        }}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                </div>

                <button 
                  disabled={page >= Math.ceil(totalCount / pageSize) - 1 || loading} 
                  onClick={() => fetchLeads(page + 1)}
                  style={{ 
                    padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: page >= Math.ceil(totalCount / pageSize) - 1 ? '#475569' : 'white', borderRadius: '10px', 
                    cursor: page >= Math.ceil(totalCount / pageSize) - 1 ? 'default' : 'pointer',
                    fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedLead && (
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '32px', alignSelf: 'start', position: 'sticky', top: '40px', animation: '0.4s ease-out 0s 1 normal none running slideIn' }}>
            <style>
              {`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}
            </style>
            
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', color: 'white', fontSize: '1.4rem', fontWeight: 800 }}>{selectedLead.name || 'Unnamed'}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedLead.email}</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155' }}></span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getStatusColor(selectedLead.status).text }}>{selectedLead.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ background: 'linear-gradient(145deg, #160a0f, #0a0a0a)', border: '1px solid rgba(233, 30, 99, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>Quick Notes</h4>
              </div>
              {selectedLead.notes && <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' }}>{selectedLead.notes}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder={selectedLead.notes ? "Update note..." : "Add a note..."} 
                  value={newNote} 
                  onChange={e => setNewNote(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && addComment(selectedLead, newNote)}
                  style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
                <button 
                  onClick={() => addComment(selectedLead, newNote)}
                  disabled={!newNote.trim() || isActionLoading}
                  style={{ padding: '10px 16px', background: newNote.trim() ? '#e91e63' : 'rgba(233, 30, 99, 0.2)', border: 'none', color: 'white', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: newNote.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                >
                  Save
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Timeline</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '10px' }}>{history.length} events</span>
              </h4>
              <div style={{ display: 'grid', gap: 0, maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {history.map((item, idx) => (
                  <div key={item.id} style={{ display: 'flex', gap: '20px', position: 'relative', paddingBottom: idx === history.length - 1 ? '0' : '24px' }}>
                    {idx !== history.length - 1 && <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: 0, width: '2px', background: 'rgba(255, 255, 255, 0.05)' }} />}
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.event_type === 'call' ? '#e91e63' : item.event_type === 'status_change' ? '#3b82f6' : '#10b981', zIndex: 1, marginTop: '4px', flexShrink: 0, boxShadow: item.event_type === 'call' ? '0 0 10px rgba(233, 30, 99, 0.3)' : 'none' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <p style={{ margin: 0, color: 'white', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.content}</p>
                        <button onClick={() => deleteHistoryItem(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>{new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '24px' }}>
              <button onClick={() => logCall(selectedLead)} style={{ flex: 1, padding: '14px', background: '#e91e63', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Log Call
              </button>
              <button onClick={() => deleteLead(selectedLead)} style={{ padding: '14px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 24px', color: 'white', fontSize: '1.4rem' }}>Import CSV</h2>
            
            <input type="text" placeholder="Apply Industry to all..." value={importIndustry} onChange={e => setImportIndustry(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', marginBottom: '16px', boxSizing: 'border-box' }} />
            <input type="text" placeholder="Apply Tags (comma separated)..." value={importTags} onChange={e => setImportTags(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', marginBottom: '24px', boxSizing: 'border-box' }} />
            
            <div 
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#e91e63' }}
              onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; handleFileUpload(e.dataTransfer.files[0]) }}
              style={{ border: '2px dashed rgba(255,255,255,0.2)', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#94A3B8', cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s' }}
              onClick={() => document.getElementById('csvUploadInput').click()}
            >
              {isImporting ? 'Importing...' : 'Drag & Drop CSV or Click here'}
              <input id="csvUploadInput" type="file" accept=".csv" onChange={e => handleFileUpload(e.target.files[0])} style={{ display: 'none' }} disabled={isImporting} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowImportModal(false)} style={{ padding: '10px 20px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
