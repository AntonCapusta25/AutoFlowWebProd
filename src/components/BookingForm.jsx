import { useState, useEffect } from 'react'
import { supabase, sendEmailNotification } from '../lib/supabase'

function showNotification(msg, type = 'success') {
  const n = document.createElement('div')
  n.style.cssText = `position:fixed;top:20px;right:20px;z-index:10000;max-width:400px;padding:16px 20px;border-radius:12px;font-family:Inter,sans-serif;font-weight:500;color:white;box-shadow:0 10px 30px rgba(0,0,0,0.25);backdrop-filter:blur(10px);background:${type==='success'?'linear-gradient(135deg,rgba(34,197,94,0.9),rgba(16,185,129,0.9))':'linear-gradient(135deg,rgba(239,68,68,0.9),rgba(220,38,38,0.9))'}`
  n.textContent = msg
  document.body.appendChild(n)
  setTimeout(() => n.remove(), 5000)
}

export default function BookingForm({ title = 'Book Your Automation Audit' }) {
  const [form, setForm] = useState({ service:'', size:'solo', platform:'', name:'', email:'' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.service || !form.name || !form.email) {
      showNotification('Please fill in all required fields.', 'error'); return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from('booking_leads').insert([{
        name: form.name, email: form.email,
        service: form.service, size: form.size, platform: form.platform,
      }])
      if (error) throw error
      await sendEmailNotification({ type: 'booking', ...form })
      showNotification('🎉 Request received! We\'ll contact you within 24 hours.')
      setForm({ service:'', size:'solo', platform:'', name:'', email:'' })
    } catch (err) {
      console.error(err)
      showNotification('Something went wrong. Please try again.', 'error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <div>
        <label className="input-label">Select Service</label>
        <div className="input-wrapper">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>
          <select className="booking-select" value={form.service} onChange={e=>set('service',e.target.value)} required>
            <option value="" disabled>-- Select Your Need --</option>
            <option value="sheets">Google Sheets Automation</option>
            <option value="ai-workflow">AI Workflow</option>
            <option value="crm">CRM Integration</option>
            <option value="custom">Custom Workflow</option>
            <option value="audit">Free Automation Audit</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label className="input-label">Business Size</label>
          <div className="input-wrapper">
            <select className="booking-select" value={form.size} onChange={e=>set('size',e.target.value)}>
              <option value="solo">Solo-Preneur</option>
              <option value="startup">Startup (1–10)</option>
              <option value="team">Team (10–50)</option>
              <option value="enterprise">Enterprise (50+)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="input-label">Platform</label>
          <div className="input-wrapper">
            <input type="text" placeholder="e.g. Make / Zapier" className="booking-input" value={form.platform} onChange={e=>set('platform',e.target.value)} />
          </div>
        </div>
      </div>

      <div className="input-wrapper">
        <input type="text" placeholder="Your Name" required className="booking-input" style={{paddingLeft:'1rem'}} value={form.name} onChange={e=>set('name',e.target.value)} />
      </div>
      <div className="input-wrapper">
        <input type="email" placeholder="Email Address" required className="booking-input" style={{paddingLeft:'1rem'}} value={form.email} onChange={e=>set('email',e.target.value)} />
      </div>

      <button type="submit" className="booking-submit-btn" disabled={loading}>
        <div className="btn-content">
          <span>{loading ? 'Sending…' : 'Get Free Audit'}</span>
          {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
        </div>
        <div className="shimmer" />
      </button>
      <p className="form-footer-text">No payment required.<br />You'll be contacted to finalise details.</p>
    </form>
  )
}
