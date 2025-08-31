/**
 * Authentication Utilities
 *
 * Centralized authentication and authorization utilities
 * for consistent access control across the application.
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { getToken } from 'next-auth/jwt'
import { 
  ROLES, 
  PERMISSIONS, 
  ROLE_PERMISSIONS, 
  ROUTE_ACCESS, 
  UserRole, 
  Permission,
  getRolePermissions,
  hasPermission,
  canAccessRoute,
  getUnauthorizedRedirect,
  validateTenantAccess 
} from './auth-constants'

// Re-export everything for backward compatibility
export {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROUTE_ACCESS,
  getRolePermissions,
  hasPermission,
  canAccessRoute,
  getUnauthorizedRedirect,
  validateTenantAccess
}
export type { UserRole, Permission }

/**
 * Validate user session on server side
 */
export async function validateServerSession(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!(session as any)?.user) {
    return { isValid: false, user: null, error: 'No session' }
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  if (!token) {
    return { isValid: false, user: null, error: 'No token' }
  }

  return {
    isValid: true,
    user: {
      ...(session as any).user,
      id: token.sub!,
      role: token.role as UserRole,
      permissions: getRolePermissions(token.role as UserRole)
    },
    error: null
  }
}


/**
 * Create consistent error responses
 */
export function createAuthError(message: string, status: number = 401) {
  return {
    error: message,
    status,
    timestamp: new Date().toISOString()
  }
}

/**
 * Log authentication events
 */
export function logAuthEvent(event: string, data: Record<string, any>) {
  const timestamp = new Date().toISOString()
  console.log(`[AUTH:${event.toUpperCase()}] ${timestamp}`, data)

  // In production, you might want to send this to a logging service
  // or store in database for audit trails
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  const isValid = errors.length === 0
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  if (password.length >= 12 && errors.length <= 1) {
    strength = 'strong'
  } else if (password.length >= 10 && errors.length <= 2) {
    strength = 'medium'
  }

  return { isValid, errors, strength }
}

const authUtils = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROUTE_ACCESS,
  getRolePermissions,
  hasPermission,
  canAccessRoute,
  validateServerSession,
  getUnauthorizedRedirect,
  validateTenantAccess,
  createAuthError,
  logAuthEvent,
  validatePasswordStrength
}

export default authUtils
