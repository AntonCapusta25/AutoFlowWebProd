import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'
import useSessionState from '../../hooks/useSessionState'

export default function AdminLeads() {
  const { user, isAdmin, profile, salespeople } = useAdmin()
  const stateKey = useMemo(() => window.location.pathname, [])
  const [assigneeFilter, setAssigneeFilter] = useSessionState(`${stateKey}_assigneeFilter`, 'all')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useSessionState(`${stateKey}_selectedLead`, null)
  const [history, setHistory] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [noteModalLead, setNoteModalLead] = useState(null)
  const [callModalLead, setCallModalLead] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [assigneeFilter, isAdmin, user])

  useEffect(() => {
    if (selectedLead) {
      fetchHistory(selectedLead.id)
    }
  }, [selectedLead])

  async function fetchLeads() {
    setLoading(true)

    let bookingsQuery = supabase.from('booking_leads').select('*')
    let contactsQuery = supabase.from('contact_leads').select('*')

    if (isAdmin) {
      if (assigneeFilter === 'unassigned') {
        bookingsQuery = bookingsQuery.is('assignee_id', null)
        contactsQuery = contactsQuery.is('assignee_id', null)
      } else if (assigneeFilter !== 'all') {
        bookingsQuery = bookingsQuery.eq('assignee_id', assigneeFilter)
        contactsQuery = contactsQuery.eq('assignee_id', assigneeFilter)
      }
    } else {
      if (user?.id) {
        bookingsQuery = bookingsQuery.eq('assignee_id', user.id)
        contactsQuery = contactsQuery.eq('assignee_id', user.id)
      } else {
        // Fallback: don't load any leads if user is not resolved yet
        bookingsQuery = bookingsQuery.eq('assignee_id', '00000000-0000-0000-0000-000000000000')
        contactsQuery = contactsQuery.eq('assignee_id', '00000000-0000-0000-0000-000000000000')
      }
    }

    const [bookings, contacts] = await Promise.all([
      bookingsQuery.order('created_at', { ascending: false }),
      contactsQuery.order('created_at', { ascending: false })
    ])

    const combined = [
      ...(bookings.data || []).map(l => ({ ...l, type: 'Booking' })),
      ...(contacts.data || []).map(l => ({ ...l, type: 'Contact' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const uniqueLeads = Array.from(new Map(combined.map(item => [item.id, item])).values())

    setLeads(uniqueLeads)
    setLoading(false)
  }

  async function handleAssignLead(leadId, leadType, assigneeId) {
    if (isActionLoading) return
    setIsActionLoading(true)
    const table = leadType.toLowerCase() === 'booking' ? 'booking_leads' : 'contact_leads'
    const cleanAssigneeId = assigneeId === '' ? null : assigneeId

    const agent = salespeople.find(sp => sp.id === cleanAssigneeId)
    const agentName = agent ? (agent.name || agent.email) : 'Unassigned'

    const { error } = await supabase
      .from(table)
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
        lead_type: leadType.toLowerCase(),
        event_type: 'status_change',
        content: `Lead assigned to: ${agentName}`,
        admin_id: user?.id
      })

      if (selectedLead?.id === leadId) {
        fetchHistory(leadId)
      }
    }
    setIsActionLoading(false)
  }

  async function fetchHistory(leadId) {
    const { data } = await supabase
      .from('lead_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    setHistory(data || [])
  }

  const [emailSentFor, setEmailSentFor] = useState(null) // lead id that just got an email
  const [customEmailLead, setCustomEmailLead] = useState(null)
  const [customEmailSubject, setCustomEmailSubject] = useState('')
  const [customEmailBody, setCustomEmailBody] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  const [bookingLead, setBookingLead] = useState(null)
  const [bookingTitle, setBookingTitle] = useState('')
  const [bookingSending, setBookingSending] = useState(false)
  const [busyTimes, setBusyTimes] = useState([])
  const [calendarTimeZone, setCalendarTimeZone] = useState('UTC')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedDayOffset, setSelectedDayOffset] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingDescription, setBookingDescription] = useState('Strategy session scheduled via CRM.')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    setCustomEmailLead(null)
    setBookingLead(null)
  }, [selectedLead])

  useEffect(() => {
    if (bookingLead) {
      setBookingTitle(`Strategy session with ${bookingLead.name || bookingLead.email || 'Client'}`)
      setSelectedSlot(null)
      setSelectedDayOffset(0)
      setBookingDescription('Strategy session scheduled via CRM.')
      setBookingSuccess(false)
      setBookingError('')
      
      const fetchAvailability = async () => {
        setLoadingSlots(true)
        setBusyTimes([])
        try {
          const timeMin = new Date()
          timeMin.setHours(0,0,0,0)
          const timeMax = new Date()
          timeMax.setDate(timeMax.getDate() + 10)
          timeMax.setHours(23,59,59,999)

          const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
              type: 'get_busy_times',
              timeMin: timeMin.toISOString(),
              timeMax: timeMax.toISOString()
            }
          })

          if (error) throw error
          if (data && data.success) {
            setBusyTimes(data.busy || [])
            setCalendarTimeZone(data.timeZone || 'UTC')
          }
        } catch (err) {
          console.error('Failed to load slots:', err)
        } finally {
          setLoadingSlots(false)
        }
      }
      fetchAvailability()
    }
  }, [bookingLead])

  async function updateStatus(id, type, newStatus) {
    if (isActionLoading) return
    setIsActionLoading(true)
    const table = type.toLowerCase() === 'booking' ? 'booking_leads' : 'contact_leads'
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
      if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, status: newStatus }))

      await supabase.from('lead_history').insert({
        lead_id: id,
        lead_type: type.toLowerCase() === 'booking' ? 'booking' : 'contact',
        event_type: 'status_change',
        content: `Status updated to ${newStatus}`,
        admin_id: user?.id
      })
      if (selectedLead?.id === id) fetchHistory(id)

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
              name: lead?.name || '',
              company: lead?.company || '',
              service: lead?.service || '',
              status: newStatus,
              subject: tmpl.subject,
              body: tmpl.body,
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
              lead_type: type.toLowerCase() === 'booking' ? 'booking' : 'contact',
              lead_name: lead?.name || lead?.email || 'Unknown',
              lead_email: lead?.email || null,
              lead_company: lead?.company || null,
              salesperson_id: assigneeId,
              salesperson_name: spName,
              status: 'pipeline'
            })
          }
        } catch (dealErr) {
          console.warn('Deal auto-create failed:', dealErr.message)
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
          name: lead.name,
          company: lead.company || '',
          service: lead.service || '',
          status: statusKey,
          subject: tmpl.subject,
          body: tmpl.body,
        }
      })

      if (error) throw error

      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: lead.type.toLowerCase() === 'booking' ? 'booking' : 'contact',
        event_type: 'email_sent',
        content: `Manual email sent: "${tmpl.subject}" (Template: ${statusKey})`,
        admin_id: user?.id
      })

      if (selectedLead?.id === lead.id) fetchHistory(lead.id)

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
    if (!selectedSlot) {
      setBookingError('Please select a time slot on the calendar.')
      return
    }

    setBookingSending(true)
    setBookingError('')
    try {
      const startLocal = selectedSlot.start
      const endLocal = selectedSlot.end

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
          description: bookingDescription || `Meeting scheduled by ${schedulingAdmin} via CRM.`,
          colorId: colorId,
          agentName: schedulingAdmin
        }
      })

      if (error) throw error

      // Update status to 'Meeting Booked'
      await updateStatus(bookingLead.id, bookingLead.type, 'Meeting Booked')

      // Log event
      await supabase.from('lead_history').insert({
        lead_id: bookingLead.id,
        lead_type: bookingLead.type.toLowerCase() === 'booking' ? 'booking' : 'contact',
        event_type: 'call',
        content: `Google Calendar appointment booked: "${bookingTitle}" on ${startLocal.toLocaleString()}`,
        admin_id: user?.id
      })

      if (selectedLead?.id === bookingLead.id) {
        fetchHistory(bookingLead.id)
      }

      setBookingSuccess(true)
      setTimeout(() => {
        setBookingLead(null)
        setBookingSuccess(false)
      }, 2500)
    } catch (err) {
      console.error('Failed to book appointment:', err)
      setBookingError(err.message || 'Failed to book appointment')
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
          service: customEmailLead.service || ''
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

  async function addComment(lead, content) {
    if (!content.trim() || isActionLoading) return
    setIsActionLoading(true)
    const table = lead.type === 'Booking' ? 'booking_leads' : 'contact_leads'
    const [historyRes, leadRes] = await Promise.all([
      supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: lead.type.toLowerCase(),
        event_type: 'note',
        content: content,
        admin_id: user?.id
      }),
      supabase.from(table).update({ notes: content }).eq('id', lead.id)
    ])
    if (!historyRes.error && !leadRes.error) {
      if (selectedLead?.id === lead.id) fetchHistory(lead.id)
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, notes: content } : l))
      if (selectedLead?.id === lead.id) setSelectedLead(prev => ({ ...prev, notes: content }))
    }
    setIsActionLoading(false)
  }

  async function logCall(lead, noteContent) {
    if (isActionLoading) return
    setIsActionLoading(true)
    const table = lead.type === 'Booking' ? 'booking_leads' : 'contact_leads'
    const newCount = (lead.call_attempts || 0) + 1

    const updatePayload = { call_attempts: newCount }
    if (noteContent) updatePayload.notes = noteContent

    const { error } = await supabase.from(table).update(updatePayload).eq('id', lead.id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, call_attempts: newCount, ...(noteContent ? { notes: noteContent } : {}) } : l))
      if (selectedLead?.id === lead.id) setSelectedLead(prev => ({ ...prev, call_attempts: newCount, ...(noteContent ? { notes: noteContent } : {}) }))

      const finalContent = noteContent
        ? `Call attempt #${newCount}: ${noteContent}`
        : `Call attempt #${newCount} to ${lead.name}`

      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        lead_type: lead.type.toLowerCase(),
        event_type: 'call',
        content: finalContent,
        admin_id: user?.id
      })
      if (selectedLead?.id === lead.id) fetchHistory(lead.id)
    }
    setIsActionLoading(false)
  }

  async function deleteHistoryItem(id) {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('lead_history').delete().eq('id', id)
    if (!error) {
      setHistory(prev => prev.filter(item => item.id !== id))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return { bg: 'rgba(233, 30, 99, 0.1)', text: '#f472b6', border: 'rgba(233, 30, 99, 0.2)', color: '#f472b6' }
      case 'Contacted': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }
      case 'In Progress': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }
      case 'Meeting Booked': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }
      case 'Waiting for Invoice': return { bg: 'rgba(6, 182, 212, 0.1)', text: '#67e8f9', border: 'rgba(6, 182, 212, 0.2)', color: '#67e8f9' }
      case 'Converted': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }
      case 'Lost': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }
      case 'No Response': return { bg: 'rgba(100, 116, 139, 0.1)', text: '#94a3b8', border: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' }
      default: return { bg: 'rgba(255,255,255,0.05)', text: '#94A3B8', border: 'rgba(255,255,255,0.1)', color: '#94A3B8' }
    }
  }

  async function deleteLead(lead) {
    if (!confirm('Are you sure you want to PERMANENTLY delete this lead?')) return
    const table = lead.type.toLowerCase() === 'booking' ? 'booking_leads' : 'contact_leads'
    const { error } = await supabase.from(table).delete().eq('id', lead.id)
    if (error) {
      console.error('Delete error:', error)
      alert('Error deleting lead: ' + error.message)
    } else {
      setLeads(prev => prev.filter(l => l.id !== lead.id))
      if (selectedLead?.id === lead.id) setSelectedLead(null)
    }
  }

  async function batchDelete() {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) return

    const toDelete = leads.filter(l => selectedIds.includes(l.id))
    const bookings = toDelete.filter(l => l.type.toLowerCase() === 'booking').map(l => l.id)
    const contacts = toDelete.filter(l => l.type.toLowerCase() === 'contact').map(l => l.id)

    try {
      if (bookings.length) {
        const { error } = await supabase.from('booking_leads').delete().in('id', bookings)
        if (error) throw error
      }
      if (contacts.length) {
        const { error } = await supabase.from('contact_leads').delete().in('id', contacts)
        if (error) throw error
      }

      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)))
      setSelectedIds([])
      if (selectedLead && selectedIds.includes(selectedLead.id)) setSelectedLead(null)
    } catch (err) {
      console.error('Batch delete failed:', err)
      alert('Error during batch delete: ' + err.message)
    }
  }

  function toggleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <AdminLayout>
      <style>{`
        @keyframes toastSlide { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .leads-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; gap: 16px; }
        .leads-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .leads-grid { display: grid; gap: 24px; transition: all 0.4s; grid-template-columns: 1fr; }
        .leads-grid.has-selection { grid-template-columns: 1fr 480px; }
        .lead-detail-panel { background: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 32px; align-self: start; position: sticky; top: 40px; animation: 0.4s ease-out 0s 1 normal none running slideIn; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 1024px) { .leads-grid.has-selection { grid-template-columns: 1fr 340px; } }
        @media (max-width: 768px) {
          .leads-header { flex-direction: column; align-items: stretch; }
          .leads-actions { margin-top: 16px; justify-content: space-between; }
          .leads-grid.has-selection { grid-template-columns: 1fr; }
          .lead-table-container { display: block; }
          .leads-grid.has-selection .lead-table-container { display: none; }
          .lead-detail-panel { position: fixed; top: 70px; left: 0; width: 100vw; height: calc(100vh - 70px); z-index: 10000; border-radius: 0; overflow-y: auto; }
        }
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
          </svg>
          Email sent to lead
        </div>
      )}

      <div className="leads-header">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>CRM / Leads</h1>
          <p style={{ color: '#94A3B8' }}>Manage your relationship with potential clients.</p>
        </div>
        <div className="leads-actions">
          {selectedIds.length > 0 && (
            <button onClick={batchDelete} style={{ padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button onClick={() => fetchLeads()} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Refresh</button>
        </div>
      </div>

      {isAdmin && salespeople.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Filter by Agent:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[{ id: 'all', label: 'All Leads' }, { id: 'unassigned', label: 'Unassigned' }, ...salespeople.map(sp => ({ id: sp.id, label: sp.name || sp.email }))].map(opt => (
              <button
                key={opt.id}
                onClick={() => setAssigneeFilter(opt.id)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  border: assigneeFilter === opt.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  background: assigneeFilter === opt.id ? 'linear-gradient(135deg, #e91e63, #9c27b0)' : 'rgba(255,255,255,0.03)',
                  color: assigneeFilter === opt.id ? 'white' : '#94A3B8',
                  boxShadow: assigneeFilter === opt.id ? '0 4px 15px rgba(233,30,99,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`leads-grid ${selectedLead ? 'has-selection' : ''}`}>
        <div className="lead-table-container" style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', overflowX: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '24px 20px', width: '40px' }}>
                  <input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? leads.map(l => l.id) : [])} checked={selectedIds.length === leads.length && leads.length > 0} />
                </th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead Profile</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                {isAdmin && <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignee</th>}
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Initial Problem</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Notes</th>
                <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', position: 'sticky', right: 0, background: '#0a0a0a', zIndex: 10, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? '9' : '8'} style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading inbound leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={isAdmin ? '9' : '8'} style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No leads found.</td></tr>
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
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #e91e63, #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'white', boxShadow: '0 4px 12px rgba(233, 30, 99, 0.2)' }}>{lead.name.charAt(0)}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{lead.name}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{lead.email}</p>
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
                      <span style={{
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                        background: lead.type.toLowerCase() === 'booking' ? 'rgba(233, 30, 99, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: lead.type.toLowerCase() === 'booking' ? '#e91e63' : '#3b82f6',
                        border: `1px solid ${lead.type.toLowerCase() === 'booking' ? 'rgba(233, 30, 99, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                      }}>
                        {lead.type.toLowerCase() === 'booking' ? 'Booking' : 'Message'}
                      </span>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600 }}>{lead.phone || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead.id, lead.type, e.target.value)}
                        style={{
                          padding: '8px 12px', background: s.bg, border: `1px solid ${s.border}`,
                          borderRadius: '10px', color: s.text, fontSize: '0.8rem', fontWeight: 700, outline: 'none', cursor: 'pointer'
                        }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Meeting Booked">Meeting Booked</option>
                        <option value="Waiting for Invoice">Waiting for Invoice</option>
                        <option value="No Response">No Response</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '20px' }}>
                        <select
                          value={lead.assignee_id || ''}
                          onChange={e => handleAssignLead(lead.id, lead.type, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{
                            padding: '8px 12px', background: lead.assignee_id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                            border: lead.assignee_id ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px', color: lead.assignee_id ? '#a5b4fc' : '#64748B',
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
                    <td style={{ padding: '20px' }}>
                      <div style={{ color: '#CBD5E1', fontSize: '0.85rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lead.message || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div
                        onClick={() => setNoteModalLead(lead)}
                        style={{
                          position: 'relative', display: 'flex', alignItems: 'center',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                          padding: '8px 32px 8px 12px', minHeight: '36px', width: 'fit-content'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(233, 30, 99, 0.3)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                      >
                        <div style={{
                          color: lead.notes ? '#93c5fd' : '#475569', fontSize: '0.8rem',
                          fontStyle: lead.notes ? 'normal' : 'italic',
                          maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {lead.notes || 'Add note...'}
                        </div>
                        <div style={{ position: 'absolute', right: '10px', color: '#e91e63', fontWeight: 800 }}>+</div>
                      </div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'center', position: 'sticky', right: 0, background: selectedLead?.id === lead.id ? '#1a0b12' : '#0a0a0a', zIndex: 10, borderLeft: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setCallModalLead(lead)}
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
        </div>

        {selectedLead && (
          <div className="lead-detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{selectedLead.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{selectedLead.email}</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#334155' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getStatusColor(selectedLead.status).color }}>{selectedLead.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748B', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ background: 'linear-gradient(145deg, #160a0f, #0a0a0a)', border: '1px solid rgba(233, 30, 99, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '32px' }}>
              <h4 style={{ margin: 0, color: '#e91e63', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.1em' }}>User Problem Response</h4>
              <p style={{ margin: 0, color: 'white', fontSize: '1rem', lineHeight: '1.6', fontWeight: 500 }}>{selectedLead.message || 'No initial problem described.'}</p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '20px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>Internal Admin Notes</h4>
                <button
                  onClick={() => setNoteModalLead(selectedLead)}
                  style={{ padding: '6px 12px', background: 'rgba(233, 30, 99, 0.1)', border: '1px solid rgba(233, 30, 99, 0.2)', color: '#e91e63', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  + Add Note
                </button>
              </div>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.6' }}>{selectedLead.notes || 'No admin notes added yet.'}</p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Timeline</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>{history.length} events</span>
              </h4>
              <div style={{ display: 'grid', gap: '0' }}>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px' }}>
                    <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No activity logged for this lead yet.</p>
                  </div>
                ) : history.map((item, idx) => {
                  const agent = salespeople?.find(sp => sp.id === item.admin_id) || (item.admin_id === user?.id ? profile : null)
                  const agentName = agent?.name || agent?.email?.split('@')[0]
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: '20px', position: 'relative', paddingBottom: idx === history.length - 1 ? 0 : '24px' }}>
                      {idx !== history.length - 1 && <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: 0, width: '2px', background: 'rgba(255,255,255,0.05)' }} />}
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
                        <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem' }}>
                          {new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          {agentName ? ` • by ${agentName}` : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
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
                  {isAdmin && (
                    <button
                      onClick={() => deleteLead(selectedLead)}
                      style={{
                        flex: 1, padding: '14px', background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444',
                        borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>            </div>
          </div>
        )}
      </div>

      {noteModalLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>New Comment</h3>
              <button onClick={() => setNoteModalLead(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <textarea
              id="modal-note-input"
              autoFocus
              placeholder="What's the update?"
              style={{ width: '100%', height: '120px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none', resize: 'none', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  const content = document.getElementById('modal-note-input').value
                  addComment(noteModalLead, content)
                  setNoteModalLead(null)
                }}
                style={{ flex: 1, padding: '12px', background: '#e91e63', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Save Note
              </button>
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
                        name: customEmailLead.name || 'there',
                        company: customEmailLead.company || '',
                        service: customEmailLead.service || '',
                        status: selectedTemplate || 'Custom',
                        subject: customEmailSubject,
                        body: customEmailBody,
                      }
                    })

                    if (error) throw error

                    await supabase.from('lead_history').insert({
                      lead_id: customEmailLead.id,
                      lead_type: customEmailLead.type.toLowerCase() === 'booking' ? 'booking' : 'contact',
                      event_type: 'email_sent',
                      content: `Manual email sent: "${customEmailSubject}"`,
                      admin_id: user?.id
                    })

                    if (selectedLead?.id === customEmailLead.id) {
                      fetchHistory(customEmailLead.id)
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

      {bookingLead && (() => {
        const activeAdminName = profile?.name || profile?.email?.split('@')[0] || 'Admin'
        const isMzi = activeAdminName.toLowerCase().includes('mzi')
        const badgeColor = isMzi ? '#f87171' : '#818cf8'
        const badgeBg = isMzi ? 'rgba(248, 113, 113, 0.15)' : 'rgba(129, 140, 248, 0.15)'

        const getDayLabel = (offset) => {
          const d = new Date()
          d.setDate(d.getDate() + offset)
          if (offset === 0) return { dayName: 'Today', dateStr: d.getDate() }
          if (offset === 1) return { dayName: 'Tomorrow', dateStr: d.getDate() }
          const dayName = d.toLocaleDateString([], { weekday: 'short' })
          return { dayName, dateStr: d.getDate() }
        }

        const generateSlotsForDay = (offset) => {
          const targetDate = new Date()
          targetDate.setDate(targetDate.getDate() + offset)
          
          const slots = []
          const startHour = 9
          const endHour = 18 // up to 6:00 PM
          
          for (let hour = startHour; hour < endHour; hour++) {
            for (let min of [0, 30]) {
              const slotStart = new Date(targetDate)
              slotStart.setHours(hour, min, 0, 0)
              
              if (slotStart < new Date()) continue
              
              const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000)
              
              slots.push({
                start: slotStart,
                end: slotEnd,
                label: slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              })
            }
          }
          return slots
        }

        const getAvailableSlots = (offset) => {
          const slots = generateSlotsForDay(offset)
          return slots.filter(slot => {
            return !busyTimes.some(busy => {
              const busyStart = new Date(busy.start)
              const busyEnd = new Date(busy.end)
              return (slot.start < busyEnd && slot.end > busyStart)
            })
          })
        }

        const availableSlots = getAvailableSlots(selectedDayOffset)

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '850px',
              padding: '32px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.01em' }}>Visual Scheduling Hub</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>Live availability from your primary calendar</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ background: badgeBg, color: badgeColor, padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.01em' }}>
                    Agent: {activeAdminName}
                  </span>
                  <button onClick={() => { setBookingLead(null); setBookingSuccess(false); setBookingError(''); }} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#64748B', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>

              {bookingSuccess ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '30px 0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '2px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h4 style={{ margin: '0 0 8px', color: 'white', fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Appointment Scheduled!</h4>
                  <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: '0.9rem', maxWidth: '450px', lineHeight: 1.5 }}>
                    The call was successfully booked. An email confirmation with meeting details and a Google Meet link has been sent to <strong>{bookingLead.name || bookingLead.email}</strong>, and details have been synced to <strong>info@autoflowstudio.net</strong>.
                  </p>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '20px',
                    width: '100%',
                    maxWidth: '480px',
                    textAlign: 'left',
                    boxSizing: 'border-box',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '10px', fontSize: '0.85rem', lineHeight: 1.4 }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Event Title:</span>
                      <span style={{ color: 'white', fontWeight: 700 }}>{bookingTitle}</span>
                      
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Attendee:</span>
                      <span style={{ color: 'white', fontWeight: 700 }}>{bookingLead.name ? `${bookingLead.name} (${bookingLead.email})` : bookingLead.email}</span>
                      
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Date & Time:</span>
                      <span style={{ color: '#60a5fa', fontWeight: 800 }}>
                        {selectedSlot ? `${selectedSlot.start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} at ${selectedSlot.label}` : ''}
                      </span>

                      <span style={{ color: '#64748b', fontWeight: 600 }}>Organizer:</span>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>info@autoflowstudio.net</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingLead(null)
                      setBookingSuccess(false)
                    }}
                    style={{
                      padding: '12px 32px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.85rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {bookingError && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600 }}>{bookingError}</p>
                      </div>
                      <button onClick={() => setBookingError('')} style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700, lineHieght: 1 }}>×</button>
                    </div>
                  )}

                  {/* Content Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
                    
                    {/* Left Column: Dates & Slots */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ margin: 0, color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Booking Date</p>
                      
                      {/* Day Selector Grid (Optimized - No Horizontal Scroll) */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '6px',
                        width: '100%'
                      }}>
                        {Array.from({ length: 8 }).map((_, idx) => {
                          const label = getDayLabel(idx)
                          const isActive = selectedDayOffset === idx
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedDayOffset(idx)
                                setSelectedSlot(null)
                              }}
                              style={{
                                padding: '8px 2px',
                                borderRadius: '12px',
                                border: isActive ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                                color: isActive ? '#60a5fa' : '#cbd5e1',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', opacity: isActive ? 1 : 0.6, letterSpacing: '0.02em' }}>{label.dayName}</p>
                              <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 800 }}>{label.dateStr}</p>
                            </button>
                          )
                        })}
                      </div>

                      {/* Availability Time Slots Grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '260px' }}>
                        <p style={{ margin: '0 0 10px', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Slots ({calendarTimeZone})</p>
                        
                        {loadingSlots ? (
                          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                              <svg width="32" height="32" viewBox="0 0 38 38" stroke="#3b82f6">
                                <g fill="none" fillRule="evenodd">
                                  <g transform="translate(1 1)" strokeWidth="3">
                                    <circle strokeOpacity=".1" cx="18" cy="18" r="18" stroke="#fff"/>
                                    <path d="M36 18c0-9.94-8.06-18-18-18">
                                      <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from="0 18 18"
                                        to="360 18 18"
                                        dur="0.8s"
                                        repeatCount="indefinite"
                                      />
                                    </path>
                                  </g>
                                </g>
                              </svg>
                              <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>Syncing live calendar schedule…</p>
                            </div>
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '16px', minHeight: '200px', padding: '20px' }}>
                            <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center' }}>No available time slots found for this day. Please check another date.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                            {availableSlots.map((slot, sIdx) => {
                              const isSelected = selectedSlot && selectedSlot.start.getTime() === slot.start.getTime()
                              return (
                                <button
                                  key={sIdx}
                                  onClick={() => setSelectedSlot(slot)}
                                  style={{
                                    padding: '12px 6px',
                                    borderRadius: '10px',
                                    border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                                    background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.02)',
                                    color: isSelected ? '#3b82f6' : '#e2e8f0',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                  }}
                                >
                                  {slot.label}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Confirmation Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '28px' }}>
                      
                      {/* Client Info Summary Card */}
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <p style={{ margin: 0, color: '#64748B', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invited Guest</p>
                          <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>Prefilled</span>
                        </div>
                        <p style={{ margin: '0 0 4px', color: 'white', fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bookingLead.name || 'Unnamed'}</p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bookingLead.email}</p>
                      </div>

                      {/* Form Inputs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', color: '#64748B', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            Meeting Title
                          </label>
                          <input
                            type="text"
                            value={bookingTitle}
                            onChange={e => setBookingTitle(e.target.value)}
                            placeholder="Strategy session..."
                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', color: '#64748B', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            Meeting Description & Notes
                          </label>
                          <textarea
                            value={bookingDescription}
                            onChange={e => setBookingDescription(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box', resize: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Selected Slot Confirmation Block */}
                      <div style={{ background: selectedSlot ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)', border: selectedSlot ? '1px solid rgba(59, 130, 246, 0.15)' : '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Time Slot</p>
                        {selectedSlot ? (
                          <p style={{ margin: 0, color: '#60a5fa', fontSize: '0.85rem', fontWeight: 800 }}>
                            {selectedSlot.start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} at {selectedSlot.label}
                          </p>
                        ) : (
                          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                            Select a date and time slot from the calendar availability grid.
                          </p>
                        )}
                      </div>

                      {/* Google Meet confirmation banner */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '10px 14px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 7l-7 5 7 5V7z" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                        <p style={{ margin: 0, color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>Google Meet video link added as method</p>
                      </div>

                      {/* Modal Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                        <button
                          onClick={() => setBookingLead(null)}
                          style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBookAppointment}
                          disabled={bookingSending || !selectedSlot}
                          style={{
                            flex: 1.5,
                            padding: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '10px',
                            fontWeight: 800,
                            cursor: selectedSlot ? 'pointer' : 'not-allowed',
                            opacity: selectedSlot ? 1 : 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: selectedSlot ? '0 6px 20px rgba(59, 130, 246, 0.25)' : 'none',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          {bookingSending ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 38 38" stroke="#fff">
                                <g fill="none" fillRule="evenodd">
                                  <g transform="translate(1 1)" strokeWidth="3">
                                    <circle strokeOpacity=".2" cx="18" cy="18" r="18" stroke="#fff"/>
                                    <path d="M36 18c0-9.94-8.06-18-18-18">
                                      <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from="0 18 18"
                                        to="360 18 18"
                                        dur="0.8s"
                                        repeatCount="indefinite"
                                      />
                                    </path>
                                  </g>
                                </g>
                              </svg>
                              Booking…
                            </>
                          ) : 'Book Call'}
                        </button>
                      </div>

                    </div>

                  </div>
                </>
              )}

            </div>
          </div>
        )
      })()}
    </AdminLayout>
  )
}
