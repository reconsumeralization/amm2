import { DocumentationPermissions, UserRole, NavigationItem, NavigationSection } from '@/types/documentation'

// Define role-based permissions for documentation sections
export const documentationPermissions: DocumentationPermissions = {
  // Developer documentation - accessible to developers and system admins
  'developer': {
    read: ['developer', 'system_admin'],
    edit: ['developer', 'system_admin'],
    admin: ['system_admin']
  },
  'developer.setup': {
    read: ['developer', 'system_admin'],
    edit: ['developer', 'system_admin'],
    admin: ['system_admin']
  },
  'developer.api': {
    read: ['developer', 'system_admin'],
    edit: ['developer', 'system_admin'],
    admin: ['system_admin']
  },
  'developer.components': {
    read: ['developer', 'system_admin'],
    edit: ['developer', 'system_admin'],
    admin: ['system_admin']
  },
  'developer.testing': {
    read: ['developer', 'system_admin'],
    edit: ['developer', 'system_admin'],
    admin: ['system_admin']
  },
  'developer.contributing': {
    read: ['developer', 'system_admin'],
    edit: ['developer', 'system_admin'],
    admin: ['system_admin']
  },

  // Business documentation - role-specific access
  'business': {
    read: ['salon_owner', 'salon_employee', 'salon_customer', 'system_admin'],
    edit: ['salon_owner', 'system_admin'],
    admin: ['system_admin']
  },
  'business.owner': {
    read: ['salon_owner', 'system_admin'],
    edit: ['salon_owner', 'system_admin'],
    admin: ['system_admin']
  },
  'business.employee': {
    read: ['salon_owner', 'salon_employee', 'system_admin'],
    edit: ['salon_owner', 'system_admin'],
    admin: ['system_admin']
  },
  'business.customer': {
    read: ['salon_owner', 'salon_employee', 'salon_customer', 'system_admin', 'guest'],
    edit: ['salon_owner', 'system_admin'],
    admin: ['system_admin']
  },

  // Admin documentation - restricted to system administrators
  'admin': {
    read: ['system_admin'],
    edit: ['system_admin'],
    admin: ['system_admin']
  },
  'admin.deployment': {
    read: ['system_admin'],
    edit: ['system_admin'],
    admin: ['system_admin']
  },
  'admin.monitoring': {
    read: ['system_admin'],
    edit: ['system_admin'],
    admin: ['system_admin']
  },
  'admin.maintenance': {
    read: ['system_admin'],
    edit: ['system_admin'],
    admin: ['system_admin']
  },

  // Shared resources - accessible to all authenticated users
  'shared': {
    read: ['developer', 'salon_owner', 'salon_employee', 'salon_customer', 'system_admin', 'guest'],
    edit: ['developer', 'salon_owner', 'system_admin'],
    admin: ['system_admin']
  },
  'shared.glossary': {
    read: ['developer', 'salon_owner', 'salon_employee', 'salon_customer', 'system_admin', 'guest'],
    edit: ['developer', 'salon_owner', 'system_admin'],
    admin: ['system_admin']
  },
  'shared.troubleshooting': {
    read: ['developer', 'salon_owner', 'salon_employee', 'salon_customer', 'system_admin', 'guest'],
    edit: ['developer', 'salon_owner', 'system_admin'],
    admin: ['system_admin']
  },
  'shared.changelog': {
    read: ['developer', 'salon_owner', 'salon_employee', 'salon_customer', 'system_admin', 'guest'],
    edit: ['developer', 'system_admin'],
    admin: ['system_admin']
  }
}

// Helper function to check if a user has permission for a specific action on a documentation section
export function hasDocumentationPermission(
  userRole: UserRole,
  section: string,
  action: 'read' | 'edit' | 'admin'
): boolean {
  const permissions = documentationPermissions[section]
  if (!permissions) {
    // If no specific permissions are defined, default to guest access for read, no access for edit/admin
    return action === 'read' && userRole === 'guest'
  }
  
  return permissions[action].includes(userRole)
}

// Helper function to get all accessible sections for a user role
export function getAccessibleSections(userRole: UserRole, action: 'read' | 'edit' | 'admin' = 'read'): string[] {
  // Guard against undefined permissions map (unlikely but ensures type safety)
  if (!documentationPermissions) {
    return []
  }

  return Object.keys(documentationPermissions).filter(section =>
    hasDocumentationPermission(userRole, section, action)
  )
}

// Helper function to determine user role from session or context
export function getUserRoleFromSession(session: any): UserRole {
  if (!session?.user) {
    return 'guest'
  }

  // Map session role to documentation user role
  const sessionRole = session.user.role?.toLowerCase()
  
  switch (sessionRole) {
    case 'admin':
    case 'system_admin':
      return 'system_admin'
    case 'developer':
      return 'developer'
    case 'salon_owner':
    case 'owner':
      return 'salon_owner'
    case 'salon_employee':
    case 'employee':
    case 'stylist':
    case 'receptionist':
      return 'salon_employee'
    case 'customer':
    case 'salon_customer':
    case 'client':
      return 'salon_customer'
    default:
      return 'guest'
  }
}

// Helper function to get role-specific navigation items
export function getRoleBasedNavigation(userRole: UserRole): NavigationItem[] {
  const navigation: NavigationItem[] = []

  // Developer section
  if (hasDocumentationPermission(userRole, 'developer', 'read')) {
    navigation.push({
      title: 'Developer',
      href: '/documentation/developer',
      sections: [
        { title: 'Setup & Installation', href: '/documentation/developer/setup' },
        { title: 'API Reference', href: '/documentation/developer/api' },
        { title: 'Components', href: '/documentation/developer/components' },
        { title: 'Testing', href: '/documentation/developer/testing' },
        { title: 'Contributing', href: '/documentation/developer/contributing' }
      ]
    })
  }

  // Business section
  if (hasDocumentationPermission(userRole, 'business', 'read')) {
    const businessSections: NavigationSection[] = []
    
    if (hasDocumentationPermission(userRole, 'business.owner', 'read')) {
      businessSections.push({ title: 'Salon Owner', href: '/documentation/business/owner' })
    }
    
    if (hasDocumentationPermission(userRole, 'business.employee', 'read')) {
      businessSections.push({ title: 'Employee Operations', href: '/documentation/business/employee' })
    }
    
    if (hasDocumentationPermission(userRole, 'business.customer', 'read')) {
      businessSections.push({ title: 'Customer Help', href: '/documentation/business/customer' })
    }

    if (businessSections.length > 0) {
      navigation.push({
        title: 'Business',
        href: '/documentation/business',
        sections: businessSections
      })
    }
  }

  // Admin section
  if (hasDocumentationPermission(userRole, 'admin', 'read')) {
    navigation.push({
      title: 'Administration',
      href: '/documentation/admin',
      sections: [
        { title: 'Deployment', href: '/documentation/admin/deployment' },
        { title: 'Monitoring', href: '/documentation/admin/monitoring' },
        { title: 'Maintenance', href: '/documentation/admin/maintenance' }
      ]
    })
  }

  // Shared resources - always accessible
  navigation.push({
    title: 'Shared Resources',
    href: '/documentation/shared',
    sections: [
      { title: 'Glossary', href: '/documentation/shared/glossary' },
      { title: 'Troubleshooting', href: '/documentation/shared/troubleshooting' },
      { title: 'Changelog', href: '/documentation/shared/changelog' }
    ]
  })

return navigation
}

export function isAdminOrDeveloper(role: UserRole): boolean {
  return role === 'system_admin' || role === 'developer';
}
