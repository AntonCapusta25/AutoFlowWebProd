import { supabase } from './supabase'

/**
 * Aircall CTI & Web Phone Launcher Utility for AutoFlow Studio CRM
 *
 * Integrates directly with embedded Aircall Web Phone (https://phone.aircall.io)
 * and Aircall REST API:
 * - User: Walid Sabihi (ID: 2055112)
 * - Line: AutoFlow Studio dialers (+1 888-752-5240 | ID: 1369705)
 */

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
    z-index: 100000;
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
 * Execute Dial: Dispatch event to embedded Aircall Phone drawer + send backend API trigger
 */
async function executeAircallDial(cleanPhone, leadName) {
  showStatusToast(`📞 Opening Aircall Web Phone for ${leadName ? `<strong>${leadName}</strong> (${cleanPhone})` : `<strong>${cleanPhone}</strong>`}…`)

  // 1. Dispatch custom event to pop open embedded Aircall Web Phone drawer loaded with cleanPhone
  const dialEvent = new CustomEvent('aircall:dial', {
    detail: { phone: cleanPhone, leadName }
  })
  window.dispatchEvent(dialEvent)

  // 2. Trigger API call via Supabase Gateway in background
  try {
    await supabase.functions.invoke('send-email', {
      body: { type: 'aircall_dial', phone: cleanPhone }
    })
  } catch (e) {
    console.log('[aircall] API dial background notice:', e)
  }
}

/**
 * Trigger Aircall Call with 3-Second Popup Countdown Modal & Cancel Button
 */
export function triggerAircall(rawPhone, options = {}) {
  if (!rawPhone) return null
  const cleanPhone = formatE164(rawPhone)
  const leadName = options.leadName || options.company || cleanPhone

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
    z-index: 999999;
    background: rgba(0, 0, 0, 0.75);
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
      padding: 28px 32px;
      width: 380px;
      max-width: 90vw;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
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
        Opening Aircall Web Phone in <span id="aircall-timer-text" style="color: white; font-weight: 700;">3 seconds</span>…
      </p>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="aircall-cancel-btn" style="
          flex: 1;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        ">
          ✕ Cancel Call
        </button>

        <button id="aircall-dial-now-btn" style="
          flex: 1;
          padding: 12px 16px;
          background: linear-gradient(135deg, #00B2A9, #008080);
          border: none;
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 178, 169, 0.3);
          transition: all 0.2s;
        ">
          📞 Call Now
        </button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  const numEl = document.getElementById('aircall-timer-num')
  const textEl = document.getElementById('aircall-timer-text')
  const cancelBtn = document.getElementById('aircall-cancel-btn')
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

  // Aircall API Dial Now Action
  dialNowBtn.onclick = () => {
    closeModal()
    executeAircallDial(cleanPhone, leadName)
  }

  // Start 3-second countdown
  timerId = setInterval(() => {
    secondsLeft -= 1
    if (numEl) numEl.textContent = secondsLeft
    if (textEl) textEl.textContent = `${secondsLeft} second${secondsLeft === 1 ? '' : 's'}`

    if (secondsLeft <= 0) {
      closeModal()
      executeAircallDial(cleanPhone, leadName)
    }
  }, 1000)

  return cleanPhone
}
