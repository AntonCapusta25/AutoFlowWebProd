import { supabase } from './supabase'

/**
 * Aircall Integration Utility for AutoFlow Studio CRM
 *
 * Connected Aircall Account:
 * - User: Walid Sabihi (ID: 2055112)
 * - Number: AutoFlow Studio dialers (+1 888-752-5240, ID: 1369705)
 */

/**
 * Format phone number into clean E.164 international format
 */
export function formatE164(phone) {
  if (!phone) return ''
  let cleaned = phone.replace(/[^0-9+]/g, '')
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('06')) {
      cleaned = '+31' + cleaned.substring(1)
    } else if (cleaned.startsWith('0')) {
      cleaned = '+31' + cleaned.substring(1)
    } else {
      cleaned = '+' + cleaned
    }
  }
  return cleaned
}

/**
 * Trigger an Aircall outbound call to the given phone number
 * @param {string} rawPhone - Lead's phone number
 * @param {object} options - Optional lead context { leadId, leadName, company }
 */
export async function triggerAircall(rawPhone, options = {}) {
  if (!rawPhone) return null
  const cleanPhone = formatE164(rawPhone)

  // 1. Dispatch custom event for embedded Aircall WebPhone widget in CRM
  const event = new CustomEvent('aircall:dial', {
    detail: { phone: cleanPhone, rawPhone, ...options }
  })
  window.dispatchEvent(event)

  // 2. Trigger native Aircall desktop app / browser extension protocol
  const aircallUrl = `aircall://call?number=${encodeURIComponent(cleanPhone)}`
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = aircallUrl
  document.body.appendChild(iframe)

  setTimeout(() => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe)
  }, 2000)

  // 3. Send API dial trigger to Aircall API via Supabase Edge Function
  try {
    await supabase.functions.invoke('aircall-api', {
      body: { phone: cleanPhone, leadName: options.leadName || options.company || '' }
    })
  } catch (err) {
    console.log('[aircall] API dial fallback notice:', err)
  }

  return cleanPhone
}

/**
 * Sync CRM lead to Aircall contacts
 */
export async function syncLeadToAircall(lead) {
  if (!lead || !lead.phone) return null
  try {
    const { data } = await supabase.functions.invoke('aircall-api', {
      body: {
        action: 'sync-contact',
        name: lead.name,
        phone: formatE164(lead.phone),
        email: lead.email,
        company: lead.company
      }
    })
    return data
  } catch (err) {
    console.error('[aircall] Contact sync error:', err)
    return null
  }
}
