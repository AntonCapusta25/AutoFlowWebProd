import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'

export default function TeamManagement() {
  const { isAdmin, salespeople, refreshSalespeople, loading: contextLoading } = useAdmin()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!contextLoading && !isAdmin) {
      navigate('/admin/dashboard')
    }
  }, [isAdmin, contextLoading, navigate])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setMembers(data)
      }
    } catch (err) {
      console.error('Error fetching profiles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchMembers()
    }
  }, [isAdmin])

  const handleRoleChange = async (memberId, newRole) => {
    if (actionLoading) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId)
      if (error) {
        alert('Failed to update role: ' + error.message)
      } else {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
        await refreshSalespeople()
      }
    } catch (err) {
      console.error('Error updating role:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteMember = async (member) => {
    if (!confirm(`Are you sure you want to delete profile for ${member.name || member.email}? Note: This only deletes their CRM profile and RLS permissions; it does not delete their Supabase Auth credentials.`)) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', member.id)
      if (error) {
        alert('Failed to delete profile: ' + error.message)
      } else {
        setMembers(prev => prev.filter(m => m.id !== member.id))
        await refreshSalespeople()
      }
    } catch (err) {
      console.error('Error deleting profile:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (contextLoading || !isAdmin) {
    return (
      <AdminLayout>
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
          <p>Verifying permissions...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Team Members</h1>
          <p style={{ color: '#94A3B8' }}>Manage dashboard users, view profiles, and set roles.</p>
        </div>
        <button 
          onClick={fetchMembers}
          style={{ 
            padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
            color: 'white', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          Refresh
        </button>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</th>
              <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</th>
              <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Date</th>
              <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Role</th>
              <th style={{ padding: '24px 20px', color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading team list...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No team members found in database.</td></tr>
            ) : members.map(member => (
              <tr key={member.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'all 0.2s' }}>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px', 
                      background: member.role === 'admin' ? 'linear-gradient(135deg, #e91e63, #9c27b0)' : member.role === 'Napoleon' ? 'linear-gradient(135deg, #a855f7, #e91e63)' : 'linear-gradient(135deg, #3b82f6, #10b981)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '0.9rem', fontWeight: 800, color: 'white',
                      boxShadow: member.role === 'admin' ? '0 4px 12px rgba(233, 30, 99, 0.2)' : member.role === 'Napoleon' ? '0 4px 12px rgba(168, 85, 247, 0.2)' : '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }}>
                      {(member.name || member.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{member.name || 'No Name'}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>ID: {member.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ color: '#CBD5E1', fontSize: '0.9rem', fontWeight: 600 }}>{member.email}</div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>{new Date(member.created_at).toLocaleDateString([], { dateStyle: 'medium' })}</div>
                </td>
                <td style={{ padding: '20px' }}>
                  <select
                    value={member.role}
                    onChange={e => handleRoleChange(member.id, e.target.value)}
                    disabled={actionLoading}
                    style={{
                      padding: '8px 12px',
                      background: member.role === 'admin' ? 'rgba(233, 30, 99, 0.1)' : member.role === 'Napoleon' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      border: `1px solid ${member.role === 'admin' ? 'rgba(233, 30, 99, 0.2)' : member.role === 'Napoleon' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                      borderRadius: '10px',
                      color: member.role === 'admin' ? '#f472b6' : member.role === 'Napoleon' ? '#c084fc' : '#93c5fd',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="Napoleon">Napoleon</option>
                    <option value="salesperson">Salesperson</option>
                  </select>
                </td>
                <td style={{ padding: '20px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDeleteMember(member)}
                    disabled={actionLoading}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Remove profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
