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

// Import collections from organized structure
import collections from '../payload/collections';
// import { productAnalyticsEndpoint, bulkProductOperationsEndpoint } from '../endpoints'; // TODO: Fix endpoint types

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const config = buildConfig({
  admin: {
    user: 'customers',
    components: {
      views: { Dashboard: '/components/admin/Dashboard' } as any,
      afterNavLinks: ['/components/admin/AnalyticsWidget', '/components/admin/ScheduleWidget', '/components/admin/ClockWidget', '/components/admin/SettingsWidget'] as any,
    } as any,
  },
  editor: lexicalEditor(),
  collections: collections,
  endpoints: [], // TODO: Fix endpoint types
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI || '' } }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  sharp: sharp as any,
  plugins: [
    // Plugins will be configured in the main payload config
    // Keeping minimal configuration for type generation
  ],
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
});

export default config;