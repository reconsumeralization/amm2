/**
 * Authentication Constants
 *
 * Shared constants and types for authentication system.
 * This file is safe to import in middleware (Edge Runtime).
 */

/**
 * Role hierarchy and permissions
 */
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  BARBER: 'barber',
  CUSTOMER: 'customer',
  SUPER_ADMIN: 'super-admin'
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
  ],
  [ROLES.SUPER_ADMIN]: [
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
export function validateTenantAccess(
  userRole: UserRole | undefined, 
  userTenant: string | undefined, 
  requestedTenant: string | undefined
): boolean {
  if (!userRole || !userTenant || !requestedTenant) return false;
  
  // Only super-admin can access cross-tenant data
  if (userRole === 'super-admin') return true;
  
  // All other roles must match tenant exactly
  return userTenant === requestedTenant;
}