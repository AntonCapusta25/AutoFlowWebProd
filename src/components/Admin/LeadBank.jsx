import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdmin } from './AdminContext'

export default function LeadBank({ filters = {}, title = "Lead Bank", subtitle = "Manage your leads." }) {
  const { user, isAdmin, profile, salespeople } = useAdmin()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [history, setHistory] = useState([])
  const [isImporting, setIsImporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [noteModalLead, setNoteModalLead] = useState(null)
  const [callModalLead, setCallModalLead] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [activeIndustries, setActiveIndustries] = useState([])
  const [tableIndustryFilter, setTableIndustryFilter] = useState('')
  const [tableTagFilter, setTableTagFilter] = useState('')
  const [dbIndustries, setDbIndustries] = useState([])
  const [dbTags, setDbTags] = useState([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [importIndustry, setImportIndustry] = useState('')
  const [importTags, setImportTags] = useState('')
  const [importAssignee, setImportAssignee] = useState('')
  const [newNote, setNewNote] = useState('')
  const [emailSentFor, setEmailSentFor] = useState(null)
  const [customEmailLead, setCustomEmailLead] = useState(null)
  const [customEmailSubject, setCustomEmailSubject] = useState('')
  const [customEmailBody, setCustomEmailBody] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  const [bookingLead, setBookingLead] = useState(null)
  const [bookingTitle, setBookingTitle] = useState('')
  const [bookingStartTime, setBookingStartTime] = useState('')
  const [bookingDuration, setBookingDuration] = useState(30)
  const [bookingSending, setBookingSending] = useState(false)
  const pageSize = 50

  useEffect(() => {
    setCustomEmailLead(null)
    setBookingLead(null)
  }, [selectedLead])

  useEffect(() => {
    if (bookingLead) {
      setBookingTitle(`Strategy session with ${bookingLead.name || bookingLead.email || 'Client'}`)
      setBookingStartTime('')
      setBookingDuration(30)
    }
  }, [bookingLead])

  const statusOptions = [
    { label: 'All' },
    { label: 'New' },
    { label: 'Contacted' },
    { label: 'In Progress' },
    { label: 'Meeting Booked' },
    { label: 'Waiting for Invoice' },
    { label: 'No Response' },
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

      // Apply Assignee Filter
      if (isAdmin) {
        if (assigneeFilter === 'unassigned') {
          query = query.is('assignee_id', null)
        } else if (assigneeFilter !== 'all') {
          query = query.eq('assignee_id', assigneeFilter)
        }
      } else {
        if (user?.id) {
          query = query.eq('assignee_id', user.id)
        } else {
          // Fallback: don't load any leads if user is not resolved yet
          query = query.eq('assignee_id', '00000000-0000-0000-0000-000000000000')
        }
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
  }, [searchTerm, statusFilter, assigneeFilter, tableIndustryFilter, tableTagFilter, JSON.stringify(filters), user])

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

      // ── Email trigger ──
      try {
        const { data: tmpl } = await supabase
          .from('email_templates')
          .select('subject, body, enabled')
          .eq('status', newStatus)
          .single()

        if (tmpl?.enabled && tmpl.subject && tmpl.body) {
          const lead = leads.find(l => l.id === id)
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'status_change',
              recipient: lead?.email || '',
              name:      lead?.name    || 'there',
              company:   lead?.company || '',
              service:   lead?.industry || '',
              status:    newStatus,
              subject:   tmpl.subject,
              body:      tmpl.body,
            }
          })
          setEmailSentFor(id)
          setTimeout(() => setEmailSentFor(null), 3000)
        }
      } catch (emailErr) {
        console.warn('Email send skipped:', emailErr.message)
      }

      // ── Auto-create deal when Meeting Booked ──
      if (newStatus === 'Meeting Booked') {
        try {
          const { data: existing } = await supabase
            .from('deals')
            .select('id')
            .eq('lead_id', id)
            .maybeSingle()

          if (!existing) {
            const lead = leads.find(l => l.id === id) || selectedLead
            const assigneeId = lead?.assignee_id || user?.id || null
            const assigneeProf = salespeople?.find(sp => sp.id === assigneeId) || (assigneeId === user?.id ? profile : null)
            const spName = assigneeProf?.name || assigneeProf?.email?.split('@')[0] || 'Unknown'
            await supabase.from('deals').insert({
              lead_id: id,
              lead_type: 'outreach',
              lead_name: lead?.name || lead?.email || 'Unknown',
              lead_email: lead?.email || null,
              lead_company: lead?.company || null,
              salesperson_id: assigneeId,
              salesperson_name: spName,
              status: 'pipeline'
            })
          }
        } catch (dealErr) {
          console.warn('Deal auto-create skipped:', dealErr.message)
        }
      }
    }
    setIsActionLoading(false)
  }

  async function sendManualEmail(lead, statusKey) {
    if (emailSending) return
    setEmailSending(true)
    try {
      const { data: tmpl } = await supabase
        .from('email_templates')
        .select('subject, body, enabled')
        .eq('status', statusKey)
        .single()

      if (!tmpl) {
        alert(`No template found for status: ${statusKey}`)
        return
      }

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'status_change',
          recipient: lead.email,
          name:      lead.name || 'there',
          company:   lead.company || '',
          service:   lead.industry || '',
          status:    statusKey,
          subject:   tmpl.subject,
          body:      tmpl.body,
        }
      })

      if (error) throw error

      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: 'outreach',
        event_type: 'email_sent',
        content: `Manual email sent: "${tmpl.subject}" (Template: ${statusKey})`
      })

      if (selectedLead?.id === lead.id) fetchUnifiedHistory(lead.id)

      setEmailSentFor(lead.id)
      setTimeout(() => setEmailSentFor(null), 3000)
    } finally {
      setEmailSending(false)
    }
  }

  function openCustomEmailModal(lead) {
    setCustomEmailLead(lead)
    setCustomEmailSubject('')
    setCustomEmailBody('')
    setSelectedTemplate('')
  }

  async function handleBookAppointment() {
    if (!bookingStartTime) {
      alert('Please select a start date and time.')
      return
    }
    
    setBookingSending(true)
    try {
      const startLocal = new Date(bookingStartTime)
      const endLocal = new Date(startLocal.getTime() + bookingDuration * 60000)
      
      const schedulingAdmin = profile?.name || profile?.email || ''
      const colorId = schedulingAdmin.toLowerCase().includes('mzi') ? '11' : '1'
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'schedule_call',
          leadEmail: bookingLead.email,
          leadName: bookingLead.name || 'there',
          startTime: startLocal.toISOString(),
          endTime: endLocal.toISOString(),
          title: bookingTitle || `Strategy session with ${bookingLead.name || 'Client'}`,
          description: `Meeting scheduled by ${schedulingAdmin} via CRM.`,
          colorId: colorId
        }
      })
      
      if (error) throw error
      
      // Update status to 'Meeting Booked'
      await updateStatus(bookingLead.id, 'Meeting Booked')
      
      // Log event to lead history
      await supabase.from('lead_history').insert({
        lead_id: bookingLead.id,
        lead_type: 'outreach',
        event_type: 'call',
        content: `Google Calendar appointment booked: "${bookingTitle}" on ${startLocal.toLocaleString()}`
      })
      
      if (selectedLead?.id === bookingLead.id) {
        fetchUnifiedHistory(bookingLead.id)
      }
      
      setBookingLead(null)
      alert('Appointment booked successfully on Google Calendar!')
    } catch (err) {
      console.error('Failed to book appointment:', err)
      alert('Error booking appointment: ' + err.message)
    } finally {
      setBookingSending(false)
    }
  }

  async function handleTemplateChange(templateKey) {
    setSelectedTemplate(templateKey)
    if (!templateKey) {
      setCustomEmailSubject('')
      setCustomEmailBody('')
      return
    }
    
    try {
      const { data: tmpl } = await supabase
        .from('email_templates')
        .select('subject, body')
        .eq('status', templateKey)
        .single()
        
      if (tmpl) {
        const vars = {
          name: customEmailLead.name || 'there',
          status: templateKey,
          company: customEmailLead.company || '',
          service: customEmailLead.industry || customEmailLead.service || ''
        }
        
        const interpolateVars = (str) => {
          return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
        }
        
        setCustomEmailSubject(interpolateVars(tmpl.subject || ''))
        setCustomEmailBody(interpolateVars(tmpl.body || ''))
      }
    } catch (err) {
      console.error('Failed to load template:', err)
    }
  }

  async function logCall(lead, noteContent) {
    if (isActionLoading) return
    setIsActionLoading(true)
    const newCount = (lead.call_attempts || 0) + 1
    
    const updatePayload = { call_attempts: newCount }
    if (noteContent) updatePayload.notes = noteContent

    const { error } = await supabase.from('outreach_leads').update(updatePayload).eq('id', lead.id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, call_attempts: newCount, ...(noteContent ? { notes: noteContent } : {}) } : l))
      if (selectedLead?.id === lead.id) setSelectedLead(prev => ({ ...prev, call_attempts: newCount, ...(noteContent ? { notes: noteContent } : {}) }))

      const finalContent = noteContent 
        ? `Call attempt #${newCount}: ${noteContent}`
        : `Call attempt #${newCount} to ${lead.name || lead.email}`

      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: 'outreach',
        event_type: 'call',
        content: finalContent
      })
      if (selectedLead?.id === lead.id) fetchUnifiedHistory(lead.id)
    }
    setIsActionLoading(false)
  }

  async function submitToDeal(lead) {
    if (isActionLoading) return
    // Check if deal already exists for this lead
    const { data: existing } = await supabase.from('deals').select('id').eq('lead_id', lead.id).maybeSingle()
    if (existing) {
      alert('This lead is already in the pipeline.')
      return
    }
    setIsActionLoading(true)
    const spName = profile?.name || profile?.email?.split('@')[0] || 'Unknown'
    const { error } = await supabase.from('deals').insert({
      lead_id: lead.id,
      lead_type: 'outreach',
      lead_name: lead.name || lead.email || 'Unknown',
      lead_email: lead.email || null,
      lead_company: lead.company || null,
      salesperson_id: user?.id || null,
      salesperson_name: spName,
      status: 'pipeline'
    })
    if (!error) {
      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: 'outreach',
        event_type: 'status_change',
        content: `Submitted to deals pipeline by ${spName}`
      })
      if (selectedLead?.id === lead.id) fetchUnifiedHistory(lead.id)
      alert('✅ Lead submitted to the deals pipeline!')
    } else {
      alert('Error submitting deal: ' + error.message)
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
      case 'Meeting Booked': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.2)' }
      case 'Waiting for Invoice': return { bg: 'rgba(6, 182, 212, 0.1)', text: '#67e8f9', border: '1px solid rgba(6, 182, 212, 0.2)' }
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
    if (!confirm('Permanently delete this outbound lead?')) return
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
    console.log('[CSV Import] Started for file:', file.name, 'size:', file.size, 'bytes')
    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
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

        console.log('[CSV Import] Parsing CSV text...')
        const rows = parseCSV(csvData)
        console.log('[CSV Import] Parsed rows count:', rows.length)
        
        if (rows.length < 2) {
          console.warn('[CSV Import] File has less than 2 rows. Aborting.')
          setIsImporting(false)
          setTimeout(() => {
            alert('CSV file is empty or has no data rows.')
          }, 50)
          return
        }

        const headers = rows[0].map(h => h.trim().toLowerCase())
        console.log('[CSV Import] Headers found:', headers)
        const newLeads = []
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i]
          if (!values.some(v => v.trim())) continue
          const lead = {
            email: null,
            name: null,
            company: null,
            website: null,
            linkedin: null,
            industry: null,
            location: null,
            phone: null,
            status: 'New',
            tags: [],
            metadata: {},
            assignee_id: null
          }
          headers.forEach((header, index) => {
            let val = values[index]?.replace(/^["']|["']$/g, '').trim()
            if (!val) return
            if (header.includes('email')) {
              const emails = val.split(',').map(e => e.trim()).filter(Boolean)
              if (emails.length > 0) {
                lead.email = emails[0].toLowerCase()
                if (emails.length > 1) {
                  lead.metadata = {
                    ...lead.metadata,
                    additional_emails: emails.slice(1).map(e => e.toLowerCase())
                  }
                }
              }
            }
            if (header.includes('name')) lead.name = val
            if (header.includes('company')) lead.company = val
            if (header.includes('website') || (header.includes('url') && !header.includes('maps') && !header.includes('google'))) lead.website = val
            if (header.includes('linkedin')) lead.linkedin = val
            if (header.includes('industry')) lead.industry = val
            if (header.includes('location')) lead.location = val
            if (header.includes('phone') || header.includes('tel')) lead.phone = val
          })
          
          if (lead.email) {
            if (!lead.industry && importIndustry) {
              lead.industry = importIndustry
            }
            if (importTags) {
              const extraTags = importTags.split(',').map(t => t.trim()).filter(Boolean)
              lead.tags = extraTags
            }
            if (importAssignee) {
              lead.assignee_id = importAssignee
            }
            newLeads.push(lead)
          }
        }

        console.log('[CSV Import] Parsed valid leads with email:', newLeads.length)

        if (newLeads.length > 0) {
          const emailsToImport = [...new Set(newLeads.map(l => l.email))]
          console.log('[CSV Import] Unique emails to check duplicates for:', emailsToImport.length)
          
          const existingEmails = new Set()
          for (let i = 0; i < emailsToImport.length; i += 1000) {
            const chunk = emailsToImport.slice(i, i + 1000)
            console.log(`[CSV Import] Fetching existing emails chunk ${i} to ${i + chunk.length}...`)
            const { data, error } = await supabase.from('outreach_leads').select('email').in('email', chunk)
            if (error) {
              console.error('[CSV Import] Error fetching duplicates chunk:', error)
            }
            if (data) {
              data.forEach(d => existingEmails.add(d.email.toLowerCase()))
            }
          }
          console.log('[CSV Import] Existing duplicates found in DB:', existingEmails.size)

          const uniqueLeads = newLeads.filter(l => !existingEmails.has(l.email))
          const duplicateCount = newLeads.length - uniqueLeads.length
          console.log('[CSV Import] Unique leads to insert after duplicate filtering:', uniqueLeads.length)

          if (uniqueLeads.length > 0) {
            let addedCount = 0
            let lastError = null
            const batchSize = 100
            const totalBatches = Math.ceil(uniqueLeads.length / batchSize)
            
            for (let i = 0; i < uniqueLeads.length; i += batchSize) {
              const batch = uniqueLeads.slice(i, i + batchSize)
              const batchIndex = Math.floor(i / batchSize) + 1
              console.log(`[CSV Import] Inserting batch ${batchIndex}/${totalBatches} of size ${batch.length}...`)
              
              const { error } = await supabase.from('outreach_leads').insert(batch)
              if (error) {
                console.error(`[CSV Import] Database error in batch ${batchIndex}:`, error)
                lastError = error
                break
              }
              addedCount += batch.length
              console.log(`[CSV Import] Successfully inserted batch ${batchIndex}. Progress: ${addedCount}/${uniqueLeads.length}`)
            }

            console.log('[CSV Import] Insertion completed. Total added:', addedCount, 'Error:', lastError?.message || 'none')

            setIsImporting(false)
            setShowImportModal(false)
            fetchLeads()

            if (!lastError) {
              setTimeout(() => {
                alert(`Import Successful!\nAdded: ${addedCount} new leads.\nSkipped: ${duplicateCount} duplicates.`)
              }, 50)
            } else {
              setTimeout(() => {
                alert(`Import partially succeeded.\nAdded: ${addedCount} leads.\nError at batch: ${lastError.message}`)
              }, 50)
            }
          } else {
            console.log('[CSV Import] No unique leads to insert.')
            setIsImporting(false)
            setShowImportModal(false)
            setTimeout(() => {
              alert(`No new leads found. All ${newLeads.length} leads are already in the database.`)
            }, 50)
          }
        } else {
          console.log('[CSV Import] No leads with valid email found in file.')
          setIsImporting(false)
          setTimeout(() => {
            alert('No valid leads with emails found in the CSV.')
          }, 50)
        }
      } catch (err) {
        console.error('[CSV Import] Uncaught exception in import process:', err)
        setIsImporting(false)
        setTimeout(() => {
          alert('An error occurred during import: ' + err.message)
        }, 50)
      }
    }
    reader.onerror = (err) => {
      console.error('[CSV Import] FileReader error:', err)
      setIsImporting(false)
      setTimeout(() => {
        alert('Failed to read the file.')
      }, 50)
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

  async function handleAssignLead(leadId, assigneeId) {
    if (isActionLoading) return
    setIsActionLoading(true)
    const cleanAssigneeId = assigneeId === '' ? null : assigneeId
    const agent = salespeople.find(sp => sp.id === cleanAssigneeId)
    const agentName = agent ? (agent.name || agent.email) : 'Unassigned'

    const { error } = await supabase
      .from('outreach_leads')
      .update({ assignee_id: cleanAssigneeId })
      .eq('id', leadId)

    if (error) {
      alert('Failed to assign lead: ' + error.message)
    } else {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignee_id: cleanAssigneeId } : l))
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => ({ ...prev, assignee_id: cleanAssigneeId }))
      }
      await supabase.from('lead_history').insert({
        lead_id: leadId,
        lead_type: 'outreach',
        event_type: 'status_change',
        content: `Lead assigned to: ${agentName}`
      })
      if (selectedLead?.id === leadId) fetchUnifiedHistory(leadId)
    }
    setIsActionLoading(false)
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
      <style>{`
        @keyframes toastSlide { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      {emailSentFor && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
          background: '#031a0e', border: '1px solid rgba(16,185,129,0.4)',
          color: '#6ee7b7', padding: '14px 24px', borderRadius: '14px',
          fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)', animation: 'toastSlide 0.3s ease-out'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          Email sent to lead
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isAdmin && salespeople.length > 0 ? '16px' : '40px' }}>
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

      {isAdmin && salespeople.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '28px' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Filter by Agent:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[{ id: 'all', label: 'All Leads' }, { id: 'unassigned', label: 'Unassigned' }, ...salespeople.map(sp => ({ id: sp.id, label: sp.name || sp.email }))].map(opt => (
              <button
                key={opt.id}
                onClick={() => setAssigneeFilter(opt.id)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  border: assigneeFilter === opt.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  background: assigneeFilter === opt.id ? 'linear-gradient(135deg, #3b82f6, #10b981)' : 'rgba(255,255,255,0.03)',
                  color: assigneeFilter === opt.id ? 'white' : '#94A3B8',
                  boxShadow: assigneeFilter === opt.id ? '0 4px 15px rgba(59,130,246,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outbound Profile</th>
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
                {isAdmin && <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignee</th>}
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', position: 'sticky', right: 0, background: '#0a0a0a', zIndex: 10, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? '10' : '9'} style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading outbound leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={isAdmin ? '10' : '9'} style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No outbound leads match table filters.</td></tr>
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
                        value={lead.status === 'Scraped' ? 'New' : (lead.status || 'New')}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          background: getStatusColor(lead.status === 'Scraped' ? 'New' : (lead.status || 'New')).bg,
                          border: getStatusColor(lead.status === 'Scraped' ? 'New' : (lead.status || 'New')).border,
                          borderRadius: '10px',
                          color: getStatusColor(lead.status === 'Scraped' ? 'New' : (lead.status || 'New')).text,
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
                        <option value="Meeting Booked" style={{ background: '#0a0a0a', color: 'white' }}>Meeting Booked</option>
                        <option value="Waiting for Invoice" style={{ background: '#0a0a0a', color: 'white' }}>Waiting for Invoice</option>
                        <option value="No Response" style={{ background: '#0a0a0a', color: 'white' }}>No Response</option>
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
                    {isAdmin && (
                      <td style={{ padding: '20px' }}>
                        <select
                          value={lead.assignee_id || ''}
                          onChange={e => handleAssignLead(lead.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{
                            padding: '8px 12px', background: lead.assignee_id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                            border: lead.assignee_id ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px', color: lead.assignee_id ? '#93c5fd' : '#64748B',
                            fontSize: '0.8rem', fontWeight: 600, outline: 'none', cursor: 'pointer', maxWidth: '140px'
                          }}
                        >
                          <option value="" style={{ background: '#0a0a0a', color: '#94A3B8' }}>Unassigned</option>
                          {salespeople.map(sp => (
                            <option key={sp.id} value={sp.id} style={{ background: '#0a0a0a', color: 'white' }}>
                              {sp.name || sp.email}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td style={{ padding: '20px', textAlign: 'center', position: 'sticky', right: 0, background: selectedLead?.id === lead.id ? '#1a0b12' : '#0a0a0a', zIndex: 10, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => setCallModalLead(lead)} style={{ padding: '8px 12px', background: 'rgba(233, 30, 99, 0.08)', border: '1px solid rgba(233, 30, 99, 0.1)', color: '#e91e63', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getStatusColor(selectedLead.status === 'Scraped' ? 'New' : (selectedLead.status || 'New')).text }}>{selectedLead.status === 'Scraped' ? 'New' : (selectedLead.status || 'New')}</span>
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
                    <div style={{ 
                      width: '16px', height: '16px', borderRadius: '50%', 
                      background: item.event_type === 'call' ? '#e91e63' : item.event_type === 'status_change' ? '#3b82f6' : (item.event_type === 'email' || item.event_type === 'email_sent') ? '#a855f7' : '#10b981', 
                      zIndex: 1, marginTop: '4px', flexShrink: 0, 
                      boxShadow: item.event_type === 'call' ? '0 0 10px rgba(233, 30, 99, 0.3)' : (item.event_type === 'email' || item.event_type === 'email_sent') ? '0 0 10px rgba(168, 85, 247, 0.3)' : 'none' 
                    }} />
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
            
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setCallModalLead(selectedLead)} style={{ flex: 1, padding: '14px', background: '#e91e63', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  Log Call
                </button>

                <button 
                  onClick={() => openCustomEmailModal(selectedLead)} 
                  disabled={emailSending}
                  style={{ 
                    flex: 1, padding: '14px', 
                    background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', 
                    color: '#c084fc', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'
                  }}
                >
                  {emailSending ? (
                    <>
                      <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#c084fc', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Send Email
                    </>
                  )}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setBookingLead(selectedLead)} 
                  style={{ 
                    flex: 2, padding: '14px', 
                    background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', 
                    color: '#93c5fd', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Book Appointment
                </button>
                <button onClick={() => deleteLead(selectedLead)} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>

          </div>
        )}
      </div>

      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 24px', color: 'white', fontSize: '1.4rem' }}>Import CSV</h2>
            
            <input type="text" placeholder="Apply Industry to all..." value={importIndustry} onChange={e => setImportIndustry(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', marginBottom: '16px', boxSizing: 'border-box' }} />
            <input type="text" placeholder="Apply Tags (comma separated)..." value={importTags} onChange={e => setImportTags(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', marginBottom: '16px', boxSizing: 'border-box' }} />
            
            <select 
              value={importAssignee} 
              onChange={e => setImportAssignee(e.target.value)} 
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', marginBottom: '24px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
            >
              <option value="" style={{ background: '#0a0a0a', color: '#64748B' }}>-- Leave Unassigned --</option>
              {salespeople.map(sp => (
                <option key={sp.id} value={sp.id} style={{ background: '#0a0a0a', color: 'white' }}>
                  {sp.name || sp.email.split('@')[0]} ({sp.role})
                </option>
              ))}
            </select>
            
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
      {callModalLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>Log Call Details</h3>
              <button onClick={() => setCallModalLead(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <textarea 
              id="modal-call-input"
              autoFocus
              placeholder="How did the call go?"
              style={{ width: '100%', height: '120px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none', resize: 'none', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  const content = document.getElementById('modal-call-input').value
                  logCall(callModalLead, content)
                  setCallModalLead(null)
                }}
                style={{ flex: 1, padding: '12px', background: '#e91e63', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Log Call
              </button>
            </div>
          </div>
        </div>
      )}
      {customEmailLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '28px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 800 }}>Send Email to {customEmailLead.name || customEmailLead.email}</h3>
              <button onClick={() => setCustomEmailLead(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Load Template */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Load Template
              </label>
              <select
                value={selectedTemplate}
                onChange={e => handleTemplateChange(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#111' }}>-- Custom / Blank --</option>
                {[
                  { key: 'New', label: 'New Lead' },
                  { key: 'Contacted', label: 'Contacted' },
                  { key: 'In Progress', label: 'In Progress' },
                  { key: 'Meeting Booked', label: 'Meeting Booked' },
                  { key: 'Waiting for Invoice', label: 'Waiting for Invoice' },
                  { key: 'No Response', label: 'No Response' },
                  { key: 'Converted', label: 'Converted' },
                  { key: 'Lost', label: 'Lost' },
                ].map(opt => (
                  <option key={opt.key} value={opt.key} style={{ background: '#111' }}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Subject
              </label>
              <input
                type="text"
                value={customEmailSubject}
                onChange={e => setCustomEmailSubject(e.target.value)}
                placeholder="Enter email subject..."
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Body */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Email Body (HTML supported)
              </label>
              <textarea
                value={customEmailBody}
                onChange={e => setCustomEmailBody(e.target.value)}
                placeholder="Type your message here..."
                style={{ width: '100%', height: '180px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none', resize: 'none', fontSize: '0.95rem', lineHeight: '1.5', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setCustomEmailLead(null)}
                style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!customEmailSubject.trim() || !customEmailBody.trim()) {
                    alert('Please enter a subject and a body.')
                    return
                  }
                  
                  setEmailSending(true)
                  try {
                    const { error } = await supabase.functions.invoke('send-email', {
                      body: {
                        type: 'status_change',
                        recipient: customEmailLead.email,
                        name:      customEmailLead.name || 'there',
                        company:   customEmailLead.company || '',
                        service:   customEmailLead.industry || customEmailLead.service || '',
                        status:    selectedTemplate || 'Custom',
                        subject:   customEmailSubject,
                        body:      customEmailBody,
                      }
                    })

                    if (error) throw error

                    await supabase.from('lead_history').insert({
                      lead_id: customEmailLead.id,
                      lead_type: 'outreach',
                      event_type: 'email_sent',
                      content: `Manual email sent: "${customEmailSubject}"`
                    })

                    if (selectedLead?.id === customEmailLead.id) {
                      fetchUnifiedHistory(customEmailLead.id)
                    }

                    setEmailSentFor(customEmailLead.id)
                    setTimeout(() => setEmailSentFor(null), 3000)
                    setCustomEmailLead(null)
                  } catch (err) {
                    console.error('Failed to send custom email:', err)
                    alert('Error sending email: ' + err.message)
                  } finally {
                    setEmailSending(false)
                  }
                }}
                disabled={emailSending}
                style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #e91e63, #9c27b0)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {emailSending ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Sending…
                  </>
                ) : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '28px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 800 }}>Book Appointment</h3>
              <button onClick={() => setBookingLead(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Client Info */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 4px', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</p>
              <p style={{ margin: '0 0 8px', color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{bookingLead.name || 'Unnamed'}</p>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{bookingLead.email}</p>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Meeting Title
              </label>
              <input
                type="text"
                value={bookingTitle}
                onChange={e => setBookingTitle(e.target.value)}
                placeholder="Strategy session..."
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Date & Time */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Date & Start Time
              </label>
              <input
                type="datetime-local"
                value={bookingStartTime}
                onChange={e => setBookingStartTime(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Duration */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Duration
              </label>
              <select
                value={bookingDuration}
                onChange={e => setBookingDuration(parseInt(e.target.value))}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', cursor: 'pointer' }}
              >
                <option value="15" style={{ background: '#111' }}>15 Minutes</option>
                <option value="30" style={{ background: '#111' }}>30 Minutes</option>
                <option value="45" style={{ background: '#111' }}>45 Minutes</option>
                <option value="60" style={{ background: '#111' }}>1 Hour</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setBookingLead(null)}
                style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleBookAppointment}
                disabled={bookingSending || !bookingStartTime}
                style={{ 
                  flex: 1, padding: '14px', 
                  background: 'linear-gradient(135deg, #3b82f6, #10b981)', 
                  border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                }}
              >
                {bookingSending ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Booking…
                  </>
                ) : 'Book Call'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
