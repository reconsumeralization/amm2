// Role-Based Access Control Types and Definitions

export type UserRole = 'admin' | 'manager' | 'barber' | 'customer';

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface RoleDefinition {
  name: UserRole;
  description: string;
  permissions: Permission[];
  inherits?: UserRole[];
}

export interface ResourcePolicy {
  resource: string;
  ownerField?: string;
  tenantField?: string;
  publicActions?: string[];
}

// Predefined Roles and Permissions
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    name: 'admin',
    description: 'Full system administrator with all permissions',
    permissions: [
      {
        resource: '*',
        actions: ['*']
      }
    ]
  },
  manager: {
    name: 'manager',
    description: 'Salon manager with operational permissions',
    permissions: [
      // User management (limited)
      {
        resource: 'users',
        actions: ['read', 'create', 'update'],
        conditions: { role_not: 'admin' }
      },
      // Full customer management
      {
        resource: 'customers',
        actions: ['read', 'create', 'update', 'delete']
      },
      // Full appointment management
      {
        resource: 'appointments',
        actions: ['read', 'create', 'update', 'cancel']
      },
      // Staff management (read-only for sensitive data)
      {
        resource: 'staff',
        actions: ['read', 'update'],
        conditions: { exclude_sensitive: true }
      },
      // Service management
      {
        resource: 'services',
        actions: ['read', 'create', 'update']
      },
      // Product management
      {
        resource: 'products',
        actions: ['read', 'create', 'update']
      },
      // Financial operations
      {
        resource: 'payments',
        actions: ['read', 'process']
      },
      {
        resource: 'financial',
        actions: ['read']
      },
      // Analytics and reporting
      {
        resource: 'analytics',
        actions: ['read']
      },
      {
        resource: 'reports',
        actions: ['read', 'generate']
      },
      // Content management
      {
        resource: 'content',
        actions: ['read', 'create', 'update']
      },
      // Settings
      {
        resource: 'settings',
        actions: ['read', 'update']
      }
    ]
  },
  barber: {
    name: 'barber',
    description: 'Barber/stylist with appointment and customer management',
    permissions: [
      // Own appointments
      {
        resource: 'appointments',
        actions: ['read', 'update', 'complete'],
        conditions: { assigned_barber: 'self' }
      },
      // Customer data for own appointments
      {
        resource: 'customers',
        actions: ['read'],
        conditions: { has_appointment_with: 'self' }
      },
      // Services (read-only)
      {
        resource: 'services',
        actions: ['read']
      },
      // Own schedule
      {
        resource: 'schedule',
        actions: ['read', 'update'],
        conditions: { owner: 'self' }
      },
      // Own profile
      {
        resource: 'profile',
        actions: ['read', 'update'],
        conditions: { owner: 'self' }
      },
      // Time tracking
      {
        resource: 'time_tracking',
        actions: ['create', 'update'],
        conditions: { owner: 'self' }
      },
      // Commission tracking
      {
        resource: 'commissions',
        actions: ['read'],
        conditions: { owner: 'self' }
      }
    ]
  },
  customer: {
    name: 'customer',
    description: 'Customer with booking and profile management',
    permissions: [
      // Own appointments
      {
        resource: 'appointments',
        actions: ['read', 'create', 'cancel', 'reschedule'],
        conditions: { owner: 'self' }
      },
      // Own profile
      {
        resource: 'profile',
        actions: ['read', 'update'],
        conditions: { owner: 'self' }
      },
      // Services (read-only)
      {
        resource: 'services',
        actions: ['read']
      },
      // Products (read-only)
      {
        resource: 'products',
        actions: ['read']
      },
      // Loyalty program
      {
        resource: 'loyalty',
        actions: ['read'],
        conditions: { owner: 'self' }
      },
      // Reviews and feedback
      {
        resource: 'reviews',
        actions: ['read', 'create'],
        conditions: { owner: 'self' }
      },
      // Public content
      {
        resource: 'content',
        actions: ['read']
      },
      {
        resource: 'blog',
        actions: ['read']
      }
    ]
  }
};

