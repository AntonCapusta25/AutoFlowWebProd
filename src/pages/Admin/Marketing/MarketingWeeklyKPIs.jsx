import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function MarketingWeeklyKPIs({ profile, user }) {
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRow, setEditingRow] = useState(null) // ID of row being edited

  // Form State for Editing
  const [p1Debt, setP1Debt] = useState(0)
  const [p2Proof, setP2Proof] = useState(0)
  const [p3Offer, setP3Offer] = useState(0)
  const [savesShares, setSavesShares] = useState(0)
  const [qualityComments, setQualityComments] = useState(0)
  const [auditComments, setAuditComments] = useState(0)
  const [bookedCalls, setBookedCalls] = useState(0)
  const [founderImpressions, setFounderImpressions] = useState(0)
  const [companyImpressions, setCompanyImpressions] = useState(0)

  const isAdmin = profile?.role === 'admin' || profile?.role === 'Napoleon'

  const fetchKPIs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('marketing_weekly_kpis')
        .select('*')
        .order('week_label', { ascending: true })
      if (!error && data) {
        setKpis(data)
      }
    } catch (err) {
      console.error('Error fetching weekly KPIs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKPIs()
  }, [])

  const startEdit = (row) => {
    if (!isAdmin) return
    setEditingRow(row.id)
    setP1Debt(row.pillar_1_debt_impressions || 0)
    setP2Proof(row.pillar_2_proof_impressions || 0)
    setP3Offer(row.pillar_3_offer_impressions || 0)
    setSavesShares(row.saves_shares || 0)
    setQualityComments(row.quality_comments || 0)
    setAuditComments(row.audit_comments || 0)
    setBookedCalls(row.booked_calls || 0)
    setFounderImpressions(row.founder_impressions || 0)
    setCompanyImpressions(row.company_page_impressions || 0)
  }

  const cancelEdit = () => {
    setEditingRow(null)
  }

  const saveEdit = async (id, weekLabel) => {
    if (!isAdmin) return

    const updates = {
      pillar_1_debt_impressions: Number(p1Debt),
      pillar_2_proof_impressions: Number(p2Proof),
      pillar_3_offer_impressions: Number(p3Offer),
      saves_shares: Number(savesShares),
      quality_comments: Number(qualityComments),
      audit_comments: Number(auditComments),
      booked_calls: Number(bookedCalls),
      founder_impressions: Number(founderImpressions),
      company_page_impressions: Number(companyImpressions),
      updated_at: new Date().toISOString()
    }

    try {
      const { error } = await supabase
        .from('marketing_weekly_kpis')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Log activity to Dashboard feed
      await supabase.from('lead_history').insert({
        lead_id: null,
        lead_type: 'marketing',
        event_type: 'marketing',
        content: `📊 Updated weekly KPI logs for ${weekLabel}`,
        admin_id: user?.id
      })

      setEditingRow(null)
      fetchKPIs()
    } catch (err) {
      alert('Error updating KPI metrics: ' + err.message)
    }
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>
          8-Week Strategy KPI Tracker
        </h3>
        <p style={{ color: '#64748B', margin: 0, fontSize: '0.85rem' }}>
          Weekly performance log. {isAdmin ? 'Double-click or click Edit on any row to input actuals.' : 'Read-only view for sales representatives.'}
        </p>
      </div>

      {loading ? (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Loading KPI sheet metrics...</div>
        </div>
      ) : (
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <th style={{ padding: '16px 20px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Week</th>
                  <th style={{ padding: '16px 12px', color: '#f87171', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Debt (P1) Imp.</th>
                  <th style={{ padding: '16px 12px', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proof (P2) Imp.</th>
                  <th style={{ padding: '16px 12px', color: '#34d399', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offer (P3) Imp.</th>
                  <th style={{ padding: '16px 12px', color: '#fb923c', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saves/Shares</th>
                  <th style={{ padding: '16px 12px', color: '#c084fc', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quality Comments</th>
                  <th style={{ padding: '16px 12px', color: '#f472b6', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Comments</th>
                  <th style={{ padding: '16px 12px', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booked Calls</th>
                  <th style={{ padding: '16px 12px', color: '#818cf8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Founder Imp.</th>
                  <th style={{ padding: '16px 12px', color: '#93c5fd', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Imp.</th>
                  {isAdmin && <th style={{ padding: '16px 20px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {kpis.map(row => {
                  const isEditing = editingRow === row.id

                  return (
                    <tr
                      key={row.id}
                      onDoubleClick={() => !isEditing && startEdit(row)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isEditing ? 'rgba(59, 130, 246, 0.03)' : 'transparent',
                        cursor: isAdmin && !isEditing ? 'pointer' : 'default',
                        transition: 'background 0.2s'
                      }}
                    >
                      {/* Week Label */}
                      <td style={{ padding: '18px 20px', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
                        {row.week_label}
                      </td>

                      {/* Pillar 1 Debt */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={p1Debt} onChange={e => setP1Debt(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.85rem' }}>{(row.pillar_1_debt_impressions || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Pillar 2 Proof */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={p2Proof} onChange={e => setP2Proof(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem' }}>{(row.pillar_2_proof_impressions || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Pillar 3 Offer */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={p3Offer} onChange={e => setP3Offer(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>{(row.pillar_3_offer_impressions || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Saves/Shares */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={savesShares} onChange={e => setSavesShares(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#fb923c', fontWeight: 600, fontSize: '0.85rem' }}>{(row.saves_shares || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Quality Comments */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={qualityComments} onChange={e => setQualityComments(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.85rem' }}>{(row.quality_comments || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Audit Comments */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={auditComments} onChange={e => setAuditComments(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#f472b6', fontWeight: 600, fontSize: '0.85rem' }}>{(row.audit_comments || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Booked Calls */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={bookedCalls} onChange={e => setBookedCalls(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}>{(row.booked_calls || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Founder Imp */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={founderImpressions} onChange={e => setFounderImpressions(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>{(row.founder_impressions || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Company Imp */}
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" value={companyImpressions} onChange={e => setCompanyImpressions(e.target.value)} style={inputStyle} />
                        ) : (
                          <span style={{ color: '#93c5fd', fontWeight: 600, fontSize: '0.85rem' }}>{(row.company_page_impressions || 0).toLocaleString()}</span>
                        )}
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => saveEdit(row.id, row.week_label)}
                                style={{
                                  background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)',
                                  borderRadius: '6px', color: '#34d399', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{
                                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '6px', color: '#CBD5E1', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(row)}
                              style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '6px', color: '#CBD5E1', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: '#0e0e0e',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: 'white',
  padding: '6px 8px',
  fontSize: '0.82rem',
  outline: 'none',
  textAlign: 'left'
}
