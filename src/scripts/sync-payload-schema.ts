#!/usr/bin/env tsx

/**
 * Payload CMS Schema Synchronization Script
 *
 * This script helps maintain synchronization between Payload CMS configuration
 * and database schema using migrations and data backfill.
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

/**
 * Generate and apply migrations
 */
async function generateMigration(description: string) {
  console.log(`📝 Generating migration: ${description}`)

  try {
    // Generate migration file
    execSync('npm run payload generate:types', { cwd: rootDir, stdio: 'inherit' })

    // Check if there are schema changes
    const migrationDir = path.join(rootDir, 'src/migrations')
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true })
    }

    // Create migration file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const migrationFile = path.join(migrationDir, `${timestamp}-${description.replace(/\s+/g, '-')}.ts`)

    const migrationTemplate = `import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Migration logic goes here
  console.log('Running migration: ${description}')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Rollback logic goes here
  console.log('Rolling back migration: ${description}')
}
`

    fs.writeFileSync(migrationFile, migrationTemplate)
    console.log(`✅ Migration file created: ${migrationFile}`)

  } catch (error) {
    console.error('❌ Failed to generate migration:', error)
  }
}

/**
 * Sync database schema using Drizzle
 */
async function syncWithDrizzle() {
  console.log('🔄 Syncing with Drizzle ORM...')

  try {
    // Push schema changes to database
    execSync('npm run db:push', { cwd: rootDir, stdio: 'inherit' })
    console.log('✅ Database schema synced with Drizzle')

    // Generate new types
    execSync('npm run payload generate:types', { cwd: rootDir, stdio: 'inherit' })
    console.log('✅ TypeScript types regenerated')

  } catch (error) {
    console.error('❌ Drizzle sync failed:', error)
  }
}

/**
 * Backfill existing data after schema changes
 */
async function backfillData(collection: string, transformFn: (doc: any) => any) {
  console.log(`🔄 Backfilling data for collection: ${collection}`)

  try {
    const { getPayload } = await import('payload')
    const config = (await import('../payload.config.test')).default
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection,
      limit: 1000, // Adjust based on your needs
    })

    for (const doc of docs) {
      const updatedDoc = transformFn(doc)
      if (updatedDoc) {
        await payload.update({
          collection,
          id: doc.id,
          data: updatedDoc,
        })
        console.log(`✅ Updated document: ${doc.id}`)
      }
    }

    console.log(`✅ Backfill completed for ${docs.length} documents`)

  } catch (error) {
    console.error('❌ Backfill failed:', error)
  }
}

/**
 * Sync data between environments using REST API
 */
async function syncEnvironments(sourceUrl: string, targetUrl: string, collections: string[]) {
  console.log('🔄 Syncing environments...')

  try {
    for (const collection of collections) {
      console.log(`📋 Syncing collection: ${collection}`)

      // Fetch data from source
      const sourceResponse = await fetch(`${sourceUrl}/api/${collection}?limit=1000`)
      const sourceData = await sourceResponse.json()

      // Import to target environment
      for (const doc of sourceData.docs) {
        const { id, ...data } = doc
        await fetch(`${targetUrl}/api/${collection}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PAYLOAD_API_KEY}`,
          },
          body: JSON.stringify({ data }),
        })
      }

      console.log(`✅ Synced ${sourceData.docs.length} documents for ${collection}`)
    }

  } catch (error) {
    console.error('❌ Environment sync failed:', error)
  }
}

/**
 * Check migration status
 */
async function checkMigrationStatus() {
  console.log('📊 Checking migration status...')

  try {
    const migrationDir = path.join(rootDir, 'src/migrations')
    if (!fs.existsSync(migrationDir)) {
      console.log('📁 No migrations directory found')
      return
    }

    const migrations = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.ts'))
      .sort()

    console.log(`📋 Found ${migrations.length} migrations:`)
    migrations.forEach(migration => console.log(`  - ${migration}`))

  } catch (error) {
    console.error('❌ Failed to check migration status:', error)
  }
}

// CLI interface
const command = process.argv[2]
const args = process.argv.slice(3)

switch (command) {
  case 'migrate':
    await generateMigration(args.join(' ') || 'schema-update')
    break

  case 'sync':
    await syncWithDrizzle()
    break

  case 'backfill':
    if (args.length < 1) {
      console.error('Usage: npm run sync backfill <collection> [transform-file]')
      process.exit(1)
    }
    const [collection] = args
    await backfillData(collection, (doc) => doc) // Default no-op transform
    break

  case 'environments':
    if (args.length < 3) {
      console.error('Usage: npm run sync environments <source-url> <target-url> <collections...>')
      process.exit(1)
    }
    const [sourceUrl, targetUrl, ...collections] = args
    await syncEnvironments(sourceUrl, targetUrl, collections)
    break

  case 'status':
    await checkMigrationStatus()
    break

  default:
    console.log(`
🚀 Payload CMS Synchronization Tool

Usage:
  npm run sync migrate [description]    - Generate new migration
  npm run sync sync                     - Sync schema with Drizzle
  npm run sync backfill <collection>    - Backfill data for collection
  npm run sync environments <src> <tgt> - Sync between environments
  npm run sync status                   - Check migration status

Examples:
  npm run sync migrate "add user preferences"
  npm run sync sync
  npm run sync backfill users
  npm run sync environments http://localhost:3000 https://prod.example.com users,posts
`)
}

export {
  generateMigration,
  syncWithDrizzle,
  backfillData,
  syncEnvironments,
  checkMigrationStatus,
}
