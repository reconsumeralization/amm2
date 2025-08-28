import { buildConfig, Config } from 'payload';
import lexicalEditor from '@payloadcms/richtext-lexical';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { stripePlugin } from '@payloadcms/plugin-stripe';
import { searchPlugin } from '@payloadcms/plugin-search';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';

import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { payloadAiPlugin } from '@ai-stack/payloadcms';
import { Appointments, BusinessDocumentation, Users, Tenants, Media, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders } from './collections';
// import { productAnalyticsEndpoint, bulkProductOperationsEndpoint } from './endpoints'; // TODO: Fix endpoint types
import sharp from 'sharp';

// Import monitoring and validation
import { yoloMonitoring } from './lib/monitoring';
import { validationSchemas } from './lib/validation';

// Import types for hooks and request
import { BeforeChangeHook, AfterChangeHook, PayloadRequest } from 'payload/dist/collections/config/types';
import { CollectionSlug, Operation } from 'payload/dist/types';
import { Response, NextFunction } from 'express'; // Assuming express types are available

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
  endpoints: [], // TODO: Fix endpoint types
  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  sharp: sharp as any,
  
  // Add error handling
  onError: (error: unknown, req: PayloadRequest, res: Response) => {
    yoloMonitoring.captureException(error, {
      context: 'payload_error',
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });
    console.error('Payload Error:', error);
  },

  // Add global hooks for monitoring and validation
  hooks: {
    beforeChange: [
      async ({ data, collection, operation, req }) => { // Added req here
        // Track operation
        yoloMonitoring.trackPayloadOperation(collection, operation, req?.user?.id);
        
        // Validate data if schema exists
        const schema = validationSchemas[collection as keyof typeof validationSchemas];
        if (schema && operation === 'create') {
          const createSchema = (schema as any).create;
          if (createSchema) {
            const result = createSchema.safeParse(data);
            if (!result.success) {
              throw new Error(`Validation failed: ${result.error.message}`);
            }
          }
        }
        return data; // Important: always return data in beforeChange
      }
    ] as BeforeChangeHook[], // Explicitly cast to BeforeChangeHook[]
    afterChange: [
      async ({ doc, operation, collection, req }) => { // Added req here
        // Track successful operation
        yoloMonitoring.trackPayloadOperation(collection, operation, doc.userId || req?.user?.id);
        
        // Track business metrics
        if (collection === 'appointments' && operation === 'create') {
          yoloMonitoring.trackBusinessMetric('appointments_created', 1, 'bookings');
        }
        if (collection === 'customers' && operation === 'create') {
          yoloMonitoring.trackBusinessMetric('customers_created', 1, 'customers');
        }
      }
    ] as AfterChangeHook[], // Explicitly cast to AfterChangeHook[]
    afterDelete: [
      async ({ doc, collection, req }) => { // Added req here
        // Track deletion
        yoloMonitoring.trackPayloadOperation(collection, 'delete', doc.userId || req?.user?.id);
      }
    ] as AfterChangeHook[], // afterDelete also uses AfterChangeHook type
  },

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
      // Removed searchFields and highlightFields as they are not part of SearchPluginConfig
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

  // Add rate limiting headers
  express: {
    // Add custom middleware for rate limiting and monitoring
    preMiddleware: [
      (req: PayloadRequest, res: Response, next: NextFunction) => {
        // Add request tracking
        const startTime = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - startTime;
          yoloMonitoring.trackApiPerformance(req.url || 'unknown', duration, res.statusCode);
        });
        next();
      }
    ],
  },
});