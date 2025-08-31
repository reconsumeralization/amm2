/**
 * Authentication Utilities
 *
 * Centralized authentication and authorization utilities
 * for consistent access control across the application.
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { getToken } from 'next-auth/jwt'

/**
 * Role hierarchy and permissions
 */
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  BARBER: 'barber',
  CUSTOMER: 'customer'
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports',
  DELETE_CONTENT: 'delete_content',

  // Manager permissions
  MANAGE_APPOINTMENTS: 'manage_appointments',
  MANAGE_CUSTOMERS: 'manage_customers',
  MANAGE_SERVICES: 'manage_services',
  MANAGE_STAFF: 'manage_staff',

  // Barber permissions
  VIEW_APPOINTMENTS: 'view_appointments',
  MANAGE_OWN_APPOINTMENTS: 'manage_own_appointments',
  VIEW_CUSTOMERS: 'view_customers',

  // Customer permissions
  VIEW_PROFILE: 'view_profile',
  BOOK_APPOINTMENTS: 'book_appointments'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_SERVICES,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.BOOK_APPOINTMENTS
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_SERVICES,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_PROFILE
  ],
  [ROLES.BARBER]: [
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.VIEW_PROFILE
  ],
  [ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.VIEW_APPOINTMENTS
  ]
}

/**
 * Route access control configuration
 */
export const ROUTE_ACCESS = {
  // Public routes (no authentication required)
  PUBLIC: [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/auth/forgot-password',
    '/auth/reset-password'
  ],

  // Protected routes with role requirements
  ADMIN_ONLY: [
    '/admin/page-builder',
    '/admin/analytics',
    '/api/admin'
  ],

  // Admin and Manager access
  ADMIN_MANAGER: [
    '/admin',
    '/admin/dashboard',
    '/admin/editor'
  ],

  // Barber and above
  STAFF_AND_ABOVE: [
    '/portal'
  ]
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole | undefined, permission: Permission): boolean {
  if (!userRole) return false
  const permissions = getRolePermissions(userRole)
  return permissions.includes(permission)
}

/**
 * Check if a user can access a route
 */
export function canAccessRoute(userRole: UserRole | undefined, pathname: string): boolean {
  // Public routes are always accessible
  if (ROUTE_ACCESS.PUBLIC.some(route => pathname.startsWith(route))) {
    return true
  }

  // Admin-only routes
  if (ROUTE_ACCESS.ADMIN_ONLY.some(route => pathname.startsWith(route))) {
    return userRole === ROLES.ADMIN
  }

  // Admin and Manager routes
  if (ROUTE_ACCESS.ADMIN_MANAGER.some(route => pathname.startsWith(route))) {
    return userRole === ROLES.ADMIN || userRole === ROLES.MANAGER
  }

  // Staff and above routes
  if (ROUTE_ACCESS.STAFF_AND_ABOVE.some(route => pathname.startsWith(route))) {
    return userRole === ROLES.ADMIN || userRole === ROLES.MANAGER || userRole === ROLES.BARBER
  }

  // Default: require authentication
  return userRole !== undefined
}

/**
 * Validate user session on server side
 */
export async function validateServerSession(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
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
      ...session.user,
      id: token.sub!,
      role: token.role as UserRole,
      permissions: getRolePermissions(token.role as UserRole)
    },
    error: null
  }
}

/**
 * Get redirect URL for unauthorized access
 */
export function getUnauthorizedRedirect(role: UserRole | undefined, pathname: string): string {
  // If no role, redirect to sign in
  if (!role) {
    return `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`
  }

  // Based on role, redirect to appropriate dashboard
  switch (role) {
    case ROLES.ADMIN:
    case ROLES.MANAGER:
      return '/admin/dashboard'
    case ROLES.BARBER:
    case ROLES.CUSTOMER:
      return '/portal'
    default:
      return '/'
  }
}

/**
 * Validate tenant access
 */
export function validateTenantAccess(userRole: UserRole | undefined, tenantId: string | undefined): boolean {
  // Admins can access all tenants
  if (userRole === ROLES.ADMIN) {
    return true
  }

  // For other roles, tenant validation would be more complex
  // This is a simplified version
  return tenantId !== undefined
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
