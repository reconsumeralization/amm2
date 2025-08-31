// Payload CMS helper functions and utilities
// This file provides common utilities and type-safe wrappers for Payload operations

import type { 
  ExtendedUser, 
  ExtendedPayloadRequest, 
  ExtendedCollectionSlug 
} from '@/types/payload-overrides';

// Type-safe user role checking
export function getUserRole(user: any): string | null {
  return (user as ExtendedUser)?.role || null;
}

export function getUserTenant(user: any): string | null {
  return (user as ExtendedUser)?.tenant?.id || null;
}

export function isUserAdmin(user: any): boolean {
  return getUserRole(user) === 'admin';
}

export function isUserManagerOrAdmin(user: any): boolean {
  const role = getUserRole(user);
  return role === 'admin' || role === 'manager';
}

export function isUserStaff(user: any): boolean {
  const role = getUserRole(user);
  return ['admin', 'manager', 'barber'].includes(role || '');
}

// Type-safe Payload operations
export async function findDocuments(payload: any, collection: string, options: any = {}) {
  return payload.find({
    collection: collection as any,
    ...options
  });
}

export async function findDocumentById(payload: any, collection: string, id: string, options: any = {}) {
  return payload.findByID({
    collection: collection as any,
    id,
    ...options
  });
}

export async function createDocument(payload: any, collection: string, data: any, options: any = {}) {
  return payload.create({
    collection: collection as any,
    data,
    ...options
  });
}

export async function updateDocument(payload: any, collection: string, id: string, data: any, options: any = {}) {
  return payload.update({
    collection: collection as any,
    id,
    data,
    ...options
  });
}

export async function deleteDocument(payload: any, collection: string, id: string, options: any = {}) {
  return payload.delete({
    collection: collection as any,
    id,
    ...options
  });
}

// Access control helpers
export function createAccessControl() {
  return {
    adminOnly: ({ req }: { req: ExtendedPayloadRequest }) => {
      return isUserAdmin(req.user);
    },

    adminOrManager: ({ req }: { req: ExtendedPayloadRequest }) => {
      return isUserManagerOrAdmin(req.user);
    },

    adminOrOwner: ({ req }: { req: ExtendedPayloadRequest }) => {
      if (isUserAdmin(req.user)) return true;
      return { id: { equals: req.user?.id } };
    },

    tenantFiltered: ({ req }: { req: ExtendedPayloadRequest }) => {
      if (isUserAdmin(req.user)) return true;
      const tenantId = getUserTenant(req.user);
      return tenantId ? { tenant: { equals: tenantId } } : false;
    },

    staffOnly: ({ req }: { req: ExtendedPayloadRequest }) => {
      return isUserStaff(req.user);
    }
  };
}

// Field helpers
export function createTenantField(required = true) {
  return {
    name: 'tenant',
    type: 'relationship' as const,
    relationTo: 'tenants' as any,
    required,
    index: true,
    admin: {
      description: 'Business this record belongs to',
      condition: (data: any, siblingData: any, { user }: { user: any }) => 
        isUserAdmin(user),
    },
  };
}

export function createUserRelationField(name = 'user', required = false) {
  return {
    name,
    type: 'relationship' as const,
    relationTo: 'users' as any,
    required,
    index: true,
  };
}

export function createMediaRelationField(name = 'image', required = false) {
  return {
    name,
    type: 'relationship' as const,
    relationTo: 'media' as any,
    required,
  };
}

// Common hooks
export function createBeforeChangeHook(collection: string) {
  return async ({ data, req, operation }: any) => {
    // Auto-assign tenant if not set and user is not admin
    if (!data.tenant && req.user && !isUserAdmin(req.user)) {
      const tenantId = getUserTenant(req.user);
      if (tenantId) {
        data.tenant = tenantId;
      }
    }

    // Set audit fields
    const now = new Date().toISOString();
    const userId = req.user?.id;

    if (operation === 'create') {
      data.createdAt = now;
      data.createdBy = userId;
    }

    data.updatedAt = now;
    data.updatedBy = userId;

    return data;
  };
}

export function createBeforeValidateHook() {
  return async ({ data, req }: any) => {
    // Validate tenant access
    if (!isUserAdmin(req.user) && data.tenant) {
      const userTenantId = getUserTenant(req.user);
      const dataTenantId = typeof data.tenant === 'object' ? data.tenant.id : data.tenant;
      
      if (userTenantId !== dataTenantId) {
        throw new Error('Insufficient permissions for this tenant');
      }
    }

    return data;
  };
}

// Collection configuration helpers
export function createCollectionConfig(slug: string, options: any = {}) {
  const access = createAccessControl();
  
  return {
    slug: slug as any,
    access: {
      read: options.publicRead ? () => true : access.tenantFiltered,
      create: access.adminOrManager,
      update: access.adminOrManager,
      delete: access.adminOnly,
      ...options.access
    },
    hooks: {
      beforeChange: [createBeforeChangeHook(slug)],
      beforeValidate: [createBeforeValidateHook()],
      ...options.hooks
    },
    admin: {
      useAsTitle: options.titleField || 'name',
      defaultColumns: options.defaultColumns || ['name', 'createdAt', 'updatedAt'],
      ...options.admin
    },
    ...options
  };
}

// Export commonly used patterns
export const CommonFields = {
  tenant: createTenantField(),
  optionalTenant: createTenantField(false),
  user: createUserRelationField(),
  createdBy: createUserRelationField('createdBy'),
  updatedBy: createUserRelationField('updatedBy'),
  image: createMediaRelationField(),
  avatar: createMediaRelationField('avatar'),
  
  // Audit fields
  createdAt: {
    name: 'createdAt',
    type: 'date' as const,
    admin: { readOnly: true },
  },
  updatedAt: {
    name: 'updatedAt',
    type: 'date' as const,
    admin: { readOnly: true },
  },
  
  // Common text fields
  name: {
    name: 'name',
    type: 'text' as const,
    required: true,
    index: true,
  },
  description: {
    name: 'description',
    type: 'textarea' as const,
  },
  status: {
    name: 'status',
    type: 'select' as const,
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Draft', value: 'draft' },
      { label: 'Archived', value: 'archived' },
    ],
    defaultValue: 'active',
    index: true,
  },
};

// Export access patterns for easy reuse
export const AccessPatterns = createAccessControl();
