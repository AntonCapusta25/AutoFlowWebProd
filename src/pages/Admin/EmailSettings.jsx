import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

const STATUSES = [
  { key: 'New',                 color: '#f472b6', bg: 'rgba(233,30,99,0.1)',       border: 'rgba(233,30,99,0.2)',       icon: '✨' },
  { key: 'Contacted',          color: '#93c5fd', bg: 'rgba(59,130,246,0.1)',       border: 'rgba(59,130,246,0.2)',      icon: '📞' },
  { key: 'In Progress',        color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',       border: 'rgba(245,158,11,0.2)',      icon: '⚙️' },
  { key: 'Meeting Booked',     color: '#c084fc', bg: 'rgba(168,85,247,0.1)',       border: 'rgba(168,85,247,0.2)',      icon: '🗓️' },
  { key: 'Waiting for Invoice',color: '#67e8f9', bg: 'rgba(6,182,212,0.1)',        border: 'rgba(6,182,212,0.2)',       icon: '📄' },
  { key: 'Converted',          color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)',       border: 'rgba(16,185,129,0.2)',      icon: '🎉' },
  { key: 'Lost',               color: '#f87171', bg: 'rgba(239,68,68,0.1)',        border: 'rgba(239,68,68,0.2)',       icon: '👋' },
]

const VARIABLE_CHIPS = [
  { label: '{{name}}',    desc: 'Lead full name' },
  { label: '{{status}}',  desc: 'New status label' },
  { label: '{{company}}', desc: 'Company name' },
  { label: '{{service}}', desc: 'Requested service' },
]

const DEFAULT_TEMPLATES = {
  'New':                 { subject: "We received your enquiry, {{name}}!", body: "<p>Hi {{name}},</p>\n<p>Thanks for reaching out. We have logged your enquiry and our team will be in touch very soon.</p>\n<p>Best,<br/>AutoFlow Studio</p>" },
  'Contacted':           { subject: "You're on our radar, {{name}}!", body: "<p>Hi {{name}},</p>\n<p>One of our consultants has just reached out to you. Keep an eye on your inbox — exciting things are coming.</p>\n<p>Best,<br/>AutoFlow Studio</p>" },
  'In Progress':         { subject: "Your automation project is underway, {{name}}", body: "<p>Hi {{name}},</p>\n<p>We're actively working on your request. We'll update you shortly with our findings and next steps.</p>\n<p>Best,<br/>AutoFlow Studio</p>" },
  'Meeting Booked':      { subject: "Your strategy call is confirmed, {{name}} 🗓️", body: "<p>Hi {{name}},</p>\n<p>Great news — your strategy call has been confirmed. We look forward to speaking with you and exploring how we can transform your workflow.</p>\n<p>Best,<br/>AutoFlow Studio</p>" },
  'Waiting for Invoice': { subject: "Invoice incoming, {{name}} 📄", body: "<p>Hi {{name}},</p>\n<p>We're preparing your invoice and will send it across shortly. Feel free to reach out if you have any questions in the meantime.</p>\n<p>Best,<br/>AutoFlow Studio</p>" },
  'Converted':           { subject: "Welcome to AutoFlow Studio, {{name}} 🎉", body: "<p>Hi {{name}},</p>\n<p>We're thrilled to welcome you as a client! Our team will be in touch to kick off your automation journey. Get ready to save hours every week.</p>\n<p>Best,<br/>AutoFlow Studio</p>" },
  'Lost':                { subject: "A note from AutoFlow Studio, {{name}}", body: "<p>Hi {{name}},</p>\n<p>Thank you for considering AutoFlow Studio. We understand this might not be the right time — but we're here whenever you're ready to explore automation. Feel free to reach back out any time.</p>\n<p>Best,<br/>AutoFlow Studio</p>" },
}

function interpolatePreview(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `<span style="color:#f59e0b">{{${k}}}</span>`)
}

