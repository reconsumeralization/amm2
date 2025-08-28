import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { searchPlugin } from '@payloadcms/plugin-search';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';
import { stripePlugin } from '@payloadcms/plugin-stripe';

import { Appointments, BusinessDocumentation, Users, Tenants, Media, MediaFolders, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders, Testimonials, Content, EditorTemplates, EditorThemes, EditorPlugins, Gallery, Contacts, LoyaltyProgram } from './collections';

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- ModernMen Admin',
    },
    components: {
      // Custom logo component path - we'll create this
      graphics: {
        Logo: {
          path: '@/components/payload/Logo',
        },
        Icon: {
          path: '@/components/payload/Icon',
        },
      },
    },
    autoLogin: process.env.NODE_ENV === 'development' ? {
      email: 'admin@modernmen.com',
      password: 'admin123',
      prefillOnly: true
    } : false,
  },
  collections: [Appointments, BusinessDocumentation, Users, Tenants, Media, MediaFolders, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders, Testimonials, Content, EditorTemplates, EditorThemes, EditorPlugins, Gallery, Contacts, LoyaltyProgram],
  endpoints: [
    // Custom endpoints will be implemented via Next.js API routes
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/modernmen',
    },
  }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  routes: {
    admin: '/admin',
    api: '/api/admin',
  },
  
  plugins: [],

  // Add CORS configuration
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // Add CSRF protection
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ].filter(Boolean),
});