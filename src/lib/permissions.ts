export type UserRole = 'admin' | 'manager' | 'stylist' | 'staff' | 'customer'

export interface Permission {
  resource: string
  actions: string[]
}

export interface RolePermissions {
  [key: string]: Permission[]
}

export const PERMISSIONS: RolePermissions = {
  admin: [
    // User management
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'employees', actions: ['create', 'read', 'update', 'delete', 'manage'] },

    // Appointments
    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete', 'manage', 'view_all'] },

    // Services and business
    { resource: 'services', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'customers', actions: ['create', 'read', 'update', 'delete', 'manage', 'view_all'] },
    { resource: 'commissions', actions: ['create', 'read', 'update', 'delete', 'manage', 'calculate'] },
    { resource: 'inventory', actions: ['create', 'read', 'update', 'delete', 'manage'] },

    // Reports and analytics
    { resource: 'reports', actions: ['read', 'generate', 'export'] },
    { resource: 'analytics', actions: ['read', 'view', 'export'] },

    // System settings
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'system', actions: ['manage', 'backup', 'restore'] }
  ],

  manager: [
    // User management (limited)
    { resource: 'users', actions: ['create', 'read', 'update'] },
    { resource: 'employees', actions: ['read', 'update'] },

    // Appointments
    { resource: 'appointments', actions: ['create', 'read', 'update', 'view_all'] },

    // Services and business
    { resource: 'services', actions: ['create', 'read', 'update'] },
    { resource: 'customers', actions: ['create', 'read', 'update', 'view_all'] },
    { resource: 'commissions', actions: ['read', 'calculate'] },

    // Reports
    { resource: 'reports', actions: ['read', 'generate'] },
    { resource: 'analytics', actions: ['read', 'view'] }
  ],

  stylist: [
    // Personal profile
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'portfolio', actions: ['create', 'read', 'update'] },

    // Appointments (own and assigned)
    { resource: 'appointments', actions: ['read', 'update'] },

    // Customers (assigned only)
    { resource: 'customers', actions: ['read'] },

    // Services (for reference)
    { resource: 'services', actions: ['read'] },

    // Basic analytics
    { resource: 'analytics', actions: ['read'] }
  ],

  staff: [
    // Basic operations
    { resource: 'appointments', actions: ['create', 'read', 'update'] },
    { resource: 'customers', actions: ['create', 'read', 'update'] },
    { resource: 'services', actions: ['read'] },

    // Personal profile
    { resource: 'profile', actions: ['read', 'update'] }
  ],

  customer: [
    // Personal data
    { resource: 'profile', actions: ['read', 'update'] },

    // Own appointments
    { resource: 'appointments', actions: ['create', 'read', 'update'] },

    // Services (for booking)
    { resource: 'services', actions: ['read'] },

    // Stylists (for selection)
    { resource: 'stylists', actions: ['read'] }
  ]
}

export class PermissionManager {
  private userRole: UserRole

  constructor(role: UserRole) {
    this.userRole = role
  }

  hasPermission(resource: string, action: string): boolean {
    const rolePermissions = PERMISSIONS[this.userRole]
    if (!rolePermissions) return false

    const resourcePermission = rolePermissions.find(p => p.resource === resource)
    if (!resourcePermission) return false

    return resourcePermission.actions.includes(action) ||
           resourcePermission.actions.includes('manage') ||
           (resourcePermission.actions.includes('read') && action === 'view')
  }

  hasAnyPermission(resource: string, actions: string[]): boolean {
    return actions.some(action => this.hasPermission(resource, action))
  }

  getResourcePermissions(resource: string): string[] {
    const rolePermissions = PERMISSIONS[this.userRole]
    if (!rolePermissions) return []

    const resourcePermission = rolePermissions.find(p => p.resource === resource)
    return resourcePermission?.actions || []
  }

  canManageUsers(): boolean {
    return this.hasPermission('users', 'manage')
  }

  canViewAllAppointments(): boolean {
    return this.hasPermission('appointments', 'view_all')
  }

  canManageServices(): boolean {
    return this.hasPermission('services', 'manage')
  }

  canViewReports(): boolean {
    return this.hasPermission('reports', 'read')
  }

  canManageSystem(): boolean {
    return this.hasPermission('system', 'manage')
  }
}

// Utility functions
export function getPermissionManager(role: UserRole): PermissionManager {
  return new PermissionManager(role)
}

export function checkPermission(role: UserRole, resource: string, action: string): boolean {
  const manager = new PermissionManager(role)
  return manager.hasPermission(resource, action)
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    stylist: 'Stylist',
    staff: 'Staff Member',
    customer: 'Customer'
  }
  return displayNames[role] || role
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: 'Full system access with complete control over all features',
    manager: 'Manage operations, staff, and view comprehensive reports',
    stylist: 'Manage personal appointments, portfolio, and customer interactions',
    staff: 'Handle day-to-day operations and customer service',
    customer: 'Book appointments and manage personal profile'
  }
  return descriptions[role] || ''
}

export function getRoleHierarchy(): UserRole[] {
  return ['customer', 'staff', 'stylist', 'manager', 'admin']
}

export function canPromoteRole(currentRole: UserRole, targetRole: UserRole): boolean {
  const hierarchy = getRoleHierarchy()
  const currentIndex = hierarchy.indexOf(currentRole)
  const targetIndex = hierarchy.indexOf(targetRole)

  return currentIndex > targetIndex // Higher index = higher role
}

export function getElevatedRoles(role: UserRole): UserRole[] {
  const hierarchy = getRoleHierarchy()
  const currentIndex = hierarchy.indexOf(role)
  return hierarchy.slice(0, currentIndex) // Return roles below current role
}
