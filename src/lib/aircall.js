/**
 * Aircall Direct Auto-Dial Utility for AutoFlow Studio CRM
 *
 * Calls Aircall REST API directly from the browser with Basic Auth credentials:
 * - User: Walid Sabihi (ID: 2055112)
 * - Line: AutoFlow Studio dialers (+1 888-752-5240 | ID: 1369705)
 * - Supports native mobile device calling (tel:) when opened on phones/tablets
 */

const DEFAULT_USER_ID = 2055112
const DEFAULT_NUMBER_ID = 1369705
// Pre-encoded Base64 string for "f5faee77fd7497d482376fae85cf85cf:10e3d5746a9e19b1ad96a56463c73842"
// (Avoids btoa DOMException "The string did not match the expected pattern" in iOS Safari / WebKit)
const AUTH_HEADER = 'Basic ZjVmYWVlNzdmZDc0OTdkNDgyMzc2ZmFlODVjZjg1Y2Y6MTBlM2Q1NzQ2YTllMTliMWFkOTZhNTY0NjNjNzM4NDI='

/**
 * Check if current user is on a mobile device (iPhone, iPad, Android)
 */
export function isMobileDevice() {
  return typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
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
 * Show temporary sleek status toast notification
 */
function showStatusToast(message, isError = false) {
  const existing = document.getElementById('aircall-status-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'aircall-status-toast'
  
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
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
    <span>${message}</span>
  `
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.5s'
    setTimeout(() => { if (toast.parentNode) toast.remove() }, 500)
  }, 4000)
}

/**
 * Execute actual HTTP POST request to Aircall API & trigger native device call on mobile
 */
async function executeAircallDial(cleanPhone, leadName, useNativeTel = false) {
  // If native tel requested or on mobile device, trigger phone's native dialer
  if (useNativeTel || isMobileDevice()) {
    console.log(`[aircall] Triggering native mobile device dialer for ${cleanPhone}...`)
    window.location.href = `tel:${cleanPhone}`
  }

  try {
    console.log(`[aircall] Initiating direct Aircall API call to ${cleanPhone}...`)

    const res = await fetch(`https://api.aircall.io/v1/users/${DEFAULT_USER_ID}/calls`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: cleanPhone,
        number_id: DEFAULT_NUMBER_ID
      })
    })

    // Aircall returns HTTP 204 No Content on successful call trigger (no JSON body)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const errMsg = data.troubleshoot || data.message || `Call failed (HTTP ${res.status})`
      console.warn('[aircall] Call failed:', errMsg)
      showStatusToast(`⚠️ Aircall Failed: ${errMsg}`, true)
      return null
    }

    console.log(`[aircall] Aircall API call successfully triggered (HTTP ${res.status})`)
    showStatusToast(`📞 Dialing ${leadName ? `<strong>${leadName}</strong> (${cleanPhone})` : `<strong>${cleanPhone}</strong>`} via Aircall…`)
    return { success: true }
  } catch (err) {
    console.error('[aircall] Network error during Aircall API call:', err)
    showStatusToast(`⚠️ Error connecting to Aircall: ${err.message}`, true)
    return null
  }
}

/**
 * Trigger Aircall Call with Popup Countdown Modal & Cancel Button
 */
export function triggerAircall(rawPhone, options = {}) {
  if (!rawPhone) return null
  const cleanPhone = formatE164(rawPhone)
  const leadName = options.leadName || options.company || cleanPhone
  const isMobile = isMobileDevice()

  // Remove any previous active modal
  const existingModal = document.getElementById('aircall-countdown-modal')
  if (existingModal) existingModal.remove()

  let secondsLeft = 3
  let timerId = null

  // Create Modal Overlay
  const modal = document.createElement('div')
  modal.id = 'aircall-countdown-modal'
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
    animation: fadeIn 0.2s ease-out;
  `

  modal.innerHTML = `
    <div style="
      background: #0d1117;
      border: 1px solid rgba(0, 178, 169, 0.4);
      border-radius: 20px;
      padding: 28px 24px;
      width: 400px;
      max-width: 90vw;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      text-align: center;
      color: white;
    ">
      <div style="
        width: 60px; height: 60px;
        margin: 0 auto 16px;
        border-radius: 50%;
        background: rgba(0, 178, 169, 0.15);
        border: 2px solid #00B2A9;
        display: flex; alignItems: center; justify-content: center;
        color: #00B2A9; font-size: 1.6rem; font-weight: 800;
      ">
        <span id="aircall-timer-num">3</span>
      </div>

      <h3 style="margin: 0 0 6px; font-size: 1.2rem; font-weight: 800; color: white;">
        Calling ${leadName}
      </h3>
      <p style="margin: 0 0 16px; font-size: 0.95rem; color: #00B2A9; font-weight: 700;">
        ${cleanPhone}
      </p>

      <p style="margin: 0 0 24px; font-size: 0.85rem; color: #94A3B8;">
        Initiating ${isMobile ? 'mobile call & Aircall' : 'Aircall dialer'} in <span id="aircall-timer-text" style="color: white; font-weight: 700;">3 seconds</span>…
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
        <button id="aircall-cancel-btn" style="
          flex: 1; min-width: 100px;
          padding: 12px 14px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        ">
          ✕ Cancel
        </button>

        <button id="aircall-device-btn" style="
          flex: 1; min-width: 110px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        ">
          📱 Mobile Dial
        </button>

        <button id="aircall-dial-now-btn" style="
          flex: 1; min-width: 110px;
          padding: 12px 14px;
          background: linear-gradient(135deg, #00B2A9, #008080);
          border: none;
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 178, 169, 0.3);
          transition: all 0.2s;
        ">
          📞 Aircall Dial
        </button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  const numEl = document.getElementById('aircall-timer-num')
  const textEl = document.getElementById('aircall-timer-text')
  const cancelBtn = document.getElementById('aircall-cancel-btn')
  const deviceBtn = document.getElementById('aircall-device-btn')
  const dialNowBtn = document.getElementById('aircall-dial-now-btn')

  function closeModal() {
    if (timerId) clearInterval(timerId)
    if (modal && modal.parentNode) modal.remove()
  }

  // Cancel Button Action
  cancelBtn.onclick = () => {
    closeModal()
    showStatusToast('⏹️ Call Canceled', false)
  }

  // Native Mobile Device Call Action
  deviceBtn.onclick = () => {
    closeModal()
    executeAircallDial(cleanPhone, leadName, true)
  }

  // Aircall API Dial Now Action
  dialNowBtn.onclick = () => {
    closeModal()
    executeAircallDial(cleanPhone, leadName, false)
  }

  // Start 3-second countdown
  timerId = setInterval(() => {
    secondsLeft -= 1
    if (numEl) numEl.textContent = secondsLeft
    if (textEl) textEl.textContent = `${secondsLeft} second${secondsLeft === 1 ? '' : 's'}`

    if (secondsLeft <= 0) {
      closeModal()
      executeAircallDial(cleanPhone, leadName, isMobile)
    }
  }, 1000)

  return cleanPhone
}
