#!/usr/bin/env ts-node

/**
 * generate-payload-types.ts
 *
 * Generates TypeScript types for all Payload collections using the Payload API.
 * This script writes the generated types to src/payload-types.ts.
 */

import { buildConfig } from 'payload';
import postgresAdapter from '@payloadcms/db-postgres';
import lexicalEditor from '@payloadcms/richtext-lexical';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { stripePlugin } from '@payloadcms/plugin-stripe';
import { searchPlugin } from '@payloadcms/plugin-search';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { payloadAiPlugin } from '@ai-stack/payloadcms';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Import collections
import { Appointments, BusinessDocumentation, Users, Tenants, Media, MediaFolders, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders, Testimonials, Content, EditorTemplates, EditorThemes, EditorPlugins, Gallery, Contacts, LoyaltyProgram, Pages, NavigationMenus, Redirects, Blocks } from '../collections';
// import { productAnalyticsEndpoint, bulkProductOperationsEndpoint } from '../endpoints'; // TODO: Fix endpoint types

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const config = buildConfig({
  admin: {
    user: 'users',
    components: {
      views: { Dashboard: '/components/admin/Dashboard' } as any,
      afterNavLinks: ['/components/admin/AnalyticsWidget', '/components/admin/ScheduleWidget', '/components/admin/ClockWidget', '/components/admin/SettingsWidget'] as any,
    } as any,
  },
  editor: lexicalEditor(),
  collections: [Appointments, BusinessDocumentation, Users, Tenants, Media, MediaFolders, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders, Testimonials, Content, EditorTemplates, EditorThemes, EditorPlugins, Gallery, Contacts, LoyaltyProgram, Pages, NavigationMenus, Redirects, Blocks],
  endpoints: [], // TODO: Fix endpoint types
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI || '' } }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  sharp: sharp as any,
  plugins: [
    multiTenantPlugin({
      collections: ['appointments', 'users', 'staff-schedules', 'clock-records', 'settings', 'testimonials', 'products', 'orders'] as any,
    }),
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
  ],
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
});

export default config;