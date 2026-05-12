import { useState } from 'react'
import { supabase, sendEmailNotification } from '../lib/supabase'

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

function showNotification(msg, type = 'success') {
  const n = document.createElement('div')
  n.style.cssText = `position:fixed;top:20px;right:20px;z-index:10000;max-width:400px;padding:16px 20px;border-radius:12px;font-family:Inter,sans-serif;font-weight:500;color:white;box-shadow:0 10px 30px rgba(0,0,0,0.25);backdrop-filter:blur(10px);background:${type==='success'?'linear-gradient(135deg,rgba(34,197,94,0.9),rgba(16,185,129,0.9))':'linear-gradient(135deg,rgba(239,68,68,0.9),rgba(220,38,38,0.9))'}`
  n.textContent = msg
  document.body.appendChild(n)
  setTimeout(() => n.remove(), 5000)
}

export default function ContactForm({ lang = 'en' }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', company:'', message:'', service:'', size:'solo' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const isNl = lang === 'nl'
  const labels = isNl ? {
    name: 'Naam *',
    email: 'Email *',
    phone: 'Telefoonnummer',
    company: 'Bedrijf',
    service: 'Selecteer Service',
    servicePlaceholder: '-- Kies Uw Behoefte --',
    size: 'Bedrijfsgrootte',
    dontKnow: 'Ik weet het nog niet',
    message: 'Aanvullende opmerkingen',
    placeholder: 'Heeft u specifieke vragen of pijnpunten?',
    sending: '⏳ Bezig met verzenden...',
    send: 'Verstuur Bericht',
    success: '✅ Bericht verzonden! We reageren binnen 24 uur.',
    errorFields: 'Vul alle verplichte velden in.',
    errorEmail: 'Voer een geldig e-mailadres in.',
    errorGeneral: 'Fout bij verzenden. Probeer het opnieuw.'
  } : {
    name: 'Name *',
    email: 'Email *',
    phone: 'Phone Number',
    company: 'Company',
    service: 'Select Service',
    servicePlaceholder: '-- Select Your Need --',
    size: 'Business Size',
    dontKnow: 'I don\'t know yet',
    message: 'Additional Notes',
    placeholder: 'Any specific questions or pain points?',
    sending: '⏳ Sending…',
    send: 'Send Message',
    success: '✅ Message sent! We\'ll reply within 24 hours.',
    errorFields: 'Please fill in all required fields.',
    errorEmail: 'Please enter a valid email address.',
    errorGeneral: 'Error sending message. Please try again.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.service) { showNotification(labels.errorFields,'error'); return }
    if (!isValidEmail(form.email)) { showNotification(labels.errorEmail,'error'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('contact_leads').insert([{
        name: form.name, email: form.email, phone: form.phone,
        company: form.company, message: form.message,
        service: form.service, size: form.size
      }])
      if (error) throw error
      await sendEmailNotification({ type: 'contact', ...form })
      showNotification(labels.success)
      setForm({ name:'', email:'', phone:'', company:'', message:'', service:'', size:'solo' })
    } catch (err) {
      console.error(err)
      showNotification(labels.errorGeneral, 'error')
    } finally { setLoading(false) }
  }

  return (
    <form id="contactForm" onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
        <div className="form-group">
          <label className="input-label" htmlFor="cf-service">{labels.service}</label>
          <div className="input-wrapper">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>
            <select className="booking-select" id="cf-service" required value={form.service} onChange={e=>set('service',e.target.value)}>
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
        <div className="form-group">
          <label className="input-label" htmlFor="cf-size">{labels.size}</label>
          <div className="input-wrapper">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <select className="booking-select" id="cf-size" required value={form.size} onChange={e=>set('size',e.target.value)}>
              <option value="solo">{isNl ? 'Solo-Ondernemer' : 'Solo-Preneur'}</option>
              <option value="startup">{isNl ? 'Startup (1–10)' : 'Startup (1–10)'}</option>
              <option value="team">{isNl ? 'Team (10–50)' : 'Team (10–50)'}</option>
              <option value="enterprise">{isNl ? 'Enterprise (50+)' : 'Enterprise (50+)'}</option>
              <option value="dont-know">{labels.dontKnow}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="input-label">{labels.name}</label>
        <div className="input-wrapper">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <input type="text" required value={form.name} onChange={e=>set('name',e.target.value)} className="booking-input" />
        </div>
      </div>
      <div className="form-group">
        <label className="input-label">{labels.email}</label>
        <div className="input-wrapper">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <input type="email" required value={form.email} onChange={e=>set('email',e.target.value)} className="booking-input" />
        </div>
      </div>
      <div className="form-group">
        <label className="input-label">{labels.phone}</label>
        <div className="input-wrapper">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} className="booking-input" />
        </div>
      </div>
      <div className="form-group">
        <label className="input-label">{labels.company}</label>
        <div className="input-wrapper">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
          <input type="text" value={form.company} onChange={e=>set('company',e.target.value)} className="booking-input" />
        </div>
      </div>
      <div className="form-group">
        <label className="input-label">{labels.message}</label>
        <textarea rows={4} placeholder={labels.placeholder} value={form.message} onChange={e=>set('message',e.target.value)} className="booking-input" style={{padding:'1rem', minHeight:'120px', borderRadius:'12px'}} />
      </div>
      <button type="submit" className="cta-button" style={{width:'100%', height:'56px'}} disabled={loading}>
        {loading ? labels.sending : labels.send}
      </button>
    </form>
  )
}
