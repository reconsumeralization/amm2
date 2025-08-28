#!/usr/bin/env ts-node

/**
 * seed-database.ts
 *
 * Populates the Payload PostgreSQL database with demo data.
 * Seed files should be placed in `src/tools/seeds/` as JSON arrays.
 *
 * Usage: `npm run tools:seed-db`
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import getPayloadClient from '../payload';

// Resolve script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing seed JSON files
const seedsDir = path.resolve(__dirname, 'seeds');

// Helper to load a JSON seed file
function loadSeed<T>(fileName: string): T[] {
  const filePath = path.join(seedsDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Seed file ${fileName} not found, skipping.`);
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

// Main seeding function
async function seed() {
  const payload = await getPayloadClient();

  // Define which collections to seed and their corresponding files
  const collections = [
    { name: 'users', file: 'users.json' },
    { name: 'services', file: 'services.json' },
    { name: 'stylists', file: 'stylists.json' },
    { name: 'customers', file: 'customers.json' },
    { name: 'appointments', file: 'appointments.json' },
  ];

  for (const col of collections) {
    const records = loadSeed<any>(col.file);
    if (records.length === 0) continue;

    console.log(`🌱 Seeding ${records.length} records into ${col.name}...`);
    for (const record of records) {
      try {
        await payload.create({
          collection: col.name,
          data: record,
        });
      } catch (e) {
        console.error(`❌ Failed to create ${col.name} record:`, e);
      }
    }
  }

  console.log('✅ Database seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
