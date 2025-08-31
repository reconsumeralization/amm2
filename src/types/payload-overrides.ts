// Payload TypeScript overrides and type extensions
// This file provides type extensions and utilities to resolve Payload CMS type issues

import type { User as PayloadUser } from '../payload-types';

// Extended User type with custom properties
export interface ExtendedUser extends PayloadUser {
  role?: 'admin' | 'manager' | 'barber' | 'customer';
  tenant?: {
    id: string;
    [key: string]: any;
  };
}

// Extended Request type for Payload operations
export interface ExtendedPayloadRequest {
  user?: ExtendedUser;
  payload: any;
  [key: string]: any;
}

// Collection slug type that includes all our custom collections
export type ExtendedCollectionSlug = 
  | 'users'
  | 'media'
  | 'settings'
  | 'tenants'
  | 'appointments'
  | 'customers'
  | 'services'
  | 'stylists'
  | 'locations'
  | 'orders'
  | 'products'
  | 'reviews'
  | 'testimonials'
  | 'blog-posts'
  | 'pages'
  | 'navigation-menus'
  | 'tags'
  | 'staff-schedules'
  | 'clock-records'
  | 'commissions'
  | 'time-off-requests'
  | 'staff-roles'
  | 'business-documentation'
  | 'audit-logs'
  | 'webhook-logs'
  | 'notifications'
  | 'push-notifications'
  | 'email-logs'
  | 'chatbot-logs'
  | 'events'
  | 'inventory'
  | 'service-packages'
  | 'wait-list'
  | 'customer-notes'
  | 'customer-tags'
  | 'email-campaigns'
  | 'loyalty-program'
  | 'subscriptions'
  | 'cancellations'
  | 'contacts'
  | 'chat-conversations'
  | 'chat-messages'
  | 'chatbot'
  | 'coupons'
  | 'gift-cards'
  | 'invoices'
  | 'payment-methods'
  | 'promotions'
  | 'returns'
  | 'shipping-methods'
  | 'transactions'
  | 'content'
  | 'gallery'
  | 'media-folders'
  | 'redirects'
  | 'seo-settings'
  | 'editor-templates'
  | 'editor-themes'
  | 'event-tracking'
  | 'feature-flags'
  | 'integrations'
  | 'maintenance-requests'
  | 'page-views'
  | 'resources'
  | 'roles-permissions'
  | 'site-sections'
  | 'builder-pages'
  | 'builder-sections'
  | 'builder-blocks'
  | 'builder-templates'
  | 'builder-themes'
  | 'builder-layouts'
  | 'builder-forms'
  | 'builder-animations'
  | 'builder-seo'
  | 'builder-integrations'
  | 'builder-translations'
  | 'builder-drafts'
  | 'builder-revisions'
  | 'builder-publish-queue'
  | 'builder-conditional-rules'
  | 'builder-dynamic-data'
  | 'builder-global-styles'
  | 'builder-reusable-components'
  | 'builder-block-revisions'
  | 'builder-page-revisions';

// Type-safe collection operation helpers
export function createTypedPayloadOperation<T = any>(collection: string) {
  return {
    find: (payload: any, options: any = {}) => 
      payload.find({ collection: collection as any, ...options }),
    
    findByID: (payload: any, id: string, options: any = {}) => 
      payload.findByID({ collection: collection as any, id, ...options }),
    
    create: (payload: any, data: any, options: any = {}) => 
      payload.create({ collection: collection as any, data, ...options }),
    
    update: (payload: any, id: string, data: any, options: any = {}) => 
      payload.update({ collection: collection as any, id, data, ...options }),
    
    delete: (payload: any, id: string, options: any = {}) => 
      payload.delete({ collection: collection as any, id, ...options }),
  };
}

// Utility functions for common operations
export const PayloadOperations = {
  users: createTypedPayloadOperation('users'),
  appointments: createTypedPayloadOperation('appointments'),
  customers: createTypedPayloadOperation('customers'),
  services: createTypedPayloadOperation('services'),
  stylists: createTypedPayloadOperation('stylists'),
  orders: createTypedPayloadOperation('orders'),
  products: createTypedPayloadOperation('products'),
  media: createTypedPayloadOperation('media'),
  settings: createTypedPayloadOperation('settings'),
  tenants: createTypedPayloadOperation('tenants'),
  locations: createTypedPayloadOperation('locations'),
  reviews: createTypedPayloadOperation('reviews'),
  testimonials: createTypedPayloadOperation('testimonials'),
  auditLogs: createTypedPayloadOperation('audit-logs'),
  webhookLogs: createTypedPayloadOperation('webhook-logs'),
  notifications: createTypedPayloadOperation('notifications'),
  customerTags: createTypedPayloadOperation('customer-tags'),
  servicePackages: createTypedPayloadOperation('service-packages'),
  waitList: createTypedPayloadOperation('wait-list'),
  rolesPermissions: createTypedPayloadOperation('roles-permissions'),
  resources: createTypedPayloadOperation('resources'),
};

