import { useState, useEffect } from 'react'
import { supabase, sendEmailNotification } from '../lib/supabase'

function showNotification(msg, type = 'success') {
  const n = document.createElement('div')
  n.style.cssText = `position:fixed;top:20px;right:20px;z-index:10000;max-width:400px;padding:16px 20px;border-radius:12px;font-family:Inter,sans-serif;font-weight:500;color:white;box-shadow:0 10px 30px rgba(0,0,0,0.25);backdrop-filter:blur(10px);background:${type==='success'?'linear-gradient(135deg,rgba(34,197,94,0.9),rgba(16,185,129,0.9))':'linear-gradient(135deg,rgba(239,68,68,0.9),rgba(220,38,38,0.9))'}`
  n.textContent = msg
  document.body.appendChild(n)
  setTimeout(() => n.remove(), 5000)
}

export default function BookingForm({ title = 'Book Your Automation Audit', lang = 'en' }) {
  const [form, setForm] = useState({ service:'', size:'solo', platform:'', name:'', email:'', phone:'' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isNl = lang === 'nl'
  const labels = isNl ? {
    service: 'Selecteer Service',
    servicePlaceholder: '-- Kies Uw Behoefte --',
    size: 'Bedrijfsgrootte',
    name: 'Uw Naam',
    email: 'E-mailadres',
    phone: 'Telefoonnummer',
    note: 'Opmerking (Optioneel)',
    notePlaceholder: 'Heeft u specifieke behoeften of vragen?',
    btn: 'Krijg Gratis Audit',
    sending: 'Bezig met verzenden...',
    footer: 'Geen betaling vereist.<br />Er wordt contact met je opgenomen.',
    success: '🎉 Aanvraag ontvangen! We nemen binnen 24 uur contact met je op.',
    errorFields: 'Vul alle verplichte velden in.',
    errorGeneral: 'Er is iets misgegaan. Probeer het opnieuw.',
    dontKnow: 'Ik weet het nog niet'
  } : {
    service: 'Selecteer Service',
    servicePlaceholder: '-- Select Your Need --',
    size: 'Business Size',
    name: 'Your Name',
    email: 'Email Address',
    phone: 'Phone Number',
    note: 'Leave a Note (Optional)',
    notePlaceholder: 'Any specific needs or questions?',
    btn: 'Get Free Audit',
    sending: 'Sending...',
    footer: 'No payment required.<br />You\'ll be contacted to finalise details.',
    success: '🎉 Request received! We\'ll contact you within 24 hours.',
    errorFields: 'Please fill in all required fields.',
    errorGeneral: 'Something went wrong. Please try again.',
    dontKnow: 'I don\'t know yet'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.service || !form.name || !form.email) {
      showNotification(labels.errorFields, 'error'); return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from('booking_leads').insert([{
        name: form.name, email: form.email, phone: form.phone,
        service: form.service, size: form.size, 
        message: form.message, platform: 'STANDARDIZED',
      }])
      if (error) throw error
      await sendEmailNotification({ type: 'booking', ...form })
      showNotification(labels.success)
      setForm({ service:'', size:'solo', platform:'', name:'', email:'', phone:'', message:'' })
    } catch (err) {
      console.error(err)
      showNotification(labels.errorGeneral, 'error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <div>
        <label className="input-label">{labels.service}</label>
        <div className="input-wrapper">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>
          <select className="booking-select" value={form.service} onChange={e=>set('service',e.target.value)} required>
            <option value="" disabled>{labels.servicePlaceholder}</option>
            <option value="ai-agents">{isNl ? 'AI Agent Ontwikkeling' : 'AI Agent Development'}</option>
            <option value="process-auto">{isNl ? 'End-to-End Procesautomatisering' : 'End-to-End Process Automation'}</option>
            <option value="lead-gen">{isNl ? 'Geautomatiseerde Leadgeneratie' : 'Automated Lead Generation'}</option>
            <option value="data-intel">{isNl ? 'Data Intelligence & Analytics' : 'Data Intelligence & Analytics'}</option>
            <option value="custom">{isNl ? 'Maatwerk Systeemintegratie' : 'Custom System Integration'}</option>
            <option value="dont-know">{labels.dontKnow}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="input-label">{labels.size}</label>
        <div className="input-wrapper">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <select className="booking-select" value={form.size} onChange={e=>set('size',e.target.value)}>
            <option value="solo">{isNl ? 'Solo-Ondernemer' : 'Solo-Preneur'}</option>
            <option value="startup">{isNl ? 'Startup (1–10)' : 'Startup (1–10)'}</option>
            <option value="team">{isNl ? 'Team (10–50)' : 'Team (10–50)'}</option>
            <option value="enterprise">{isNl ? 'Enterprise (50+)' : 'Enterprise (50+)'}</option>
            <option value="dont-know">{labels.dontKnow}</option>
          </select>
        </div>
      </div>

      <div className="input-wrapper">
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <input type="text" placeholder={labels.name} required className="booking-input" value={form.name} onChange={e=>set('name',e.target.value)} />
      </div>
      <div className="input-wrapper">
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        <input type="email" placeholder={labels.email} required className="booking-input" value={form.email} onChange={e=>set('email',e.target.value)} />
      </div>
      <div className="input-wrapper">
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <input type="tel" placeholder={labels.phone} className="booking-input" value={form.phone} onChange={e=>set('phone',e.target.value)} />
      </div>

      <div>
        <label className="input-label">{labels.note}</label>
        <textarea 
          placeholder={labels.notePlaceholder} 
          className="booking-input" 
          style={{padding:'1rem', minHeight:'80px', width:'100%', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'white'}} 
          value={form.message} 
          onChange={e=>set('message',e.target.value)} 
        />
      </div>

      <button type="submit" className="booking-submit-btn" disabled={loading}>
        <div className="btn-content">
          <span>{loading ? labels.sending : labels.btn}</span>
          {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
        </div>
        <div className="shimmer" />
      </button>
      <p className="form-footer-text" dangerouslySetInnerHTML={{ __html: labels.footer }} />
    </form>
  )
}
