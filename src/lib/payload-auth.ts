import payload from '../payload'
import { supabase } from './supabase'
import type { User, PayloadRequest } from 'payload/types'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: 'admin' | 'customer' | 'staff' | 'manager' | 'barber' | 'client'
  tenantId?: string
  supabaseId?: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  token?: string
  error?: string
}

export class PayloadAuth {
  /**
   * Authenticate user with Payload CMS
   */
  static async authenticateWithPayload(
    email: string,
    password: string,
    req?: PayloadRequest
  ): Promise<AuthResult> {
    try {
      const result = await payload.login({
        collection: 'users',
        data: { email, password },
        req
      })

      if (result.user) {
        const authUser: AuthUser = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || '',
          role: result.user.role || 'customer',
          tenantId: result.user.tenant,
          supabaseId: result.user.supabaseId
        }

        return {
          success: true,
          user: authUser,
          token: result.token
        }
      }

      return {
        success: false,
        error: 'Authentication failed'
      }
    } catch (error) {
      console.error('Payload authentication error:', error)
      return {
        success: false,
        error: error.message || 'Authentication failed'
      }
    }
  }

  /**
   * Register new user in Payload CMS
   */
  static async registerWithPayload(
    userData: {
      email: string
      password: string
      name?: string
      role?: string
      tenantId?: string
    },
    req?: PayloadRequest
  ): Promise<AuthResult> {
    try {
      const result = await payload.create({
        collection: 'users',
        data: {
          email: userData.email,
          password: userData.password,
          name: userData.name || '',
          role: userData.role || 'customer',
          tenant: userData.tenantId
        },
        req
      })

      if (result.doc) {
        const authUser: AuthUser = {
          id: result.doc.id,
          email: result.doc.email,
          name: result.doc.name || '',
          role: result.doc.role || 'customer',
          tenantId: result.doc.tenant
        }

        return {
          success: true,
          user: authUser
        }
      }

      return {
        success: false,
        error: 'Registration failed'
      }
    } catch (error) {
      console.error('Payload registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed'
      }
    }
  }

  /**
   * Verify user token with Payload CMS
   */
  static async verifyToken(token: string, req?: PayloadRequest): Promise<AuthResult> {
    try {
      const result = await payload.verifyJWT({
        token,
        req
      })

      if (result.user) {
        const authUser: AuthUser = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || '',
          role: result.user.role || 'customer',
          tenantId: result.user.tenant,
          supabaseId: result.user.supabaseId
        }

        return {
          success: true,
          user: authUser
        }
      }

      return {
        success: false,
        error: 'Invalid token'
      }
    } catch (error) {
      console.error('Token verification error:', error)
      return {
        success: false,
        error: error.message || 'Token verification failed'
      }
    }
  }

  /**
   * Update user profile in Payload CMS
   */
  static async updateUser(
    userId: string,
    updates: Partial<AuthUser>,
    req?: PayloadRequest
  ): Promise<AuthResult> {
    try {
      const result = await payload.update({
        collection: 'users',
        id: userId,
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.role && { role: updates.role }),
          ...(updates.tenantId && { tenant: updates.tenantId }),
          ...(updates.supabaseId && { supabaseId: updates.supabaseId })
        },
        req
      })

      if (result.doc) {
        const authUser: AuthUser = {
          id: result.doc.id,
          email: result.doc.email,
          name: result.doc.name || '',
          role: result.doc.role || 'customer',
          tenantId: result.doc.tenant,
          supabaseId: result.doc.supabaseId
        }

        return {
          success: true,
          user: authUser
        }
      }

      return {
        success: false,
        error: 'User update failed'
      }
    } catch (error) {
      console.error('User update error:', error)
      return {
        success: false,
        error: error.message || 'User update failed'
      }
    }
  }

  /**
   * Get user by ID from Payload CMS
   */
  static async getUserById(userId: string, req?: PayloadRequest): Promise<AuthUser | null> {
    try {
      const result = await payload.findByID({
        collection: 'users',
        id: userId,
        req
      })

      if (result) {
        return {
          id: result.id,
          email: result.email,
          name: result.name || '',
          role: result.role || 'customer',
          tenantId: result.tenant,
          supabaseId: result.supabaseId
        }
      }

      return null
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  /**
   * Get user by email from Payload CMS
   */
  static async getUserByEmail(email: string, req?: PayloadRequest): Promise<AuthUser | null> {
    try {
      const result = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email
          }
        },
        req
      })

      if (result.docs && result.docs.length > 0) {
        const user = result.docs[0]
        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role || 'customer',
          tenantId: user.tenant,
          supabaseId: user.supabaseId
        }
      }

      return null
    } catch (error) {
      console.error('Get user by email error:', error)
      return null
    }
  }

  /**
   * Link Payload user with Supabase user
   */
  static async linkWithSupabase(payloadUserId: string, supabaseUserId: string): Promise<boolean> {
    try {
      await payload.update({
        collection: 'users',
        id: payloadUserId,
        data: {
          supabaseId: supabaseUserId
        }
      })

      // Also update Supabase profile with Payload ID
      const { error } = await supabase
        .from('profiles')
        .update({ payload_id: payloadUserId })
        .eq('id', supabaseUserId)

      if (error) {
        console.error('Error linking with Supabase:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Link with Supabase error:', error)
      return false
    }
  }

  /**
   * Check if user has required role/permission
   */
  static hasRole(user: AuthUser, requiredRole: string): boolean {
    const roleHierarchy = {
      'client': 1,
      'customer': 2,
      'barber': 3,
      'staff': 4,
      'manager': 5,
      'admin': 6
    }

    const userLevel = roleHierarchy[user.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    return userLevel >= requiredLevel
  }

  /**
   * Check if user belongs to tenant
   */
  static belongsToTenant(user: AuthUser, tenantId: string): boolean {
    return !user.tenantId || user.tenantId === tenantId
  }
}
