import { supabase, supabaseAdmin } from './supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Profile, InsertProfile, UpdateProfile } from '@/types/supabase'

export interface SupabaseAuthUser extends User {
  profile?: Profile
}

export interface AuthState {
  user: SupabaseAuthUser | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export class SupabaseAuth {
  /**
   * Sign up with email and password
   */
  static async signUp(
    email: string,
    password: string,
    metadata?: {
      full_name?: string
      phone?: string
      role?: 'customer' | 'staff' | 'admin'
    }
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error

      // Create profile if signup successful
      if (data.user && !error) {
        await this.createProfile(data.user.id, {
          email,
          full_name: metadata?.full_name || null,
          phone: metadata?.phone || null,
          is_active: true
        })
      }

      return { data, error: null }
    } catch (error) {
      console.error('Supabase signup error:', error)
      return { data: null, error }
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get profile data
      if (data.user) {
        const profile = await this.getProfile(data.user.id)
        return {
          data: {
            ...data,
            user: {
              ...data.user,
              profile
            }
          },
          error: null
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Supabase signin error:', error)
      return { data: null, error }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  static async signInWithProvider(provider: 'google' | 'github' | 'discord') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('OAuth signin error:', error)
      return { data: null, error }
    }
  }

  /**
   * Sign out
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Signout error:', error)
      return { error }
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error }
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Password update error:', error)
      return { error }
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get session error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get current user
   */
  static async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get user error:', error)
      return { data: null, error }
    }
  }

  /**
   * Create user profile
   */
  static async createProfile(userId: string, profile: InsertProfile) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profile
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Create profile error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: UpdateProfile) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete user profile
   */
  static async deleteProfile(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete profile error:', error)
      return { error }
    }
  }

  /**
   * Admin: Create user (requires service role key)
   */
  static async adminCreateUser(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Admin create user error:', error)
      return { data: null, error }
    }
  }

  /**
   * Admin: Delete user (requires service role key)
   */
  static async adminDeleteUser(userId: string) {
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Admin delete user error:', error)
      return { error }
    }
  }

  /**
   * Admin: Update user (requires service role key)
   */
  static async adminUpdateUser(userId: string, updates: any) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Admin update user error:', error)
      return { error }
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Refresh session
   */
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Refresh session error:', error)
      return { data: null, error }
    }
  }

  /**
   * Verify email
   */
  static async verifyOtp(email: string, token: string, type: 'email' | 'recovery' = 'email') {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Verify OTP error:', error)
      return { data: null, error }
    }
  }
}

// React hooks for authentication
import { useState, useEffect } from 'react'

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Get initial session
    SupabaseAuth.getSession().then(({ data, error }) => {
      if (data?.session) {
        SupabaseAuth.getProfile(data.session.user.id).then(profile => {
          setAuthState({
            user: { ...data.session!.user, profile: profile || undefined },
            session: data.session,
            loading: false,
            error: null
          })
        })
      } else {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error
        })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = SupabaseAuth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await SupabaseAuth.getProfile(session.user.id)
          setAuthState({
            user: { ...session.user, profile: profile || undefined },
            session,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    ...authState,
    signUp: SupabaseAuth.signUp,
    signIn: SupabaseAuth.signIn,
    signOut: SupabaseAuth.signOut,
    resetPassword: SupabaseAuth.resetPassword,
    updatePassword: SupabaseAuth.updatePassword,
    refreshSession: SupabaseAuth.refreshSession
  }
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const fetchProfile = async (id: string) => {
    setLoading(true)
    setError(null)

    const fetchedProfile = await SupabaseAuth.getProfile(id)
    if (fetchedProfile) {
      setProfile(fetchedProfile)
    } else {
      setError(new Error('Profile not found') as AuthError)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (userId) {
      fetchProfile(userId)
    }
  }, [userId])

  const updateProfile = async (updates: UpdateProfile) => {
    if (!userId) return { data: null, error: new Error('No user ID provided') as AuthError }

    const result = await SupabaseAuth.updateProfile(userId, updates)
    if (result.data) {
      setProfile(result.data)
    }
    return result
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: userId ? () => fetchProfile(userId) : undefined
  }
}
