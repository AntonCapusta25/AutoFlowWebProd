import { supabase } from './supabase'

/**
 * Aircall Direct Auto-Dial Utility for AutoFlow Studio CRM
 *
 * Automatically initiates outbound calls via Aircall REST API
 * using connected credentials (User ID: 2055112, Number ID: 1369705)
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
 * Show temporary sleek calling toast notification
 */
function showCallingToast(phone, leadName) {
  const existing = document.getElementById('aircall-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'aircall-toast'
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 10000;
    padding: 14px 22px;
    border-radius: 14px;
    background: linear-gradient(135deg, #00B2A9, #006666);
    color: white;
    font-family: Arial, sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(0, 178, 169, 0.4);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeIn 0.3s ease-in-out;
  `
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
    <span>Calling ${leadName ? `<strong>${leadName}</strong> (${phone})` : `<strong>${phone}</strong>`} via Aircall…</span>
  `
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.5s'
    setTimeout(() => { if (toast.parentNode) toast.remove() }, 500)
  }, 4000)
}

/**
 * Trigger an instant automatic Aircall call
 */
export async function triggerAircall(rawPhone, options = {}) {
  if (!rawPhone) return null
  const cleanPhone = formatE164(rawPhone)

  // Show status notification
  showCallingToast(cleanPhone, options.leadName || options.company)

  // 1. Direct call trigger via Aircall API Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('aircall-api', {
      body: { phone: cleanPhone, leadName: options.leadName || options.company || '' }
    })
    console.log('[aircall] Automatic dial API response:', data, error)
  } catch (err) {
    console.error('[aircall] API dial error:', err)
  }

  // 2. Trigger native Aircall Desktop App / Extension protocol in background
  const aircallUrl = `aircall://call?number=${encodeURIComponent(cleanPhone)}`
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = aircallUrl
  document.body.appendChild(iframe)
  setTimeout(() => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe)
  }, 2000)

  return cleanPhone
}