// Access control helpers
export function hasRole(user: any, roles: string[]): boolean {
  const userRole = (user as ExtendedUser)?.role;
  return userRole ? roles.includes(userRole) : false;
}

export function isAdmin(user: any): boolean {
  return (user as ExtendedUser)?.role === 'admin';
}

export function isManagerOrAdmin(user: any): boolean {
  const userRole = (user as ExtendedUser)?.role;
  return userRole === 'admin' || userRole === 'manager';
}

export function getTenantId(user: any): string | undefined {
  return (user as ExtendedUser)?.tenant?.id;
}

// Common access patterns
export const AccessPatterns = {
  adminOnly: ({ req }: { req: ExtendedPayloadRequest }) => 
    isAdmin(req.user),
  
  adminOrManager: ({ req }: { req: ExtendedPayloadRequest }) => 
    isManagerOrAdmin(req.user),
  
  adminOrOwner: ({ req }: { req: ExtendedPayloadRequest }) => 
    isAdmin(req.user) || { id: { equals: req.user?.id } },
  
  tenantFiltered: ({ req }: { req: ExtendedPayloadRequest }) => {
    if (isAdmin(req.user)) return true;
    const tenantId = getTenantId(req.user);
    return tenantId ? { tenant: { equals: tenantId } } : false;
  },
  
  staffAccess: ({ req }: { req: ExtendedPayloadRequest }) => 
    hasRole(req.user, ['admin', 'manager', 'barber']),
};

// Relationship helpers for type-safe relationships
export const RelationshipHelpers = {
  toUsers: 'users' as any,
  toMedia: 'media' as any,
  toTenants: 'tenants' as any,
  toCustomers: 'customers' as any,
  toServices: 'services' as any,
  toStylists: 'stylists' as any,
  toLocations: 'locations' as any,
  toOrders: 'orders' as any,
  toProducts: 'products' as any,
  toAppointments: 'appointments' as any,
  toCustomerTags: 'customer-tags' as any,
  toServicePackages: 'service-packages' as any,
  toWaitList: 'wait-list' as any,
  toRolesPermissions: 'roles-permissions' as any,
  toWebhookLogs: 'webhook-logs' as any,
  toAuditLogs: 'audit-logs' as any,
  toResources: 'resources' as any,
  toTransactions: 'transactions' as any,
  toSubscriptions: 'subscriptions' as any,
};

// Hook helpers for common beforeChange and beforeValidate patterns
export const HookHelpers = {
  // Auto-assign tenant if not set and user is not admin
  autoAssignTenant: (data: any, req: ExtendedPayloadRequest) => {
    if (!data.tenant && req.user && !isAdmin(req.user)) {
      const tenantId = getTenantId(req.user);
      if (tenantId) {
        data.tenant = tenantId;
      }
    }
    return data;
  },
  
  // Validate user has access to tenant
  validateTenantAccess: (data: any, req: ExtendedPayloadRequest) => {
    if (isAdmin(req.user)) return true;
    
    const userTenantId = getTenantId(req.user);
    const dataTenantId = data.tenant?.id || data.tenant;
    
    return userTenantId === dataTenantId;
  },
  
  // Set audit fields
  setAuditFields: (data: any, req: ExtendedPayloadRequest, operation: 'create' | 'update') => {
    const now = new Date().toISOString();
    const userId = req.user?.id;
    
    if (operation === 'create') {
      data.createdAt = now;
      data.createdBy = userId;
    }
    
    data.updatedAt = now;
    data.updatedBy = userId;
    
    return data;
  },
};

// Export types for use in collections
export type {
  ExtendedUser as PayloadExtendedUser,
  ExtendedPayloadRequest as PayloadExtendedRequest,
  ExtendedCollectionSlug as PayloadExtendedSlug,
};
