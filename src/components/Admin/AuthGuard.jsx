import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (!session) {
        navigate('/admin/login')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        navigate('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: '#050505', color: '#F8FAFC', fontFamily: "'Space Grotesk', sans-serif" 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 16px', background: '#e91e63' }} />
          <p>Verifying session...</p>
        </div>
      </div>
    )
  }

  return session ? children : null
}
