// src/payload/collections/BuilderBlockRevisions.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const BlockRevisions: CollectionConfig = withDefaultHooks({
  slug: 'builder-block-revisions',
  admin: {
    useAsTitle: 'version',
    group: 'Visual Builder',
    description: 'Track block version history',
    defaultColumns: ['version', 'block', 'changeType', 'changedBy', 'createdAt'],
    listSearchableFields: ['version', 'changeSummary', 'changedBy'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      // Users can only view revisions of blocks they can edit
      return (req.user as any)?.role === 'editor';
    },
    create: () => false, // Revisions are created automatically
    update: () => false, // Revisions should not be manually updated
    delete: ({ req }: any) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'version',
      type: 'text',
      required: true,
      admin: {
        description: 'Version identifier (e.g., v1.0, v1.1, auto-generated)',
      },
    },
    {
      name: 'block',
      type: 'relationship',
      relationTo: 'builder-blocks' as any as any,
      required: true,
      admin: {
        description: 'The block this revision belongs to',
      },
    },
    {
      name: 'changeType',
      type: 'select',
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Updated', value: 'updated' },
        { label: 'Cloned', value: 'cloned' },
        { label: 'Deleted', value: 'deleted' },
        { label: 'Restored', value: 'restored' },
        { label: 'Content Changed', value: 'content' },
        { label: 'Style Changed', value: 'style' },
        { label: 'Layout Changed', value: 'layout' },
      ],
      defaultValue: 'updated',
      required: true,
      admin: {
        description: 'Type of change made',
      },
    },
    {
      name: 'changeSummary',
      type: 'textarea',
      admin: {
        description: 'Summary of changes made in this revision',
        rows: 3,
      },
    },
    {
      name: 'changedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      required: true,
      admin: {
        description: 'User who made the changes',
      },
    },
    {
      name: 'previousRevision',
      type: 'relationship',
      relationTo: 'builder-block-revisions' as any as any,
      admin: {
        description: 'Previous revision for comparison',
      },
    },
    {
      name: 'snapshot',
      type: 'group',
      admin: {
        description: 'Complete snapshot of the block at this revision',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Block name at this revision',
          },
        },
        {
          name: 'type',
          type: 'text',
          admin: {
            description: 'Block type at this revision',
          },
        },
        {
          name: 'content',
          type: 'json',
          admin: {
            description: 'Block content snapshot',
          },
        },
        {
          name: 'styling',
          type: 'json',
          admin: {
            description: 'Block styling snapshot',
          },
        },
        {
          name: 'settings',
          type: 'json',
          admin: {
            description: 'Block settings snapshot',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: {
            description: 'Block order at this revision',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Block active status at this revision',
          },
        },
      ],
    },
    {
      name: 'changes',
      type: 'array',
      admin: {
        description: 'Detailed list of changes made',
      },
      fields: [
        {
          name: 'field',
          type: 'text',
          required: true,
          admin: {
            description: 'Field that was changed',
          },
        },
        {
          name: 'oldValue',
          type: 'text',
          admin: {
            description: 'Previous value',
          },
        },
        {
          name: 'newValue',
          type: 'text',
          admin: {
            description: 'New value',
          },
        },
        {
          name: 'changeType',
          type: 'select',
          options: [
            { label: 'Added', value: 'added' },
            { label: 'Modified', value: 'modified' },
            { label: 'Deleted', value: 'deleted' },
            { label: 'Reordered', value: 'reordered' },
          ],
          defaultValue: 'modified',
          admin: {
            description: 'Type of change',
          },
        },
      ],
    },
    {
      name: 'parentSection',
      type: 'relationship',
      relationTo: 'builder-sections' as any as any,
      admin: {
        description: 'Section containing this block at the time of revision',
      },
    },
    {
      name: 'parentPage',
      type: 'relationship',
      relationTo: 'builder-pages' as any as any,
      admin: {
        description: 'Page containing this block at the time of revision',
      },
    },
    {
      name: 'fileSize',
      type: 'number',
      admin: {
        description: 'Size of this revision in bytes',
        readOnly: true,
      },
    },
    {
      name: 'isAutoSave',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this revision was created by auto-save',
      },
    },
    {
      name: 'revertible',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this revision can be reverted to',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for categorizing this revision',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          admin: {
            description: 'Tag name',
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata about this revision',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      admin: {
        position: 'sidebar',
        condition: (data: any, siblingData: any, { user }: any) => user?.role === 'admin',
      },
      hooks: {
        beforeChange: [
          ({ req, value }: any) => {
            if (!value && req.user && (req.user as any)?.role !== 'admin') {
              return (req.user as any)?.tenant?.id;
            }
            return value;
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }: any) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id;
        }

        // Auto-generate version if not provided
        if (operation === 'create' && !data.version) {
          const now = new Date();
          const timestamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '');
          data.version = `v${timestamp}`;
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
