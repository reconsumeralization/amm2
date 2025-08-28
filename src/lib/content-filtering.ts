/**
 * Content Filtering Utilities
 * Handles role-based content filtering and graceful fallback handling
 */

import { DocumentationUser } from '@/lib/documentation-auth'
import { UserRole } from '@/types/documentation'
import { hasDocumentationPermission } from '@/lib/documentation-permissions'

export interface ContentFilter {
  roles?: UserRole[]
  permissions?: string[]
  sections?: string[]
  tags?: string[]
}

export interface FilteredContent {
  id: string
  title: string
  content: string
  metadata: {
    roles: UserRole[]
    permissions: string[]
    sections: string[]
    tags: string[]
    lastModified: Date
    author: string
  }
}

export interface ContentFilterOptions {
  includeRestricted?: boolean
  showPlaceholders?: boolean
  fallbackMessage?: string
}

/**
 * Filter content based on user role and permissions
 */
export function filterContentByRole(
  content: FilteredContent[],
  user: DocumentationUser | null,
  options: ContentFilterOptions = {}
): FilteredContent[] {
  const { includeRestricted = false, showPlaceholders = false } = options

  return content.filter(item => {
    if (includeRestricted) {
      return true // Include all content when explicitly requested
    }
    
    return canUserAccessContent(item, user)
  }).map(item => {
    // Add placeholder content for restricted items if requested
    if (showPlaceholders && !canUserAccessContent(item, user)) {
      return {
        ...item,
        content: options.fallbackMessage || 'This content is restricted based on your current role.',
        metadata: {
          ...item.metadata,
          restricted: true
        }
      }
    }

    return item
  })
}

/**
 * Check if user can access specific content
 */
export function canUserAccessContent(
  content: FilteredContent,
  user: DocumentationUser | null
): boolean {
  // Public content (no restrictions)
  if (
    content.metadata.roles.length === 0 &&
    content.metadata.permissions.length === 0 &&
    content.metadata.sections.length === 0
  ) {
    return true
  }

  if (!user) {
    return false
  }

  // If any access method passes, user can access content
  let hasAccess = false

  // Check role access
  if (content.metadata.roles.length > 0) {
    hasAccess = hasAccess || content.metadata.roles.includes(user.role)
  }

  // Check permission access
  if (content.metadata.permissions.length > 0) {
    const hasPermission = content.metadata.permissions.some(
      permission => user.permissions.includes(permission)
    )
    hasAccess = hasAccess || hasPermission
  }

  // Check section access
  if (content.metadata.sections.length > 0) {
    const hasSectionAccess = content.metadata.sections.some(
      section => hasDocumentationPermission(user.role, section, 'read')
    )
    hasAccess = hasAccess || hasSectionAccess
  }

  // If no restrictions are specified but we got here, default to accessible
  if (
    content.metadata.roles.length === 0 &&
    content.metadata.permissions.length === 0 &&
    content.metadata.sections.length === 0
  ) {
    hasAccess = true
  }

  return hasAccess
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationItems(
  navigationItems: any[],
  user: DocumentationUser | null
): any[] {
  return navigationItems.filter(item => {
    // Check if user can access the main item
    if (item.requiredRole && (!user || !item.requiredRole.includes(user.role))) {
      return false
    }

    if (item.requiredPermission && (!user || !user.permissions.includes(item.requiredPermission))) {
      return false
    }

    // Filter sub-items
    if (item.children) {
      item.children = filterNavigationItems(item.children, user)
      // Remove parent if no accessible children
      return item.children.length > 0
    }

    return true
  })
}

/**
 * Get content access summary for user
 */
export function getContentAccessSummary(
  user: DocumentationUser | null
): {
  accessibleSections: string[]
  restrictedSections: string[]
  permissions: string[]
  role: UserRole | null
} {
  if (!user) {
    return {
      accessibleSections: ['shared', 'business.customer'],
      restrictedSections: ['developer', 'admin', 'business.owner', 'business.employee'],
      permissions: [],
      role: null
    }
  }

  const allSections = [
    'developer',
    'business',
    'business.owner',
    'business.employee',
    'business.customer',
    'admin',
    'shared'
  ]

  const accessibleSections = allSections.filter(section =>
    hasDocumentationPermission(user.role, section, 'read')
  )

  const restrictedSections = allSections.filter(section =>
    !hasDocumentationPermission(user.role, section, 'read')
  )

  return {
    accessibleSections,
    restrictedSections,
    permissions: user.permissions,
    role: user.role
  }
}

/**
 * Create content filter from user context
 */
export function createUserContentFilter(user: DocumentationUser | null): ContentFilter {
  if (!user) {
    return {
      roles: ['guest'],
      permissions: [],
      sections: ['shared', 'business.customer'],
      tags: ['public']
    }
  }

  const accessibleSections = getContentAccessSummary(user).accessibleSections

  return {
    roles: [user.role],
    permissions: user.permissions,
    sections: accessibleSections,
    tags: []
  }
}

/**
 * Apply content filter to rch results
 */
export function filterrchResults(
  results: any[],
  user: DocumentationUser | null,
  options: ContentFilterOptions = {}
): any[] {
  const filter = createUserContentFilter(user)

  return results.filter(result => {
    // Check section access
    if (result.section && filter.sections) {
      return filter.sections.some(section => 
        result.section.startsWith(section)
      )
    }

    // Check role access
    if (result.requiredRoles && filter.roles) {
      return result.requiredRoles.some((role: UserRole) => 
        filter.roles!.includes(role)
      )
    }

    // Check permission access
    if (result.requiredPermissions && filter.permissions) {
      return result.requiredPermissions.some((permission: string) =>
        filter.permissions!.includes(permission)
      )
    }

    // Default to accessible if no restrictions
    return true
  })
}

/**
 * Get fallback content for restricted access
 */
export function getRestrictedContentFallback(
  contentType: string,
  userRole: UserRole | null
): {
  title: string
  message: string
  suggestions: string[]
} {
  const roleDisplay = userRole ? userRole.replace('_', ' ') : 'guest'

  const fallbacks = {
    developer: {
      title: 'Developer Documentation Restricted',
      message: `This developer documentation is not accessible with your current role (${roleDisplay}).`,
      suggestions: [
        'Contact your administrator to request developer access',
        'View the shared documentation section',
        'Check the business documentation if you have business access'
      ]
    },
    admin: {
      title: 'Administrator Documentation Restricted',
      message: `This administrator documentation requires system admin privileges.`,
      suggestions: [
        'Contact your system administrator',
        'View documentation sections available to your role',
        'Check the shared resources section'
      ]
    },
    business: {
      title: 'Business Documentation Restricted',
      message: `This business documentation is not accessible with your current role (${roleDisplay}).`,
      suggestions: [
        'Contact your salon owner or manager',
        'View the customer help section',
        'Check the shared resources section'
      ]
    },
    default: {
      title: 'Content Restricted',
      message: `This content is not accessible with your current role (${roleDisplay}).`,
      suggestions: [
        'Sign in with appropriate credentials',
        'Contact your administrator for access',
        'View publicly available documentation'
      ]
    }
  }

  return fallbacks[contentType as keyof typeof fallbacks] || fallbacks.default
}