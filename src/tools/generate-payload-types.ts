#!/usr/bin/env ts-node

/**
 * generate-payload-types.ts
 *
 * Generates TypeScript types for all Payload collections using the Payload API.
 * This script writes the generated types to src/payload-types.ts.
 */

import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import lexicalEditor from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

// Import collections without global wrappers or hooks to avoid heavy deps
import collections from '../payload/collections/types-only';
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
  collections: collections,
  endpoints: [], // TODO: Fix endpoint types
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  plugins: [],
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
});

export default config;