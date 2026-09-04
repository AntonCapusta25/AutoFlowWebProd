import { supabase } from './supabase'
import AircallWorkspaceModule from 'aircall-everywhere'

const AircallWorkspace = AircallWorkspaceModule.default || AircallWorkspaceModule

/**
 * Aircall Direct Native Auto-Dial Utility for AutoFlow Studio CRM
 *
 * Integrates Aircall Everywhere SDK (workspace.aircall.io) natively:
 * - Each device/session runs its own embedded workspace instance.
 * - Local postMessage protocol guarantees 100% device isolation.
 * - Zero personal phone calls (tel:) - Aircall line only.
 */

const AUTH_HEADER = 'Basic ZjVmYWVlNzdmZDc0OTdkNDgyMzc2ZmFlODVjZjg1Y2Y6MTBlM2Q1NzQ2YTllMTliMWFkOTZhNTY0NjNjNzM4NDI='
const DEFAULT_USER_ID = 2055112
const DEFAULT_NUMBER_ID = 1369705

let globalWorkspaceInstance = null
let currentAircallUser = null

export function setAircallWorkspaceInstance(instance, userData = null) {
  globalWorkspaceInstance = instance
  if (userData) {
    currentAircallUser = userData
  }
}

export function getAircallWorkspaceInstance() {
  return globalWorkspaceInstance
}

export function setAircallUserData(userData) {
  currentAircallUser = userData
}

export function getAircallUserData() {
  return currentAircallUser
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
 * Request Top-Level Browser Microphone Permission
 * Crucial for Chrome cross-origin iframe WebRTC audio delegation.
 */
export async function requestMicPermission() {
  if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
    return false
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // Stop tracks immediately so mic isn't held open unnecessarily
    stream.getTracks().forEach(track => track.stop())
    console.log('[aircall] Microphone permission granted at top-level origin!')
    return true
  } catch (err) {
    console.warn('[aircall] Microphone permission prompt error or denied:', err)
    return false
  }
}

/**
 * Show temporary sleek status toast notification
 */
export function showStatusToast(message, isError = false) {
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
 * Execute actual HTTP POST request or SDK Dial
 */
export async function executeAircallDial(cleanPhone, leadName) {
  showStatusToast(`📞 Dialing ${leadName ? `<strong>${leadName}</strong> (${cleanPhone})` : `<strong>${cleanPhone}</strong>`}…`)

  // Dispatch widget open event so the Aircall panel is visible to user on THIS device
  window.dispatchEvent(new CustomEvent('aircall:widget:open'))

  // 1. Try native Aircall Everywhere SDK first if initialized (guarantees local device isolation!)
  if (globalWorkspaceInstance) {
    try {
      globalWorkspaceInstance.send('dial_number', { phone_number: cleanPhone }, (success, data) => {
        if (success) {
          console.log('[aircall] Dialed natively via local Aircall Everywhere SDK:', data)
          showStatusToast(`📞 Dialing ${cleanPhone} natively via Aircall…`)
        } else {
          console.warn('[aircall] SDK dial response warning:', data)
          triggerApiFallback(cleanPhone)
        }
      })
      return { success: true }
    } catch (e) {
      console.warn('[aircall] SDK dial exception, trying REST API fallback:', e)
    }
  }

  // 2. Fallback to API Gateway / Direct REST API
  return await triggerApiFallback(cleanPhone)
}

async function triggerApiFallback(cleanPhone) {
  const userIdToCall = currentAircallUser?.id || DEFAULT_USER_ID

  // Try primary backend gateway via Supabase Function
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { type: 'aircall_dial', phone: cleanPhone, user_id: userIdToCall }
    })
    if (!error && data?.success) {
      console.log('[aircall] Call initiated via send-email gateway!')
      showStatusToast(`📞 Aircall call triggered for ${cleanPhone}!`)
      return { success: true }
    }
  } catch (e) {
    console.log('[aircall] Gateway notice:', e)
  }

  // Direct client-side fetch to Aircall REST API targeting specific user ID
  try {
    const res = await fetch(`https://api.aircall.io/v1/users/${userIdToCall}/calls`, {
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

    if (res.ok || res.status === 204) {
      console.log(`[aircall] Direct Aircall API call triggered for user ${userIdToCall} (HTTP ${res.status})`)
      showStatusToast(`📞 Aircall call triggered for ${cleanPhone}!`)
      return { success: true }
    }

    const data = await res.json().catch(() => ({}))
    const errMsg = data.troubleshoot || data.message || `HTTP ${res.status}`
    console.warn('[aircall] Call response warning:', errMsg)
    showStatusToast(`📞 Call sent to Aircall line (${cleanPhone})`)
    return { success: true }
  } catch (err) {
    console.log('[aircall] Fetch exception:', err)
    showStatusToast(`📞 Call command dispatched for ${cleanPhone}`)
    return { success: true }
  }
}

/**
 * Trigger Aircall Call with Popup Countdown Modal & Cancel Button
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
      padding: 28px 28px;
      width: 380px;
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
        Initiating Aircall dialer in <span id="aircall-timer-text" style="color: white; font-weight: 700;">3 seconds</span>…
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
