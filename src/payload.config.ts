import { buildConfig } from 'payload'
import path from 'path'
import { withLexicalEditor } from './payload/utils/withLexicalEditor'

// Database adapter configuration for Vercel compatibility
let dbAdapter;

if (typeof window === 'undefined') {
  // Use PostgreSQL in production (Vercel), SQLite for development
  if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    try {
      const { postgresAdapter } = require('@payloadcms/db-postgres');
      dbAdapter = postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URL,
        },
      });
    } catch (error) {
      console.warn('PostgreSQL adapter not available, falling back to SQLite:', error);
      const { sqliteAdapter } = require('@payloadcms/db-sqlite');
      dbAdapter = sqliteAdapter({
        client: {
          url: 'file:./dev.db',
        },
      });
    }
  } else {
    // Development fallback to SQLite
    try {
      const { sqliteAdapter } = require('@payloadcms/db-sqlite');
      dbAdapter = sqliteAdapter({
        client: {
          url: 'file:./dev.db',
        },
      });
    } catch (error) {
      console.error('SQLite adapter not available:', error);
      dbAdapter = null;
    }
  }
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-secret',
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- ModernMen Admin',
    },
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
        group: 'Admin',
      },
      fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'name', type: 'text' },
        { 
          name: 'role', 
          type: 'select', 
          options: [
            { label: 'Admin', value: 'admin' }, 
            { label: 'Customer', value: 'customer' }, 
            { label: 'Staff', value: 'staff' },
            { label: 'Manager', value: 'manager' },
            { label: 'Barber', value: 'barber' },
            { label: 'Client', value: 'client' }
          ], 
          defaultValue: 'customer', 
          required: true 
        },
        { 
          name: 'tenant', 
          type: 'relationship', 
          relationTo: 'tenants' 
        },
      ],
    },
    {
      slug: 'tenants',
      admin: {
        useAsTitle: 'name',
        group: 'Admin',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'status', type: 'select', options: [
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'suspended' },
          { label: 'Pending', value: 'pending' },
          { label: 'Deactivated', value: 'deactivated' }
        ], defaultValue: 'pending', required: true },
      ],
    },
    {
      slug: 'media',
      admin: {
        useAsTitle: 'filename',
        group: 'Content',
      },
      upload: {
        staticDir: 'media',
        mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
      },
      fields: [
        { name: 'alt', type: 'text' },
        { name: 'caption', type: 'text' },
        { name: 'seoTitle', type: 'text' },
        { name: 'seoDescription', type: 'textarea' },
        { name: 'keywords', type: 'text' },
      ],
    },
    {
      slug: 'settings',
      admin: {
        useAsTitle: 'name',
        group: 'Admin',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'value', type: 'json' },
        { name: 'tenant', type: 'relationship', relationTo: 'tenants' },
      ],
    },
    {
      slug: 'customers',
      admin: {
        useAsTitle: 'email',
        group: 'CRM',
      },
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'tenant', type: 'relationship', relationTo: 'tenants' },
      ],
    },
    {
      slug: 'services',
      admin: {
        useAsTitle: 'name',
        group: 'Services',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'price', type: 'number', required: true },
        { name: 'duration', type: 'number', required: true },
        { name: 'category', type: 'text' },
        { name: 'image', type: 'relationship', relationTo: 'media' },
      ],
    },
    {
      slug: 'stylists',
      admin: {
        useAsTitle: 'name',
        group: 'Staff',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'bio', type: 'textarea' },
        { name: 'profileImage', type: 'relationship', relationTo: 'media' },
        { name: 'user', type: 'relationship', relationTo: 'users' },
        { name: 'isActive', type: 'checkbox', defaultValue: true },
        { name: 'rating', type: 'number', min: 0, max: 5 },
        { name: 'reviewCount', type: 'number', defaultValue: 0 },
        { name: 'experience', type: 'number' },
        { name: 'specialties', type: 'text' }, // Simple text field instead of relationship
      ],
    },
    {
      slug: 'appointments',
      admin: {
        useAsTitle: 'id',
        group: 'CRM',
      },
      fields: [
        { name: 'customer', type: 'relationship', relationTo: 'customers' },
        { name: 'service', type: 'relationship', relationTo: 'services' },
        { name: 'stylist', type: 'relationship', relationTo: 'stylists' },
        { name: 'date', type: 'date', required: true },
        { name: 'status', type: 'select', options: [
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' }
        ]},
      ],
    },
    {
      slug: 'products',
      admin: {
        useAsTitle: 'name',
        group: 'Commerce',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'price', type: 'number', required: true },
        { name: 'category', type: 'text' },
        { name: 'brand', type: 'text' },
        { name: 'sku', type: 'text' },
        { name: 'image', type: 'relationship', relationTo: 'media' },
        { name: 'inStock', type: 'checkbox', defaultValue: true },
        { name: 'featured', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      slug: 'locations',
      admin: {
        useAsTitle: 'name',
        group: 'System',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'address', type: 'textarea' },
        { name: 'phone', type: 'text' },
        { name: 'tenant', type: 'relationship', relationTo: 'tenants' },
        { name: 'active', type: 'checkbox', defaultValue: true },
      ],
    },
    withLexicalEditor({
      slug: 'pages',
      admin: {
        useAsTitle: 'title',
        group: 'Content',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'content', type: 'richText' },
        { name: 'excerpt', type: 'textarea' },
        { name: 'featuredImage', type: 'relationship', relationTo: 'media' },
        { name: 'status', type: 'select', options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' }
        ], defaultValue: 'draft' },
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'tenant', type: 'relationship', relationTo: 'tenants' },
      ],
    }),
  ],
  endpoints: [],
  db: dbAdapter,
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src/payload-types.ts'),
  },
  plugins: [],
})
// End of Selection