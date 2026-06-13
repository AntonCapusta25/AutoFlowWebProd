import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [salespeople, setSalespeople] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (userId, email) => {
    if (!userId) return null
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Fallback: create profile if trigger hasn't run
        const fallbackEmail = email || ''
        const fallbackName = fallbackEmail ? fallbackEmail.split('@')[0] : 'User'
        const { data: newProf, error: insError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: fallbackEmail,
            role: 'salesperson',
            name: fallbackName
          })
          .select()
          .single()

        if (!insError && newProf) {
          data = newProf
        }
      }

      if (data) {
        setProfile(data)
        return data
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
    }
    return null
  }, [])

  const fetchSalespeople = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('name')
      if (data) {
        setSalespeople(data)
      }
    } catch (err) {
      console.error('Error fetching salespeople:', err)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function handleAuth(session) {
      if (!active) return
      try {
        if (session?.user) {
          setUser(session.user)
          setLoading(false) // Immediately show dashboard to logged-in user
          const prof = await refreshProfile(session.user.id, session.user.email)
          if (active) {
            await fetchSalespeople()
          }
        } else {
          setUser(null)
          setProfile(null)
          setSalespeople([])
          setLoading(false)
        }
      } catch (err) {
        console.error('Error checking user session:', err)
        setLoading(false)
      }
    }

    // Single auth state change listener (invoked immediately on registration with current session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await handleAuth(session)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshProfile, fetchSalespeople])

  const isAdmin = profile?.role === 'admin'

  const value = {
    user,
    profile,
    isAdmin,
    salespeople,
    loading,
    refreshProfile: () => refreshProfile(user?.id, user?.email),
    refreshSalespeople: () => fetchSalespeople()
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
