/**
 * Aircall Direct Auto-Dial Utility for AutoFlow Studio CRM
 *
 * Calls Aircall REST API directly from the browser with Basic Auth credentials:
 * - User: Walid Sabihi (ID: 2055112)
 * - Line: AutoFlow Studio dialers (+1 888-752-5240 | ID: 1369705)
 */

const AIRCALL_API_ID = 'f5faee77fd7497d482376fae85cf85cf'
const AIRCALL_API_TOKEN = '10e3d5746a9e19b1ad96a56463c73842'
const DEFAULT_USER_ID = 2055112
const DEFAULT_NUMBER_ID = 1369705

function getAuthHeader() {
  return 'Basic ' + btoa(`${AIRCALL_API_ID}:${AIRCALL_API_TOKEN}`)
}

/**
 * Format phone number into clean E.164 international format (+31..., +1...)
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
function showCallingToast(phone, leadName, status = 'calling', message = '') {
  const existing = document.getElementById('aircall-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'aircall-toast'
  const isError = status === 'error'
  
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 10000;
    padding: 14px 22px;
    border-radius: 14px;
    background: ${isError ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #00B2A9, #006666)'};
    color: white;
    font-family: Arial, sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    box-shadow: 0 10px 30px ${isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 178, 169, 0.4)'};
    display: flex;
    align-items: center;
    gap: 10px;
  `
  
  const text = isError 
    ? `⚠️ Aircall Call Failed: ${message || 'Check phone format'}`
    : `📞 Calling ${leadName ? `<strong>${leadName}</strong> (${phone})` : `<strong>${phone}</strong>`} via Aircall…`

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
    <span>${text}</span>
  `
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.5s'
    setTimeout(() => { if (toast.parentNode) toast.remove() }, 500)
  }, 4000)
}

/**
 * Trigger an instant automatic Aircall call directly via Aircall REST API
 */
export async function triggerAircall(rawPhone, options = {}) {
  if (!rawPhone) return null
  const cleanPhone = formatE164(rawPhone)

  // Show status toast
  showCallingToast(cleanPhone, options.leadName || options.company)

  try {
    console.log(`[aircall] Initiating direct Aircall API call to ${cleanPhone}...`)

    const res = await fetch(`https://api.aircall.io/v1/users/${DEFAULT_USER_ID}/calls`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: cleanPhone,
        number_id: DEFAULT_NUMBER_ID
      })
    })

    const data = await res.json()
    console.log('[aircall] Direct API Call Result:', data)

    if (!res.ok || data.error) {
      const errMsg = data.troubleshoot || data.message || 'Call failed'
      console.warn('[aircall] Call failed:', errMsg)
      showCallingToast(cleanPhone, options.leadName, 'error', errMsg)
      return null
    }

    return data
  } catch (err) {
    console.error('[aircall] Network error during Aircall API call:', err)
    showCallingToast(cleanPhone, options.leadName, 'error', err.message)
    return null
  }
}
