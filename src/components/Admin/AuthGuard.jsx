import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminProvider, useAdmin } from './AdminContext'

function AuthGuardContent({ children }) {
  const { user, loading } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login')
    }
  }, [user, loading, navigate])

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

  return user ? children : null
}

export default function AuthGuard({ children }) {
  return (
    <AdminProvider>
      <AuthGuardContent>{children}</AuthGuardContent>
    </AdminProvider>
  )
}

