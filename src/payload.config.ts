// Prevent client-side imports of this config
if (typeof window !== 'undefined') {
  throw new Error('payload.config.ts cannot be imported on the client side');
}

import { buildConfig } from 'payload'
import path from 'path'
import { withLexicalEditor } from './payload/utils/withLexicalEditor'

// Database adapter configuration - Optimized for Neon PostgreSQL
let dbAdapter: any = null;

// Only load database adapter on server-side to prevent webpack bundling issues
if (typeof window === 'undefined') {
  if (process.env.DATABASE_URL) {
    try {
      // Use PostgreSQL for production (optimized for Neon)
      const { postgresAdapter } = require('@payloadcms/db-postgres');

      // Detect database provider
      const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech');
      const isSupabaseDatabase = process.env.DATABASE_URL?.includes('supabase.co');

      dbAdapter = postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URL,
          // Database-specific optimizations
          max: isNeonDatabase ? 10 : 20, // Neon has stricter limits
          min: 2,  // Minimum number of clients in the pool
          idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
          connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
          // SSL configuration
          ssl: (isNeonDatabase || isSupabaseDatabase) ? { rejectUnauthorized: false } : false,
        },
        // Additional optimizations
        push: false, // Disable push mode for better compatibility
      });

      if (isNeonDatabase) {
        console.log('✅ Payload CMS configured for Neon PostgreSQL database');
      } else if (isSupabaseDatabase) {
        console.log('✅ Payload CMS configured for Supabase PostgreSQL database');
      } else {
        console.log('✅ Payload CMS configured for PostgreSQL database');
      }

    } catch (error) {
      console.error('❌ Failed to load PostgreSQL adapter:', error);
      console.error('Please ensure @payloadcms/db-postgres is installed: npm install @payloadcms/db-postgres');
      throw error; // Don't fallback, let the build fail so we know there's an issue
    }
  } else {
    // Development fallback - minimal SQLite setup
    try {
      const { sqliteAdapter } = require('@payloadcms/db-sqlite');
      dbAdapter = sqliteAdapter({
        client: {
          url: 'file:./dev.db',
        },
      });
      console.log('📝 Using SQLite for development (set DATABASE_URL for PostgreSQL/Neon)');
    } catch (error) {
      console.error('❌ Failed to load SQLite adapter:', error);
      throw error;
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