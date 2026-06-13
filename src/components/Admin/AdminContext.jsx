import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [salespeople, setSalespeople] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (userId) => {
    if (!userId) return null
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Fallback: create profile if trigger hasn't run
        const fallbackName = user?.email ? user.email.split('@')[0] : 'User'
        const { data: newProf, error: insError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email || '',
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
  }, [user?.email])

  const fetchSalespeople = useCallback(async (isAdmin) => {
    if (!isAdmin) {
      setSalespeople([])
      return
    }
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

    async function checkUser() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!active) return

      if (session?.user) {
        setUser(session.user)
        const prof = await refreshProfile(session.user.id)
        if (prof && active) {
          await fetchSalespeople(prof.role === 'admin')
        }
      } else {
        setUser(null)
        setProfile(null)
        setSalespeople([])
      }
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      
      if (session?.user) {
        setUser(session.user)
        const prof = await refreshProfile(session.user.id)
        if (prof && active) {
          await fetchSalespeople(prof.role === 'admin')
        }
      } else {
        setUser(null)
        setProfile(null)
        setSalespeople([])
      }
      setLoading(false)
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
    refreshProfile: () => refreshProfile(user?.id),
    refreshSalespeople: () => fetchSalespeople(isAdmin)
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
