/**
 * Documentation Authentication and Authorization
 * Handles user authentication, role detection, and permission validation
 */

import { Session } from "next-auth"
import { UserRole } from "@/types/documentation"

export interface DocumentationUser {
  id: string
  email: string
  name: string
  role: UserRole
  permissions: string[]
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    compactMode: boolean
  }
}

/**
 * Extract and validate user role from NextAuth session
 */
export function getUserFromSession(session: any | null): DocumentationUser | null {
  if (!(session as any)?.user) {
    return null
  }

  const userRole = mapSessionRoleToUserRole(((session as any).user as any).role)
  
  return {
    id: ((session as any).user as any).id || ((session as any).user as any).email || 'unknown',
    email: ((session as any).user as any).email || '',
    name: ((session as any).user as any).name || 'Unknown User',
    role: userRole,
    permissions: getRolePermissions(userRole),
    preferences: {
      theme: 'system',
      language: 'en',
      compactMode: false
    }
  }
}

/**
 * Map session role to documentation system role
 */
function mapSessionRoleToUserRole(sessionRole: any): UserRole {
  if (!sessionRole) return 'guest'
  
  const role = String(sessionRole).toLowerCase()
  
  switch (role) {
    case 'admin':
    case 'system_admin':
    case 'systemadmin':
      return 'system_admin'
    case 'developer':
    case 'dev':
      return 'developer'
    case 'barber_owner':
    case 'owner':
    case 'business_owner':
      return 'barber_owner'
    case 'barber_employee':
    case 'employee':
    case 'stylist':
    case 'receptionist':
    case 'staff':
      return 'barber_employee'
    case 'customer':
    case 'barber_customer':
    case 'client':
      return 'barber_customer'
    default:
      return 'guest'
  }
}

/**
 * Get default permissions for a user role
 */
function getRolePermissions(role: UserRole): string[] {
  const basePermissions = ['documentation.read']
  
  switch (role) {
    case 'system_admin':
      return [
        ...basePermissions,
        'documentation.admin',
        'documentation.edit',
        'documentation.create',
        'documentation.delete',
        'analytics.view',
        'users.manage',
        'system.configure'
      ]
    case 'developer':
      return [
        ...basePermissions,
        'documentation.edit',
        'documentation.create',
        'developer.access',
        'api.test',
        'components.playground'
      ]
    case 'barber_owner':
      return [
        ...basePermissions,
        'business.owner.access',
        'business.employee.view',
        'business.customer.view',
        'analytics.business.view',
        'content.business.edit'
      ]
    case 'barber_employee':
      return [
        ...basePermissions,
        'business.employee.access',
        'business.customer.view',
        'workflows.access'
      ]
    case 'barber_customer':
      return [
        ...basePermissions,
        'business.customer.access',
        'booking.access',
        'support.access'
      ]
    case 'guest':
    default:
      return ['documentation.read.public']
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: DocumentationUser | null, permission: string): boolean {
  if (!user) {
    return permission === 'documentation.read.public'
  }
  
  return user.permissions.includes(permission) || user.permissions.includes('documentation.admin')
}

/**
 * Check if user can access a specific path
 */
export function canAccessPath(user: DocumentationUser | null, path: string): boolean {
  if (!user) {
    // Guest access - only public paths
    const publicPaths = [
      '/documentation',
      '/documentation/shared',
      '/documentation/business/customer'
    ]
    return publicPaths.some(publicPath => path.startsWith(publicPath))
  }

  // Check role-based path access
  switch (user.role) {
    case 'system_admin':
      return true // Admin can access everything
      
    case 'developer':
      return path.startsWith('/documentation/developer') ||
             path.startsWith('/documentation/shared') ||
             path === '/documentation'
             
    case 'barber_owner':
      return path.startsWith('/documentation/business') ||
             path.startsWith('/documentation/shared') ||
             path === '/documentation'
             
    case 'barber_employee':
      return path.startsWith('/documentation/business/employee') ||
             path.startsWith('/documentation/business/customer') ||
             path.startsWith('/documentation/shared') ||
             path === '/documentation' ||
             path === '/documentation/business'
             
    case 'barber_customer':
      return path.startsWith('/documentation/business/customer') ||
             path.startsWith('/documentation/shared') ||
             path === '/documentation' ||
             path === '/documentation/business'
             
    case 'guest':
    default:
      return path.startsWith('/documentation/shared') ||
             path.startsWith('/documentation/business/customer') ||
             path === '/documentation'
  }
}

/**
 * Get access denied message for user and path
 */
export function getAccessDeniedMessage(user: DocumentationUser | null, path: string): string {
  if (!user) {
    return "Please sign in to access this documentation section."
  }
  
  const roleDisplayName = user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return `Your role (${roleDisplayName}) does not have permission to access this section. Contact your administrator if you need access.`
}

/**
 * Middleware function to check route access
 */
export function checkRouteAccess(
  session: any | null,
  path: string
): { allowed: boolean; message?: string; redirectTo?: string } {
  const user = getUserFromSession(session as any)
  
  if (!canAccessPath(user, path)) {
    return {
      allowed: false,
      message: getAccessDeniedMessage(user, path),
      redirectTo: user ? '/documentation' : '/auth/signin'
    }
  }
  
  return { allowed: true }
}

/**
 * Get user's default landing page based on role
 */
export function getDefaultLandingPage(user: DocumentationUser | null): string {
  if (!user) {
    return '/documentation'
  }
  
  switch (user.role) {
    case 'system_admin':
      return '/documentation/admin'
    case 'developer':
      return '/documentation/developer'
    case 'barber_owner':
      return '/documentation/business/owner'
    case 'barber_employee':
      return '/documentation/business/employee'
    case 'barber_customer':
      return '/documentation/business/customer'
    case 'guest':
    default:
      return '/documentation'
  }
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions(
  navigation: any[],
  user: DocumentationUser | null
): any[] {
  return navigation.filter(item => {
    if (item.href && !canAccessPath(user, item.href)) {
      return false
    }
    
    // Filter subsections
    if (item.sections) {
      item.sections = item.sections.filter((section: any) => 
        canAccessPath(user, section.href)
      )
      
      // Remove parent if no accessible subsections
      return item.sections.length > 0
    }
    
    return true
  })
}