export default function AdminEmailSettings() {
  const [templates, setTemplates] = useState({})     // { [status]: { subject, body, enabled, id } }
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState({})     // { [status]: bool }
  const [saved, setSaved]         = useState({})     // { [status]: bool } — flash
  const [expanded, setExpanded]   = useState(null)   // which card is open
  const [tab, setTab]             = useState({})     // { [status]: 'edit' | 'preview' }
  const [toast, setToast]         = useState(null)
  const textareaRefs              = useRef({})

  const previewVars = { name: 'Jan de Vries', status: 'Contacted', company: 'Acme BV', service: 'AI Automation' }

  useEffect(() => { fetchTemplates() }, [])

  async function fetchTemplates() {
    setLoading(true)
    const { data, error } = await supabase.from('email_templates').select('*')
    if (!error && data) {
      const map = {}
      data.forEach(row => { map[row.status] = { ...row } })
      // Fill defaults for any missing statuses
      STATUSES.forEach(s => {
        if (!map[s.key]) {
          map[s.key] = { status: s.key, subject: DEFAULT_TEMPLATES[s.key]?.subject || '', body: DEFAULT_TEMPLATES[s.key]?.body || '', enabled: false }
        }
      })
      setTemplates(map)
    }
    setLoading(false)
  }

  function updateField(status, field, value) {
    setTemplates(prev => ({ ...prev, [status]: { ...prev[status], [field]: value } }))
  }

  function insertVariable(status, varLabel) {
    const ta = textareaRefs.current[status]
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const current = templates[status]?.body || ''
    const next = current.slice(0, start) + varLabel + current.slice(end)
    updateField(status, 'body', next)
    // Restore cursor
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + varLabel.length, start + varLabel.length)
    }, 0)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function saveTemplate(status) {
    setSaving(prev => ({ ...prev, [status]: true }))
    const t = templates[status]
    const payload = { status, subject: t.subject, body: t.body, enabled: t.enabled }

    let error
    if (t.id) {
      ;({ error } = await supabase.from('email_templates').update(payload).eq('id', t.id))
    } else {
      const res = await supabase.from('email_templates').insert(payload).select().single()
      error = res.error
      if (!error && res.data) updateField(status, 'id', res.data.id)
    }

    setSaving(prev => ({ ...prev, [status]: false }))
    if (!error) {
      setSaved(prev => ({ ...prev, [status]: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, [status]: false })), 2500)
      showToast(`✅ "${status}" template saved!`)
    } else {
      showToast(`❌ Save failed: ${error.message}`, 'error')
    }
  }

  async function toggleEnabled(status, value) {
    updateField(status, 'enabled', value)
    const t = templates[status]
    if (t?.id) {
      await supabase.from('email_templates').update({ enabled: value }).eq('id', t.id)
    }
    showToast(value ? `✅ "${status}" emails enabled` : `🔕 "${status}" emails disabled`)
  }

  const enabledCount = Object.values(templates).filter(t => t.enabled).length

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid rgba(233,30,99,0.2)', borderTopColor: '#e91e63', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#64748B' }}>Loading templates…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        .template-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .chip-btn:hover { background: rgba(233,30,99,0.15) !important; transform: translateY(-1px); }
        .toggle-track { transition: background 0.2s; cursor: pointer; }
        .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(233,30,99,0.35); }
        .save-btn { transition: all 0.2s; }
        .tab-btn:hover { color: white !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
          background: toast.type === 'error' ? '#1a0404' : '#031a0e',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
          color: toast.type === 'error' ? '#f87171' : '#6ee7b7',
          padding: '14px 24px', borderRadius: '14px', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          animation: 'toastIn 0.3s ease-out'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Email Settings</h1>
          <p style={{ color: '#94A3B8' }}>Configure automated emails sent to leads on status changes.</p>
        </div>
        {/* Stats pill */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '10px 20px', background: enabledCount > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${enabledCount > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, color: enabledCount > 0 ? '#6ee7b7' : '#64748B' }}>
            {enabledCount} / {STATUSES.length} active
          </div>
        </div>
      </div>

      {/* Variable reference strip */}
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Available variables</span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {VARIABLE_CHIPS.map(v => (
            <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(233,30,99,0.06)', border: '1px solid rgba(233,30,99,0.15)', borderRadius: '8px', padding: '6px 12px' }}>
              <code style={{ color: '#f472b6', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}>{v.label}</code>
              <span style={{ color: '#64748B', fontSize: '0.75rem' }}>— {v.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Template Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {STATUSES.map((s, idx) => {
          const t        = templates[s.key] || {}
          const isOpen   = expanded === s.key
          const isSaving = saving[s.key]
          const isSaved  = saved[s.key]
          const currentTab = tab[s.key] || 'edit'

          return (
            <div
              key={s.key}
              className="template-card"
              style={{
                background: '#0a0a0a',
                border: `1px solid ${isOpen ? s.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: isOpen ? `0 0 0 1px ${s.border}, 0 20px 40px rgba(0,0,0,0.3)` : 'none',
                animation: `fadeUp 0.4s ease-out ${idx * 0.05}s both`
              }}
            >
              {/* Card Header — always visible */}
              <div
                onClick={() => setExpanded(isOpen ? null : s.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', cursor: 'pointer', userSelect: 'none' }}
              >
                {/* Status badge */}
                <div style={{ fontSize: '1.3rem', width: '36px', textAlign: 'center', flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'white' }}>{s.key}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '3px 10px', borderRadius: '20px',
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`
                    }}>
                      {t.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '500px' }}>
                    {t.subject || <em>No subject set</em>}
                  </p>
                </div>

                {/* Toggle */}
                <div
                  onClick={e => { e.stopPropagation(); toggleEnabled(s.key, !t.enabled) }}
                  className="toggle-track"
                  title={t.enabled ? 'Disable' : 'Enable'}
                  style={{
                    width: '48px', height: '26px', borderRadius: '13px',
                    background: t.enabled ? '#e91e63' : 'rgba(255,255,255,0.1)',
                    position: 'relative', flexShrink: 0
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: t.enabled ? '25px' : '3px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                  }} />
                </div>

                {/* Chevron */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Expanded editor */}
              {isOpen && (
                <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Subject */}
                    <div>
                      <label style={{ display: 'block', color: '#64748B', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={t.subject || ''}
                        onChange={e => updateField(s.key, 'subject', e.target.value)}
                        placeholder={`Subject for "${s.key}" status…`}
                        style={{
                          width: '100%', padding: '12px 16px',
                          background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px', color: 'white', outline: 'none',
                          fontSize: '0.95rem', fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Body — with tabs */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Email Body (HTML)
                        </label>
                        {/* Tab switcher */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px' }}>
                          {['edit', 'preview'].map(tabKey => (
                            <button
                              key={tabKey}
                              className="tab-btn"
                              onClick={() => setTab(prev => ({ ...prev, [s.key]: tabKey }))}
                              style={{
                                padding: '5px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s',
                                background: currentTab === tabKey ? s.bg : 'transparent',
                                color: currentTab === tabKey ? s.color : '#64748B'
                              }}
                            >
                              {tabKey === 'edit' ? '✏️ Edit' : '👁 Preview'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {currentTab === 'edit' ? (
                        <>
                          {/* Variable insertion chips */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            {VARIABLE_CHIPS.map(v => (
                              <button
                                key={v.label}
                                className="chip-btn"
                                onClick={() => insertVariable(s.key, v.label)}
                                style={{
                                  padding: '4px 12px', background: 'rgba(233,30,99,0.07)',
                                  border: '1px solid rgba(233,30,99,0.2)', borderRadius: '8px',
                                  color: '#f472b6', fontSize: '0.75rem', fontWeight: 700,
                                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'monospace'
                                }}
                                title={`Insert ${v.label}`}
                              >
                                + {v.label}
                              </button>
                            ))}
                          </div>
                          <textarea
                            ref={el => textareaRefs.current[s.key] = el}
                            value={t.body || ''}
                            onChange={e => updateField(s.key, 'body', e.target.value)}
                            placeholder={`<p>Hi {{name}},</p>\n<p>Your status has been updated to ${s.key}.</p>`}
                            style={{
                              width: '100%', height: '220px', padding: '16px',
                              background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '12px', color: '#e2e8f0', outline: 'none',
                              resize: 'vertical', fontFamily: "'Courier New', monospace",
                              fontSize: '0.85rem', lineHeight: 1.7,
                              boxSizing: 'border-box'
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#475569' }}>{(t.body || '').length} chars</span>
                          </div>
                        </>
                      ) : (
                        /* Preview pane */
                        <div style={{
                          minHeight: '220px', background: '#111', border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px', overflow: 'hidden'
                        }}>
                          {/* Mock email header */}
                          <div style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', padding: '20px 24px', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: 'white', fontWeight: 800, fontSize: '1rem' }}>AutoFlow Studio</p>
                          </div>
                          <div style={{ padding: '24px' }}>
                            <p style={{ margin: '0 0 12px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>
                              Subject: <span style={{ color: 'white' }} dangerouslySetInnerHTML={{ __html: interpolatePreview(t.subject || '', previewVars) }} />
                            </p>
                            <div
                              style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.7 }}
                              dangerouslySetInnerHTML={{ __html: interpolatePreview(t.body || '<em style="color:#475569">No body yet…</em>', previewVars) }}
                            />
                          </div>
                          <div style={{ padding: '12px 24px', background: '#0a0a0a', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.7rem' }}>© 2026 AutoFlow Studio</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                          <div
                            onClick={() => toggleEnabled(s.key, !t.enabled)}
                            className="toggle-track"
                            style={{
                              width: '40px', height: '22px', borderRadius: '11px',
                              background: t.enabled ? '#e91e63' : 'rgba(255,255,255,0.1)',
                              position: 'relative'
                            }}
                          >
                            <div style={{
                              position: 'absolute', top: '2px',
                              left: t.enabled ? '20px' : '2px',
                              width: '18px', height: '18px', borderRadius: '50%',
                              background: 'white', transition: 'left 0.2s',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                            }} />
                          </div>
                          <span style={{ color: t.enabled ? '#e91e63' : '#64748B', fontSize: '0.85rem', fontWeight: 700 }}>
                            {t.enabled ? 'Active — emails will send' : 'Inactive — emails paused'}
                          </span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {isSaved && (
                          <span style={{ color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 700, animation: 'fadeUp 0.3s ease-out' }}>
                            ✓ Saved
                          </span>
                        )}
                        <button
                          className="save-btn"
                          onClick={() => saveTemplate(s.key)}
                          disabled={isSaving}
                          style={{
                            padding: '10px 28px',
                            background: isSaved ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #e91e63, #9c27b0)',
                            border: isSaved ? '1px solid rgba(16,185,129,0.4)' : 'none',
                            color: isSaved ? '#6ee7b7' : 'white',
                            borderRadius: '12px', fontWeight: 700, cursor: isSaving ? 'wait' : 'pointer',
                            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
                            opacity: isSaving ? 0.7 : 1,
                          }}
                        >
                          {isSaving ? (
                            <>
                              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                              Saving…
                            </>
                          ) : isSaved ? '✓ Saved' : 'Save Template'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom info box */}
      <div style={{
        marginTop: '40px', padding: '20px 24px',
        background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p style={{ margin: '0 0 4px', color: '#93c5fd', fontWeight: 700, fontSize: '0.9rem' }}>How it works</p>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6 }}>
            When you change a lead's status in <strong style={{ color: '#94A3B8' }}>CRM / Leads</strong>, this system checks if a template is enabled for that status. If yes, an email is automatically sent to the lead using the Gmail API. Use <code style={{ color: '#f472b6', background: 'rgba(233,30,99,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{"{{name}}"}</code>, <code style={{ color: '#f472b6', background: 'rgba(233,30,99,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{"{{status}}"}</code>, <code style={{ color: '#f472b6', background: 'rgba(233,30,99,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{"{{company}}"}</code>, <code style={{ color: '#f472b6', background: 'rgba(233,30,99,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{"{{service}}"}</code> to personalise the content.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
