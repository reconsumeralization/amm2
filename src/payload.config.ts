import { buildConfig } from 'payload';
import lexicalEditor from '@payloadcms/richtext-lexical';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { stripePlugin } from '@payloadcms/plugin-stripe';
import { searchPlugin } from '@payloadcms/plugin-search';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';

import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { payloadAiPlugin } from '@ai-stack/payloadcms';
import { Appointments, BusinessDocumentation, Users, Tenants, Media, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders } from './collections';
// import { productAnalyticsEndpoint, bulkProductOperationsEndpoint } from './endpoints'; // TODO: Fix endpoint types;
import sharp from 'sharp';

export default buildConfig({
  admin: {
    user: 'users',
    components: {
      views: { Dashboard: '/components/admin/Dashboard' } as any,
      afterNavLinks: ['/components/admin/AnalyticsWidget', '/components/admin/ScheduleWidget', '/components/admin/ClockWidget', '/components/admin/SettingsWidget'] as any,
    } as any,
  },
  editor: lexicalEditor(),
  collections: [Appointments, BusinessDocumentation, Users, Tenants, Media, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders],
  endpoints: [] // TODO: Fix endpoint types,
  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  sharp: sharp as any,
    plugins: [
    payloadAiPlugin({
      collections: { appointments: true, 'business-documentation': true, 'staff-schedules': true, 'clock-records': true, settings: true, products: true, orders: true },
      debugging: false,
      openAIApiKey: process.env.OPENAI_API_KEY,
    } as any),
    formBuilderPlugin({
      fields: { text: true, date: true, payment: true },
      formSubmissionOverrides: {
        access: { create: () => true, read: ({ req }) => !!req.user },
      },
    }),
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      webhooks: { endpoint: '/api/integrations/stripe/webhook' } as any,
    }),
    searchPlugin({
      collections: ['appointments', 'business-documentation', 'staff-schedules', 'clock-records', 'products', 'events', 'settings', 'orders'],
      defaultPriorities: {
        appointments: 10,
        'business-documentation': 5,
        'staff-schedules': 8,
        'clock-records': 6,
        products: 7,
        events: 9,
        settings: 2,
        orders: 8,
      },
    }),
    // cloudStoragePlugin({
    //   collections: {
    //     media: {
    //       adapter: bunnyAdapter({
    //         apiKey: process.env.BUNNY_API_KEY,
    //         storageZone: process.env.BUNNY_STORAGE_ZONE,
    //       }),
    //     },
    //   },
    // }),
    multiTenantPlugin({
      collections: ['appointments', 'users', 'staff-schedules', 'clock-records', 'settings', 'testimonials', 'products', 'orders'] as any,
    }),
  ],
});