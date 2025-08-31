// src/payload/collections/BuilderPageRevisions.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const PageRevisions: CollectionConfig = withDefaultHooks({
  slug: 'builder-page-revisions',
  admin: {
    useAsTitle: 'version',
    group: 'Visual Builder',
    description: 'Track page version history',
    defaultColumns: ['version', 'page', 'changeType', 'changedBy', 'createdAt'],
    listSearchableFields: ['version', 'changeSummary', 'changedBy'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      // Users can only view revisions of pages they can edit
      return { createdBy: { equals: req.user.id } };
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
      name: 'page',
      type: 'relationship',
      relationTo: 'builder-pages' as any as any,
      required: true,
      admin: {
        description: 'The page this revision belongs to',
      },
    },
    {
      name: 'changeType',
      type: 'select',
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Updated', value: 'updated' },
        { label: 'Published', value: 'published' },
        { label: 'Unpublished', value: 'unpublished' },
        { label: 'Archived', value: 'archived' },
        { label: 'Restored', value: 'restored' },
        { label: 'Major Update', value: 'major' },
        { label: 'Minor Update', value: 'minor' },
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
      relationTo: 'builder-page-revisions' as any as any,
      admin: {
        description: 'Previous revision for comparison',
      },
    },
    {
      name: 'snapshot',
      type: 'group',
      admin: {
        description: 'Complete snapshot of the page at this revision',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Page title at this revision',
          },
        },
        {
          name: 'slug',
          type: 'text',
          admin: {
            description: 'Page slug at this revision',
          },
        },
        {
          name: 'content',
          type: 'json',
          admin: {
            description: 'Complete page content snapshot',
          },
        },
        {
          name: 'sections',
          type: 'json',
          admin: {
            description: 'Sections configuration snapshot',
          },
        },
        {
          name: 'blocks',
          type: 'json',
          admin: {
            description: 'Blocks configuration snapshot',
          },
        },
        {
          name: 'layout',
          type: 'json',
          admin: {
            description: 'Layout configuration snapshot',
          },
        },
        {
          name: 'theme',
          type: 'json',
          admin: {
            description: 'Theme configuration snapshot',
          },
        },
        {
          name: 'seo',
          type: 'json',
          admin: {
            description: 'SEO configuration snapshot',
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
      name: 'fileSize',
      type: 'number',
      admin: {
        description: 'Size of this revision in bytes',
        readOnly: true,
      },
    },
    {
      name: 'isMajorVersion',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is a major version (e.g., v1.0, v2.0)',
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
