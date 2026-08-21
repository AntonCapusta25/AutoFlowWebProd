import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

export default function AdminCampaigns() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [targetType, setTargetType] = useState('all') // all, segment, inbound
  const [selectedSegmentId, setSelectedSegmentId] = useState('')
  const [segments, setSegments] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('new') // new, history, import
  const [sentCount, setSentCount] = useState(0)
  const [totalTarget, setTotalTarget] = useState(0)
  
  // Gmail Sync State
  const [isSyncing, setIsSyncing] = useState(false)

  // List Import State
  const [importText, setImportText] = useState('')
  const [importTagName, setImportTagName] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [segs, camps] = await Promise.all([
      supabase.from('segments').select('*'),
      supabase.from('campaigns').select('*').order('created_at', { ascending: false })
    ])
    if (!segs.error) setSegments(segs.data || [])
    if (!camps.error) setCampaigns(camps.data || [])
  }

  const handleSyncReplies = async () => {
    setIsSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { type: 'sync_replies' }
      })
      if (error) throw error
      alert(`Sync completed! ${data?.synced || 0} replies synced from your Gmail inbox.`)
      fetchData()
    } catch (err) {
      console.error(err)
      alert('Failed to sync Gmail replies: ' + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleImportLeads = async (e) => {
    e.preventDefault()
    if (!importText.trim()) return alert('Please enter lead data.')
    
    setImportLoading(true)
    setImportResult(null)

    try {
      const lines = importText.split('\n').map(l => l.trim()).filter(Boolean)
      const parsedLeads = []

      // Simple CSV or plain email parser
      for (const line of lines) {
        // Skip header lines
        if (line.toLowerCase().startsWith('email') || line.toLowerCase().startsWith('"email"')) continue

        const parts = line.split(/[;,]/).map(p => p.replace(/^["']|["']$/g, '').trim())
        const email = parts[0]
        
        // Basic email validator
        if (!email || !email.includes('@') || !email.includes('.')) continue

        const name = parts[1] || 'Prospect'
        const company = parts[2] || null
        const website = parts[3] || null
        const tags = importTagName ? [importTagName.trim()] : ['Imported']

        parsedLeads.push({
          email,
          name,
          company,
          website,
          tags,
          status: 'Scraped'
        })
      }

      if (parsedLeads.length === 0) {
        throw new Error('No valid leads found in the input. Format must contain at least a valid email.')
      }

      // Fetch existing emails to prevent duplicates
      const emailsToCheck = parsedLeads.map(l => l.email)
      const { data: existingLeads } = await supabase
        .from('outreach_leads')
        .select('email')
        .in('email', emailsToCheck)

      const existingEmails = new Set(existingLeads?.map(l => l.email) || [])
      const newLeads = parsedLeads.filter(l => !existingEmails.has(l.email))

      let imported = 0
      if (newLeads.length > 0) {
        const { error: insertErr } = await supabase.from('outreach_leads').insert(newLeads)
        if (insertErr) throw insertErr
        imported = newLeads.length
      }

      // Automatically create a Segment in database if tag was provided
      if (importTagName && imported > 0) {
        const cleanTag = importTagName.trim()
        // Check if segment already exists
        const exists = segments.some(s => s.name.toLowerCase() === cleanTag.toLowerCase())
        if (!exists) {
          await supabase.from('segments').insert([{
            name: cleanTag,
            description: `Imported list with tag: ${cleanTag}`,
            filter_criteria: { tag: cleanTag }
          }])
        }
      }

      setImportResult({
        success: true,
        imported,
        skipped: parsedLeads.length - newLeads.length
      })
      setImportText('')
      setImportTagName('')
      fetchData()
    } catch (err) {
      console.error(err)
      alert('Error importing leads: ' + err.message)
    } finally {
      setImportLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!subject || !content) return alert('Please fill in all fields.')
    
    setLoading(true)
    let targets = []
    
    try {
      if (targetType === 'all') {
        const { data } = await supabase.from('outreach_leads').select('id, email').neq('status', 'Lost')
        targets = data || []
      } else if (targetType === 'segment' && selectedSegmentId) {
        const seg = segments.find(s => s.id === selectedSegmentId)
        let query = supabase.from('outreach_leads').select('id, email')
        if (seg.filter_criteria.industry) {
          query = query.ilike('industry', `%${seg.filter_criteria.industry}%`)
        } else if (seg.filter_criteria.tag) {
          query = query.contains('tags', [seg.filter_criteria.tag])
        }
        const { data } = await query
        targets = data || []
      } else if (targetType === 'inbound') {
        const { data: b } = await supabase.from('booking_leads').select('email')
        const { data: c } = await supabase.from('contact_leads').select('email')
        targets = [...(b || []), ...(c || [])].map(t => ({ email: t.email }))
      }

      if (targets.length === 0) return alert('No targets found for this selection.')
      if (!confirm(`Ready to send to ${targets.length} recipients?`)) return

      setTotalTarget(targets.length)
      setSentCount(0)

      // 2. Create Campaign Record
      const { data: campaign, error: campError } = await supabase.from('campaigns').insert([{
        name: subject,
        subject_template: subject,
        body_template: content,
        status: 'Active',
        stats: { sent: targets.length, opened: 0, replied: 0 }
      }]).select().single()

      if (campError) throw campError

      // 3. Send and Log
      for (const target of targets) {
        // Log in outreach_emails and retrieve the generated ID for tracking
        const { data: emailLog } = await supabase.from('outreach_emails').insert([{
          lead_id: target.id || null,
          campaign_id: campaign.id,
          subject,
          body: content,
          status: 'Sent'
        }]).select('id').single()

        const emailLogId = emailLog ? emailLog.id : null

        // Invoke Edge Function passing the log ID
        await supabase.functions.invoke('send-email', {
          body: { type: 'campaign', recipient: target.email, subject, message: content, emailLogId }
        })
        
        setSentCount(prev => prev + 1)
      }

      await supabase.from('campaigns').update({ status: 'Completed' }).eq('id', campaign.id)
      alert('Campaign successfully launched!')
      fetchData()
      setActiveTab('history')
      setSubject('')
      setContent('')
    } catch (err) {
      alert('Error launching campaign: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <style>{`
        .campaigns-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 16px;
        }
        .campaigns-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 40px;
        }
        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        .import-box {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px;
          max-width: 800px;
        }
        .stats-rate-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 10px 16px;
        }
        .stats-bar-outer {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          overflow: hidden;
        }
        .stats-bar-inner {
          height: 100%;
          border-radius: 4px;
        }
        @media (max-width: 1024px) {
          .campaigns-grid {
            grid-template-columns: 1fr 280px;
            gap: 24px;
          }
        }
        @media (max-width: 768px) {
          .campaigns-header {
            flex-direction: column;
            align-items: stretch;
          }
          .campaigns-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="campaigns-header">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Outreach Center</h1>
          <p style={{ color: '#94A3B8' }}>Proactive outreach, campaign analytics, and list segmentation.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Gmail Sync Button */}
          <button 
            onClick={handleSyncReplies} 
            disabled={isSyncing}
            style={{ 
              padding: '10px 18px', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              background: isSyncing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              color: 'white', 
              cursor: 'pointer', 
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span>{isSyncing ? '🔄 Syncing Inbox...' : '📥 Sync Gmail Replies'}</span>
          </button>
          
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
            <button onClick={() => setActiveTab('new')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'new' ? '#d1bbfb' : 'transparent', color: activeTab === 'new' ? '#000' : 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>New Blast</button>
            <button onClick={() => setActiveTab('history')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'history' ? '#d1bbfb' : 'transparent', color: activeTab === 'history' ? '#000' : 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Campaigns</button>
            <button onClick={() => setActiveTab('import')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'import' ? '#d1bbfb' : 'transparent', color: activeTab === 'import' ? '#000' : 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Import List</button>
          </div>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="campaigns-grid">
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Subject Line</label>
                <input 
                  type="text" required placeholder="Important update from AutoFlow Studio"
                  style={{ width: '100%', padding: '14px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }}
                  value={subject} onChange={e => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Content (HTML)</label>
                <textarea 
                  required placeholder="Hi {{name}}, we have a solution for {{company}}..."
                  style={{ width: '100%', height: '350px', padding: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                  value={content} onChange={e => setContent(e.target.value)}
                />
              </div>
              <button 
                type="submit" disabled={loading}
                style={{ padding: '16px', background: 'linear-gradient(135deg, #d1bbfb, #5646e4)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? `Launching... (${sentCount}/${totalTarget})` : 'Launch Campaign'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '24px' }}>
              <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Target Audience</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="radio" checked={targetType === 'all'} onChange={() => setTargetType('all')} />
                  <span style={{ color: targetType === 'all' ? 'white' : '#94A3B8' }}>All Outbound Leads</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="radio" checked={targetType === 'inbound'} onChange={() => setTargetType('inbound')} />
                  <span style={{ color: targetType === 'inbound' ? 'white' : '#94A3B8' }}>All Inbound Leads</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="radio" checked={targetType === 'segment'} onChange={() => setTargetType('segment')} />
                  <span style={{ color: targetType === 'segment' ? 'white' : '#94A3B8' }}>Specific Segment</span>
                </label>
                {targetType === 'segment' && (
                  <select 
                    value={selectedSegmentId} onChange={e => setSelectedSegmentId(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', marginTop: '8px' }}
                  >
                    <option value="">-- Choose Segment --</option>
                    {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-grid">
          {campaigns.length === 0 ? (
            <div style={{ padding: '40px', color: '#64748B', gridColumn: '1 / -1', textAlign: 'center' }}>No campaigns found.</div>
          ) : campaigns.map(camp => {
            const stats = camp.stats || { sent: 0, opened: 0, replied: 0 }
            const sent = stats.sent || 0
            const opened = stats.opened || 0
            const replied = stats.replied || 0
            const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0
            const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0

            return (
              <div key={camp.id} style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4 }}>{camp.name}</h3>
                    <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: camp.status === 'Active' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '6px', color: camp.status === 'Active' ? '#60a5fa' : '#94A3B8', fontWeight: 600 }}>{camp.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{sent}</p>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>Sent</p>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.03)', padding: '12px 6px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.05)' }}>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{opened}</p>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>Opens</p>
                    </div>
                    <div style={{ background: 'rgba(59, 130, 246, 0.03)', padding: '12px 6px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.05)' }}>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#3b82f6' }}>{replied}</p>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>Replies</p>
                    </div>
                  </div>

                  {/* Open Rate Bar */}
                  <div className="stats-rate-container">
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, minWidth: '70px' }}>Open Rate:</span>
                    <div className="stats-bar-outer">
                      <div className="stats-bar-inner" style={{ width: `${openRate}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{openRate}%</span>
                  </div>

                  {/* Reply Rate Bar */}
                  <div className="stats-rate-container" style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, minWidth: '70px' }}>Reply Rate:</span>
                    <div className="stats-bar-outer">
                      <div className="stats-bar-inner" style={{ width: `${replyRate}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>{replyRate}%</span>
                  </div>
                </div>

                <p style={{ marginTop: '24px', fontSize: '0.75rem', color: '#475569', margin: '24px 0 0' }}>Launched on {new Date(camp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'import' && (
        <div className="import-box">
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Bulk List Importer</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Paste comma-separated or tab-separated leads below to instantly insert them into your outbound leads database. 
            Format: <code style={{ color: '#d1bbfb' }}>email, name, company, website</code> (one per line). Email is mandatory.
          </p>

          <form onSubmit={handleImportLeads} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Assign Segment Tag Name</label>
              <input 
                type="text" 
                placeholder="e.g. HVAC Phoenix July"
                style={{ width: '100%', padding: '14px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }}
                value={importTagName} 
                onChange={e => setImportTagName(e.target.value)}
              />
              <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: '6px' }}>Leads will be tagged with this segment, and a filter group will be created automatically in your Campaign audience select dropdown.</p>
            </div>

            <div>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Lead Data</label>
              <textarea 
                required 
                placeholder={`john@company.com, John Doe, Company Inc, http://company.com\njane@example.com, Jane Smith`}
                style={{ width: '100%', height: '240px', padding: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5 }}
                value={importText} 
                onChange={e => setImportText(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={importLoading}
              style={{ padding: '16px', background: 'linear-gradient(135deg, #d1bbfb, #5646e4)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', opacity: importLoading ? 0.7 : 1 }}
            >
              {importLoading ? 'Processing & Importing...' : 'Import List'}
            </button>
          </form>

          {importResult && (
            <div style={{ marginTop: '24px', padding: '16px 20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
              <h4 style={{ color: '#10b981', margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 700 }}>Import Complete</h4>
              <p style={{ margin: 0, color: '#a7f3d0', fontSize: '0.8rem', lineHeight: 1.4 }}>
                Successfully imported <strong>{importResult.imported}</strong> new leads to your Outreach Leads.
                {importResult.skipped > 0 && ` Skipped ${importResult.skipped} duplicate or invalid rows.`}
              </p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
