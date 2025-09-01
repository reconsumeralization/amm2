import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  role?: 'customer' | 'barber' | 'manager' | 'admin'
  avatar?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    if (data.user) {
      const profile = await getUserProfile(data.user.id)
      setUser({
        id: data.user.id,
        email: data.user.email!,
        name: profile?.full_name || profile?.first_name + ' ' + profile?.last_name,
        role: profile?.role || 'customer',
        avatar: profile?.avatar_url
      })
      setIsAuthenticated(true)
    }

    return data
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })

    if (error) throw error

    if (data.user) {
      // Create profile
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.name,
          role: userData.role || 'customer',
          avatar_url: userData.avatar
        })
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    setUser(null)
    setIsAuthenticated(false)
    router.push('/auth/login')
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.name,
        role: updates.role,
        avatar_url: updates.avatar
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    setUser(prev => prev ? { ...prev, ...updates } : null)
    return data
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }

      if (session?.user) {
        const profile = await getUserProfile(session.user.id)
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profile?.full_name || profile?.first_name + ' ' + profile?.last_name,
          role: profile?.role || 'customer',
          avatar: profile?.avatar_url
        })
        setIsAuthenticated(true)
      }

      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getUserProfile(session.user.id)
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.full_name || profile?.first_name + ' ' + profile?.last_name,
            role: profile?.role || 'customer',
            avatar: profile?.avatar_url
          })
          setIsAuthenticated(true)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAuthenticated(false)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword
  }
}
