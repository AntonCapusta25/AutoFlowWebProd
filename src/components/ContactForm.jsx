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

export default function ContactForm() {
  const [form, setForm] = useState({ name:'', email:'', company:'', message:'' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) { showNotification('Please fill in all required fields.','error'); return }
    if (!isValidEmail(form.email)) { showNotification('Please enter a valid email address.','error'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('contact_leads').insert([{
        name: form.name, email: form.email,
        company: form.company, message: form.message,
      }])
      if (error) throw error
      await sendEmailNotification({ type: 'contact', ...form })
      showNotification('✅ Message sent! We\'ll reply within 24 hours.')
      setForm({ name:'', email:'', company:'', message:'' })
    } catch (err) {
      console.error(err)
      showNotification('Error sending message. Please try again.', 'error')
    } finally { setLoading(false) }
  }

  return (
    <form id="contactForm" onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
      <div className="form-group">
        <label htmlFor="cf-name">Name *</label>
        <input id="cf-name" type="text" required value={form.name} onChange={e=>set('name',e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="cf-email">Email *</label>
        <input id="cf-email" type="email" required value={form.email} onChange={e=>set('email',e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" type="text" value={form.company} onChange={e=>set('company',e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="cf-message">What would you like to automate?</label>
        <textarea id="cf-message" rows={4} placeholder="Describe your current manual processes, pain points, or automation ideas…" value={form.message} onChange={e=>set('message',e.target.value)} />
      </div>
      <button type="submit" className="cta-button" style={{width:'100%'}} disabled={loading}>
        {loading ? '⏳ Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
