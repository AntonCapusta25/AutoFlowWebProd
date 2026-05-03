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
  const [activeTab, setActiveTab] = useState('new') // new, history
  const [sentCount, setSentCount] = useState(0)
  const [totalTarget, setTotalTarget] = useState(0)

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

  const handleSend = async (e) => {
    e.preventDefault()
    if (!subject || !content) return alert('Please fill in all fields.')
    
    // 1. Resolve target leads
    setLoading(true)
    let targets = []
    
    try {
      if (targetType === 'all') {
        const { data } = await supabase.from('outreach_leads').select('id, email').neq('status', 'Promoted')
        targets = data || []
      } else if (targetType === 'segment' && selectedSegmentId) {
        const seg = segments.find(s => s.id === selectedSegmentId)
        let query = supabase.from('outreach_leads').select('id, email')
        if (seg.filter_criteria.industry) query = query.ilike('industry', `%${seg.filter_criteria.industry}%`)
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
        // Log in outreach_emails
        await supabase.from('outreach_emails').insert([{
          lead_id: target.id, // may be null for inbound
          campaign_id: campaign.id,
          subject,
          body: content,
          status: 'Sent'
        }])

        // Invoke Edge Function
        await supabase.functions.invoke('send-email', {
          body: { type: 'campaign', recipient: target.email, subject, message: content }
        })
        
        setSentCount(prev => prev + 1)
      }

      await supabase.from('campaigns').update({ status: 'Completed' }).eq('id', campaign.id)
      alert('Campaign successfully launched!')
      fetchData()
      setActiveTab('history')
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Campaign Manager</h1>
          <p style={{ color: '#94A3B8' }}>Proactive outreach and batch email engine.</p>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setActiveTab('new')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'new' ? '#e91e63' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}>New Blast</button>
          <button onClick={() => setActiveTab('history')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'history' ? '#e91e63' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}>History</button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
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
                style={{ padding: '16px', background: 'linear-gradient(135deg, #e91e63, #9c27b0)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
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
                  <span style={{ color: targetType === 'all' ? 'white' : '#94A3B8' }}>All Scraped Leads</span>
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
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {campaigns.map(camp => (
            <div key={camp.id} style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{camp.name}</h3>
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#94A3B8' }}>{camp.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{camp.stats.sent}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>Sent</p>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '12px' }}>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{camp.stats.opened || 0}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#065f46', textTransform: 'uppercase' }}>Opens</p>
                </div>
                <div style={{ background: 'rgba(233, 30, 99, 0.05)', padding: '12px', borderRadius: '12px' }}>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#e91e63' }}>{camp.stats.replied || 0}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#831843', textTransform: 'uppercase' }}>Replies</p>
                </div>
              </div>
              <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#64748B' }}>Launched on {new Date(camp.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
