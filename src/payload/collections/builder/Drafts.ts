// src/payload/collections/BuilderDrafts.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Drafts: CollectionConfig = withDefaultHooks({
  slug: 'builder-drafts',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Store in-progress pages allowing multiple users to work in parallel',
    defaultColumns: ['name', 'parentPage', 'status', 'lastModifiedBy', 'updatedAt'],
    listSearchableFields: ['name', 'description', 'parentPage'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      // Users can only view drafts they created
      return (req.user as any)?.role === 'editor';
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager', 'editor'].includes((req.user as any)?.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      // Users can only update drafts they created
      return { createdBy: { equals: req.user.id } };
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      // Users can only delete drafts they created
      return { createdBy: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Draft name for identification',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this draft contains',
        rows: 2,
      },
    },
    {
      name: 'parentPage',
      type: 'relationship',
      relationTo: 'builder-pages' as any as any,
      admin: {
        description: 'The published page this draft is based on (optional)',
      },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'builder-templates' as any as any,
      admin: {
        description: 'Template used to create this draft',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Ready to Publish', value: 'ready' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        description: 'Current status of the draft',
      },
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        description: 'Version identifier for this draft',
      },
    },
    {
      name: 'content',
      type: 'group',
      admin: {
        description: 'Draft page content',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Page title',
          },
        },
        {
          name: 'slug',
          type: 'text',
          admin: {
            description: 'Page slug',
          },
        },
        {
          name: 'sections',
          type: 'relationship',
          relationTo: 'builder-sections' as any as any,
          hasMany: true,
          admin: {
            description: 'Sections in this draft',
          },
        },
        {
          name: 'layout',
          type: 'relationship',
          relationTo: 'builder-layouts' as any as any,
          admin: {
            description: 'Layout for this draft',
          },
        },
        {
          name: 'theme',
          type: 'relationship',
          relationTo: 'builder-themes' as any as any,
          admin: {
            description: 'Theme for this draft',
          },
        },
      ],
    },
    {
      name: 'changes',
      type: 'array',
      admin: {
        description: 'List of changes made in this draft',
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
          name: 'changeType',
          type: 'select',
          options: [
            { label: 'Added', value: 'added' },
            { label: 'Modified', value: 'modified' },
            { label: 'Deleted', value: 'deleted' },
            { label: 'Moved', value: 'moved' },
          ],
          defaultValue: 'modified',
          admin: {
            description: 'Type of change',
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
          name: 'timestamp',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
          admin: {
            description: 'When the change was made',
          },
        },
      ],
    },
    {
      name: 'collaborators',
      type: 'relationship',
      relationTo: 'users' as any as any,
      hasMany: true,
      admin: {
        description: 'Users who can edit this draft',
      },
    },
    {
      name: 'reviewers',
      type: 'relationship',
      relationTo: 'users' as any as any,
      hasMany: true,
      admin: {
        description: 'Users assigned to review this draft',
      },
    },
    {
      name: 'reviewComments',
      type: 'array',
      admin: {
        description: 'Review comments and feedback',
      },
      fields: [
        {
          name: 'comment',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Review comment',
          },
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users' as any as any,
          required: true,
          admin: {
            description: 'Comment author',
          },
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Comment', value: 'comment' },
            { label: 'Approval', value: 'approval' },
            { label: 'Rejection', value: 'rejection' },
            { label: 'Suggestion', value: 'suggestion' },
          ],
          defaultValue: 'comment',
          admin: {
            description: 'Type of review feedback',
          },
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
          admin: {
            description: 'When the comment was made',
          },
        },
        {
          name: 'resolved',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this comment has been addressed',
          },
        },
      ],
    },
    {
      name: 'autoSave',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether to auto-save changes',
      },
    },
    {
      name: 'autoSaveInterval',
      type: 'number',
      defaultValue: 30,
      min: 10,
      max: 300,
      admin: {
        condition: (data: any) => data?.autoSave === true,
        description: 'Auto-save interval in seconds',
      },
    },
    {
      name: 'lockExpiresAt',
      type: 'date',
      admin: {
        description: 'When the draft lock expires',
      },
    },
    {
      name: 'lastModifiedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'Last user to modify this draft',
        readOnly: true,
      },
    },
    {
      name: 'publishScheduledAt',
      type: 'date',
      admin: {
        description: 'Scheduled publish date/time',
      },
    },
    {
      name: 'previewUrl',
      type: 'text',
      admin: {
        description: 'URL to preview this draft',
        readOnly: true,
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for organizing drafts',
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
        description: 'Additional metadata about this draft',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }: any) => {
            if (operation === 'create' && !value) {
              return req.user?.id;
            }
            return value;
          },
        ],
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

        // Update last modified by
        if (req.user) {
          data.lastModifiedBy = req.user.id;
        }

        // Auto-generate version if not provided
        if (operation === 'create' && !data.version) {
          const now = new Date();
          const timestamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '');
          data.version = `draft-${timestamp}`;
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
