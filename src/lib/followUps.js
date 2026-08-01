import { supabase } from './supabase'

function getGoogleCalendarColorId(name) {
  const norm = (name || '').toLowerCase()
  if (norm.includes('justin')) return '1' // Lavender
  if (norm.includes('mzi')) return '4' // Tomato
  return '9' // Blueberry/Blue (default)
}

// Shared helper for writing a row into public.reminders (the table backing
// the per-salesperson follow-up calendar). Used both when a note/call is
// auto-parsed for a date ("call back tmrw") and when a follow-up is set
// manually via the "Follow Up Needed" status popup.
export async function scheduleFollowUp({ lead, leadType, scheduledAt, notesContent, source, salespeople, currentUser, currentProfile }) {
  const salespersonId = lead.assignee_id || currentUser?.id
  if (!salespersonId) return { error: new Error('Lead has no assignee to notify') }

  const sp = salespeople?.find(s => s.id === salespersonId)
  const salespersonEmail = sp?.email || (salespersonId === currentUser?.id ? currentUser?.email : null)
  const salespersonName = sp?.name || (salespersonId === currentUser?.id ? currentProfile?.name : null) || salespersonEmail?.split('@')[0] || 'Team Member'

  if (!salespersonEmail) return { error: new Error('Could not resolve salesperson email') }

  let googleEventId = null
  try {
    const colorId = getGoogleCalendarColorId(salespersonName)
    const { data, error: funcError } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'create_followup',
        leadName: lead.name || lead.email || 'Client',
        leadEmail: lead.email || '',
        leadType: leadType.toLowerCase() === 'booking' ? 'booking' : leadType.toLowerCase() === 'outreach' ? 'outreach' : 'contact',
        notesContent: notesContent || 'Follow up',
        scheduledAt: scheduledAt.toISOString(),
        salespersonName,
        salespersonEmail,
        colorId
      }
    })

    if (!funcError && data?.eventId) {
      googleEventId = data.eventId
    } else if (funcError) {
      console.error('[Google Calendar] Failed to create follow-up event:', funcError)
    }
  } catch (err) {
    console.error('[Google Calendar] Exception during follow-up event creation:', err)
  }

  return supabase.from('reminders').insert({
    lead_id: lead.id,
    lead_type: leadType.toLowerCase() === 'booking' ? 'booking' : leadType.toLowerCase() === 'outreach' ? 'outreach' : 'contact',
    lead_name: lead.name || lead.email || 'Client',
    salesperson_id: salespersonId,
    salesperson_email: salespersonEmail,
    salesperson_name: salespersonName,
    notes_content: notesContent || 'Follow up',
    scheduled_at: scheduledAt.toISOString(),
    source,
    lead_status_at_creation: lead.status || null,
    google_event_id: googleEventId
  })
}

export function formatFollowUpDate(dateStr) {
  return new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}
