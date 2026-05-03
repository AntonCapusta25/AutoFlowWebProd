import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'

export default function AdminSegments() {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newSegment, setNewSegment] = useState({ name: '', industry: '', tag: '' })

  useEffect(() => {
    fetchSegments()
  }, [])

  async function fetchSegments() {
    setLoading(true)
    const { data, error } = await supabase.from('segments').select('*').order('created_at', { ascending: false })
    if (!error) setSegments(data || [])
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    const { error } = await supabase.from('segments').insert([{
      name: newSegment.name,
      filter_criteria: {
        industry: newSegment.industry,
        tag: newSegment.tag
      }
    }])

    if (!error) {
      setNewSegment({ name: '', industry: '', tag: '' })
      setIsCreating(false)
      fetchSegments()
    } else {
      alert('Error creating segment: ' + error.message)
    }
  }

  async function deleteSegment(id) {
    if (!confirm('Are you sure you want to delete this segment?')) return
    const { error } = await supabase.from('segments').delete().eq('id', id)
    if (!error) fetchSegments()
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>CRM / Segments</h1>
          <p style={{ color: '#94A3B8' }}>Create custom groups of leads for targeted outreach.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #e91e63, #9c27b0)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          + New Segment
        </button>
      </div>

      {isCreating && (
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px', marginBottom: '40px' }}>
          <h3 style={{ color: 'white', marginBottom: '24px' }}>Create New Segment</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Segment Name</label>
              <input 
                type="text" required placeholder="e.g. E-commerce Founders"
                style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                value={newSegment.name} onChange={e => setNewSegment({...newSegment, name: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Filter: Industry</label>
              <input 
                type="text" placeholder="e.g. SaaS"
                style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                value={newSegment.industry} onChange={e => setNewSegment({...newSegment, industry: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Filter: Tag</label>
              <input 
                type="text" placeholder="e.g. High Priority"
                style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                value={newSegment.tag} onChange={e => setNewSegment({...newSegment, tag: e.target.value})}
              />
            </div>
            <div style={{ gridColumn: 'span 3', display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" style={{ padding: '12px 32px', background: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Save Segment</button>
              <button type="button" onClick={() => setIsCreating(false)} style={{ padding: '12px 32px', background: 'transparent', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p style={{ color: '#94A3B8' }}>Loading segments...</p>
        ) : segments.length === 0 ? (
          <p style={{ color: '#64748B' }}>No segments created yet. Build one to target specific leads.</p>
        ) : segments.map(seg => (
          <div key={seg.id} style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'white' }}>{seg.name}</h3>
                <button onClick={() => deleteSegment(seg.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5 }}>Delete</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {seg.filter_criteria.industry && (
                  <span style={{ padding: '4px 10px', background: 'rgba(156, 39, 176, 0.15)', color: '#d8b4fe', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Industry: {seg.filter_criteria.industry}
                  </span>
                )}
                {seg.filter_criteria.tag && (
                  <span style={{ padding: '4px 10px', background: 'rgba(233, 30, 99, 0.15)', color: '#f472b6', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Tag: {seg.filter_criteria.tag}
                  </span>
                )}
              </div>
            </div>
            <button style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>View Leads in Segment</button>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
