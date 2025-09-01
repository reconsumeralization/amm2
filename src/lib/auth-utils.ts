// src/lib/auth-utils.ts
import { createClient } from '@/lib/supabase/client'

// Authentication interfaces
export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  acceptMarketing?: boolean
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'customer' | 'stylist' | 'manager' | 'admin'
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  isActive: boolean
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: AuthUser
  session?: any
  message: string
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Failed to fetch user profile:', profileError)
    }

    return {
      id: user.id,
      email: user.email || '',
      name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'customer',
      firstName: profile?.first_name || user.user_metadata?.first_name,
      lastName: profile?.last_name || user.user_metadata?.last_name,
      phone: profile?.phone || user.user_metadata?.phone,
      avatar: profile?.avatar_url || user.user_metadata?.avatar_url,
      isActive: profile?.is_active ?? true,
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: user.created_at,
      updatedAt: profile?.updated_at || user.updated_at,
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthUser | null, role: string): boolean {
  if (!user) return false
  return user.role === role
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Check if user has required role or higher
 */
export function hasRoleOrHigher(user: AuthUser | null, role: string): boolean {
  if (!user) return false

  const roleHierarchy = {
    customer: 1,
    stylist: 2,
    manager: 3,
    admin: 4,
  }

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}