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
  
  plugins: [
    formBuilderPlugin({
      fields: {
        payment: false,
      },
      formOverrides: {
        fields: ({ defaultFields }: { defaultFields: any[] }) => [
          ...defaultFields,
          {
            name: 'tenant',
            type: 'relationship',
            relationTo: 'tenants',
            required: true,
            admin: {
              position: 'sidebar',
            },
          },
        ],
      },
    }),
    searchPlugin({
      collections: [
        'appointments',
        'customers',
        'products',
        'services',
        'stylists',
        'testimonials',
        'content',
        'gallery'
      ],
      defaultPriorities: {
        appointments: 10,
        customers: 10,
        products: 10,
        services: 10,
        stylists: 10,
        testimonials: 5,
        content: 5,
        gallery: 5,
      },
    }),
    multiTenantPlugin({
      tenantCollection: 'tenants',
      collections: [
        'appointments',
        'businessDocumentation',
        'clockRecords',
        'content',
        'customers',
        'editorPlugins',
        'editorTemplates',
        'editorThemes',
        'events',
        'gallery',
        'loyaltyProgram',
        'media',
        'mediaFolders',
        'orders',
        'products',
        'services',
        'settings',
        'staffSchedules',
        'stylists',
        'testimonials'
      ],
      skipTenantCheck: ({ req }: { req: any }) => req.user?.role === 'admin',
    } as any),
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: {
            name: 's3',
            config: {
              bucket: process.env.S3_BUCKET || 'modernmen-media',
              config: {
                credentials: {
                  accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
                },
                region: process.env.S3_REGION || 'us-east-1',
              },
            },
          },
        },
      },
    } as any),
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      isTestKey: process.env.NODE_ENV !== 'production',
      webhooks: {
        'checkout.session.completed': {
          handlerFile: `${__dirname}/webhooks/checkout-session-completed.ts`,
        },
        'invoice.payment_succeeded': {
          handlerFile: `${__dirname}/webhooks/invoice-payment-succeeded.ts`,
        },
        'customer.subscription.updated': {
          handlerFile: `${__dirname}/webhooks/customer-subscription-updated.ts`,
        },
      },
      rest: false,
    } as any),
  ],

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