// Resource Policies
export const RESOURCE_POLICIES: Record<string, ResourcePolicy> = {
  users: {
    resource: 'users',
    ownerField: 'id',
    tenantField: 'tenant',
    publicActions: []
  },
  customers: {
    resource: 'customers',
    ownerField: 'id',
    tenantField: 'tenant',
    publicActions: []
  },
  appointments: {
    resource: 'appointments',
    ownerField: 'customer',
    tenantField: 'tenant',
    publicActions: []
  },
  staff: {
    resource: 'staff',
    ownerField: 'id',
    tenantField: 'tenant',
    publicActions: []
  },
  services: {
    resource: 'services',
    tenantField: 'tenant',
    publicActions: ['read']
  },
  products: {
    resource: 'products',
    tenantField: 'tenant',
    publicActions: ['read']
  },
  content: {
    resource: 'content',
    tenantField: 'tenant',
    publicActions: ['read']
  },
  blog: {
    resource: 'blog',
    tenantField: 'tenant',
    publicActions: ['read']
  }
};

// Permission Checking Utilities
export class PermissionChecker {
  static hasPermission(
    userRole: UserRole,
    action: string,
    resource: string,
    context?: any
  ): boolean {
    const roleDef = ROLE_DEFINITIONS[userRole];
    if (!roleDef) return false;

    // Check if user has wildcard permission for resource
    const wildcardPermission = roleDef.permissions.find(
      p => p.resource === '*' || p.resource === resource
    );

    if (!wildcardPermission) return false;

    // Check if action is allowed
    if (!wildcardPermission.actions.includes('*') &&
        !wildcardPermission.actions.includes(action)) {
      return false;
    }

    // Check conditions if they exist
    if (wildcardPermission.conditions && context) {
      return this.checkConditions(wildcardPermission.conditions, context);
    }

    return true;
  }

  static checkConditions(conditions: Record<string, any>, context: any): boolean {
    for (const [condition, value] of Object.entries(conditions)) {
      switch (condition) {
        case 'owner':
          if (value === 'self' && context.userId !== context.resourceOwnerId) {
            return false;
          }
          break;
        case 'role_not':
          if (context.userRole === value) {
            return false;
          }
          break;
        case 'assigned_barber':
          if (value === 'self' && context.barberId !== context.userId) {
            return false;
          }
          break;
        case 'has_appointment_with':
          if (value === 'self' && !context.appointmentBarberIds?.includes(context.userId)) {
            return false;
          }
          break;
        case 'exclude_sensitive':
          if (value && context.includesSensitive) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  static getAllowedActions(userRole: UserRole, resource: string): string[] {
    const roleDef = ROLE_DEFINITIONS[userRole];
    if (!roleDef) return [];

    const permission = roleDef.permissions.find(
      p => p.resource === '*' || p.resource === resource
    );

    return permission?.actions || [];
  }

  static canAccessResource(
    userRole: UserRole,
    action: string,
    resource: string,
    resourceOwnerId?: string,
    userId?: string,
    tenantId?: string,
    resourceTenantId?: string
  ): boolean {
    // Check basic permission
    if (!this.hasPermission(userRole, action, resource)) {
      return false;
    }

    // Check ownership
    const policy = RESOURCE_POLICIES[resource];
    if (policy?.ownerField && resourceOwnerId && userId) {
      if (resourceOwnerId !== userId && userRole !== 'admin' && userRole !== 'manager') {
        return false;
      }
    }

    // Check tenant isolation
    if (policy?.tenantField && tenantId && resourceTenantId) {
      if (tenantId !== resourceTenantId && userRole !== 'admin') {
        return false;
      }
    }

    // Check public actions
    if (policy?.publicActions?.includes(action)) {
      return true;
    }

    return true;
  }
}

// Export utility functions
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_DEFINITIONS[role]?.permissions || [];
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function isManager(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

export function isStaff(role: UserRole): boolean {
  return role === 'admin' || role === 'manager' || role === 'barber';
}

export function canManageUsers(role: UserRole): boolean {
  return isManager(role);
}

export function canManageAppointments(role: UserRole): boolean {
  return isStaff(role);
}

export function canManageContent(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}
