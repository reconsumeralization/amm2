// src/payload/collections/AuditLogs.ts
import type { CollectionConfig, AccessResult } from 'payload'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    group: 'Admin',
    description: 'System audit logs for tracking admin changes and operations',
    defaultColumns: ['action', 'collection', 'user', 'createdAt'],
    listSearchableFields: ['action', 'collection', 'user', 'docID'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      // Only admins can view audit logs
      return (req.user as any)?.role === 'admin'
    },
    create: (): AccessResult => false, // Only allow server-side creation
    update: (): AccessResult => false, // Audit logs should be immutable
    delete: (): AccessResult => false, // Audit logs should never be deleted
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Prevent manual creation/modification
        if (operation === 'create') {
          throw new Error('Audit logs can only be created server-side')
        }
        if (operation === 'update') {
          throw new Error('Audit logs cannot be modified')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Login', value: 'login' },
        { label: 'Logout', value: 'logout' },
        { label: 'Password Change', value: 'password_change' },
        { label: 'Role Change', value: 'role_change' },
        { label: 'Permission Change', value: 'permission_change' },
        { label: 'Data Export', value: 'data_export' },
        { label: 'Bulk Operation', value: 'bulk_operation' },
        { label: 'API Access', value: 'api_access' },
        { label: 'System Operation', value: 'system_operation' },
      ],
      admin: {
        description: 'Type of action that was performed',
      },
    },
    {
      name: 'collection',
      type: 'text',
      index: true,
      admin: {
        description: 'Collection that was affected',
      },
    },
    {
      name: 'docID',
      type: 'text',
      index: true,
      admin: {
        description: 'ID of the document that was affected',
      },
    },
    {
      name: 'user',
      type: 'text',
      index: true,
      admin: {
        description: 'User who performed the action',
      },
    },
    {
      name: 'userId',
      type: 'text',
      admin: {
        description: 'User ID for reference',
      },
    },
    {
      name: 'tenant',
      type: 'text',
      index: true,
      admin: {
        description: 'Tenant context for the action',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the user',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'User agent string',
      },
    },
    {
      name: 'payload',
      type: 'json',
      admin: {
        description: 'Additional data about the action',
      },
    },
    {
      name: 'oldData',
      type: 'json',
      admin: {
        description: 'Previous state of the data (for updates)',
      },
    },
    {
      name: 'newData',
      type: 'json',
      admin: {
        description: 'New state of the data (for updates)',
      },
    },
    {
      name: 'changes',
      type: 'json',
      admin: {
        description: 'Summary of what changed',
      },
    },
    {
      name: 'severity',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      defaultValue: 'low',
      admin: {
        description: 'Severity level of the action',
      },
    },
    {
      name: 'error',
      type: 'textarea',
      admin: {
        description: 'Error message if the action failed',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        description: 'How long the operation took (milliseconds)',
      },
    },
    {
      name: 'requestId',
      type: 'text',
      admin: {
        description: 'Request ID for tracing',
      },
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['action', 'createdAt'] },
    { fields: ['collection', 'docID'] },
    { fields: ['user', 'createdAt'] },
    { fields: ['tenant', 'createdAt'] },
    { fields: ['severity', 'createdAt'] },
  ],
}
