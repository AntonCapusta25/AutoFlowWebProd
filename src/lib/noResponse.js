import { NO_RESPONSE_HINTS } from './followUpParser'

/**
 * Checks if a note contains any variation of "No Response", "NR", "VM", "Voicemail", "No Answer", etc.
 * If matched:
 * 1. Updates the lead's status to 'No Response' in database if not already updated.
 * 2. Auto-sends the English "No Response" email template to the lead's email.
 * 3. Logs history events in lead_history.
 */
export async function handleNoResponseAutomation({ lead, leadType, text, supabase, user, onStatusUpdated, onHistoryUpdated }) {
  if (!lead || !text || !NO_RESPONSE_HINTS.test(text)) return false

  const leadId = lead.id
  const typeLower = (leadType || 'outreach').toLowerCase()
  const tableName = typeLower === 'booking' ? 'booking_leads' : typeLower === 'contact' ? 'contact_leads' : 'outreach_leads'
  const histLeadType = typeLower === 'booking' ? 'booking' : typeLower === 'contact' ? 'contact' : 'outreach'

  // 1. Update status to 'No Response' if not already
  if (lead.status !== 'No Response') {
    const { error: updateErr } = await supabase.from(tableName).update({ status: 'No Response' }).eq('id', leadId)
    if (!updateErr) {
      if (typeof onStatusUpdated === 'function') {
        onStatusUpdated('No Response')
      }
      await supabase.from('lead_history').insert({
        lead_id: leadId,
        lead_type: histLeadType,
        event_type: 'status_change',
        content: 'Status updated to No Response (via note)',
        admin_id: user?.id
      })
    }
  }

  // 2. Auto-send English "No Response" email template if lead has an email
  if (lead.email) {
    try {
      // Fetch 'No Response' template from email_templates
      const { data: tmpl } = await supabase
        .from('email_templates')
        .select('subject, body')
        .eq('status', 'No Response')
        .maybeSingle()

      const defaultSubject = 'Checking in, {{name}} 👋'
      const defaultBody = '<p>Hi {{name}},</p><p>We noticed we haven\'t been able to connect with you yet. We\'d love to learn more about your automation needs — feel free to reply or book a time that suits you.</p><p>Best,<br/>AutoFlow Studio</p>'

      const subject = tmpl?.subject || defaultSubject
      const body = tmpl?.body || defaultBody

      const { error: sendErr } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'status_change',
          recipient: lead.email,
          name: lead.name || 'there',
          company: lead.company || '',
          service: lead.industry || lead.service || '',
          status: 'No Response',
          subject: subject,
          body: body
        }
      })

      if (!sendErr) {
        await supabase.from('lead_history').insert({
          lead_id: leadId,
          lead_type: histLeadType,
          event_type: 'email',
          content: `✉️ Auto-sent "No Response" email template to ${lead.email}`,
          admin_id: user?.id
        })
        if (typeof onHistoryUpdated === 'function') {
          onHistoryUpdated()
        }
      } else {
        console.warn('[No Response Email] Failed to send template:', sendErr)
      }
    } catch (err) {
      console.warn('[No Response Email] Error sending template:', err)
    }
  }

  return true
}
