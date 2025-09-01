#!/usr/bin/env tsx

/**
 * Database Synchronization Script
 *
 * This script synchronizes data between Payload CMS and Supabase
 * ensuring consistency across both systems.
 */

import { PayloadSupabaseSync, CollectionSync } from '../src/lib/payload-supabase-sync'
import payload from '../src/payload'
import { createClient } from '@supabase/supabase-js'

interface SyncOptions {
  collections?: string[]
  direction?: 'payload-to-supabase' | 'supabase-to-payload' | 'bidirectional'
  batchSize?: number
  dryRun?: boolean
  verbose?: boolean
}

class DatabaseSyncManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  async initializePayload() {
    if (!payload.db) {
      await payload.init({
        secret: process.env.PAYLOAD_SECRET!,
        mongoURL: process.env.DATABASE_URL,
        local: true
      })
    }
  }

  async syncCollections(options: SyncOptions = {}) {
    const {
      collections = ['users', 'customers', 'services', 'appointments', 'products'],
      direction = 'bidirectional',
      batchSize = 50,
      dryRun = false,
      verbose = true
    } = options

    console.log('🚀 Starting database synchronization...')
    console.log(`📋 Collections: ${collections.join(', ')}`)
    console.log(`🔄 Direction: ${direction}`)
    console.log(`📦 Batch size: ${batchSize}`)
    console.log(`🧪 Dry run: ${dryRun ? 'Yes' : 'No'}`)
    console.log('─'.repeat(50))

    const results = {
      successful: [] as string[],
      failed: [] as string[],
      skipped: [] as string[]
    }

    for (const collection of collections) {
      try {
        console.log(`\n🔄 Syncing collection: ${collection}`)

        if (dryRun) {
          // Dry run - just check sync status
          const status = await PayloadSupabaseSync.getSyncStatus(collection)
          console.log(`📊 Status - Payload: ${status.payloadCount}, Supabase: ${status.supabaseCount}`)

          if (status.payloadCount !== status.supabaseCount) {
            console.log(`⚠️  Data mismatch detected!`)
            results.failed.push(`${collection} (dry run - mismatch)`)
          } else {
            console.log(`✅ Data is in sync`)
            results.successful.push(`${collection} (dry run)`)
          }
          continue
        }

        // Perform actual sync
        const syncOptions = {
          collection,
          batchSize,
          onProgress: verbose ? (progress: any) => {
            console.log(`  📈 Progress: ${progress.current}/${progress.total}`)
          } : undefined,
          onError: (error: Error, item: any) => {
            console.error(`  ❌ Error syncing item ${item.id}:`, error.message)
          }
        }

        let result
        switch (direction) {
          case 'payload-to-supabase':
            result = await PayloadSupabaseSync.syncToSupabase(syncOptions)
            break
          case 'supabase-to-payload':
            result = await PayloadSupabaseSync.syncToPayload(syncOptions)
            break
          case 'bidirectional':
            const biResult = await PayloadSupabaseSync.syncBidirectional(syncOptions)
            result = {
              success: biResult.payloadToSupabase.success && biResult.supabaseToPayload.success,
              syncedCount: biResult.payloadToSupabase.syncedCount + biResult.supabaseToPayload.syncedCount,
              errors: [...biResult.payloadToSupabase.errors, ...biResult.supabaseToPayload.errors],
              duration: Math.max(biResult.payloadToSupabase.duration, biResult.supabaseToPayload.duration)
            }
            break
        }

        if (result.success) {
          console.log(`✅ Successfully synced ${result.syncedCount} items in ${result.duration}ms`)
          results.successful.push(collection)
        } else {
          console.log(`❌ Sync failed with ${result.errors.length} errors`)
          results.failed.push(collection)
        }

      } catch (error) {
        console.error(`💥 Failed to sync collection ${collection}:`, error)
        results.failed.push(collection)
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 SYNCHRONIZATION SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Successful: ${results.successful.length}`)
    results.successful.forEach(col => console.log(`   • ${col}`))

    if (results.failed.length > 0) {
      console.log(`❌ Failed: ${results.failed.length}`)
      results.failed.forEach(col => console.log(`   • ${col}`))
    }

    if (results.skipped.length > 0) {
      console.log(`⏭️  Skipped: ${results.skipped.length}`)
      results.skipped.forEach(col => console.log(`   • ${col}`))
    }

    return results
  }

  async validateSync(collections: string[] = ['users', 'customers', 'services', 'appointments']) {
    console.log('🔍 Validating data consistency...')
    console.log('─'.repeat(50))

    for (const collection of collections) {
      try {
        console.log(`\n🔍 Validating: ${collection}`)
        const result = await PayloadSupabaseSync.validateSync(collection)

        if (result.isValid) {
          console.log(`✅ All data is consistent`)
        } else {
          console.log(`⚠️  Found ${result.inconsistencies.length} inconsistencies:`)
          result.inconsistencies.slice(0, 5).forEach((inc, index) => {
            console.log(`   ${index + 1}. ID: ${inc.id}`)
            inc.differences.forEach(diff => console.log(`      ${diff}`))
          })

          if (result.inconsistencies.length > 5) {
            console.log(`   ... and ${result.inconsistencies.length - 5} more`)
          }
        }
      } catch (error) {
        console.error(`💥 Failed to validate ${collection}:`, error)
      }
    }
  }

  async backupData(collections: string[] = ['users', 'customers', 'services', 'appointments']) {
    console.log('💾 Creating data backup...')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = `./backups/${timestamp}`

    // Ensure backup directory exists
    await new Promise((resolve, reject) => {
      require('fs').mkdir(backupDir, { recursive: true }, (err: any) => {
        if (err) reject(err)
        else resolve(null)
      })
    })

    for (const collection of collections) {
      try {
        console.log(`💾 Backing up: ${collection}`)

        // Get data from Payload
        const payloadData = await payload.find({
          collection,
          limit: 10000 // Adjust as needed
        })

        // Get data from Supabase
        const { data: supabaseData } = await this.supabase
          .from(collection)
          .select('*')

        // Save backup files
        const fs = require('fs')
        const path = require('path')

        fs.writeFileSync(
          path.join(backupDir, `${collection}-payload.json`),
          JSON.stringify(payloadData.docs, null, 2)
        )

        fs.writeFileSync(
          path.join(backupDir, `${collection}-supabase.json`),
          JSON.stringify(supabaseData, null, 2)
        )

        console.log(`✅ Backup saved for ${collection}`)
      } catch (error) {
        console.error(`💥 Failed to backup ${collection}:`, error)
      }
    }

    console.log(`📁 Backup saved to: ${backupDir}`)
    return backupDir
  }

  async cleanupOrphanedData() {
    console.log('🧹 Cleaning up orphaned data...')

    try {
      // Find Payload users not in Supabase
      const payloadUsers = await payload.find({
        collection: 'users',
        limit: 1000
      })

      for (const user of payloadUsers.docs) {
        const { data: supabaseUser } = await this.supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!supabaseUser) {
          console.log(`🗑️  Found orphaned Payload user: ${user.email}`)
          // Optionally remove or flag orphaned data
        }
      }

      console.log('✅ Orphaned data cleanup completed')
    } catch (error) {
      console.error('💥 Failed to cleanup orphaned data:', error)
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'sync'
  const options: SyncOptions = {}

  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case '--collections':
      case '-c':
        options.collections = args[++i]?.split(',')
        break
      case '--direction':
      case '-d':
        options.direction = args[++i] as any
        break
      case '--batch-size':
      case '-b':
        options.batchSize = parseInt(args[++i])
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--help':
      case '-h':
        printHelp()
        return
    }
  }

  const syncManager = new DatabaseSyncManager()

  try {
    await syncManager.initializePayload()

    switch (command) {
      case 'sync':
        await syncManager.syncCollections(options)
        break
      case 'validate':
        await syncManager.validateSync(options.collections)
        break
      case 'backup':
        await syncManager.backupData(options.collections)
        break
      case 'cleanup':
        await syncManager.cleanupOrphanedData()
        break
      default:
        console.error(`Unknown command: ${command}`)
        printHelp()
        process.exit(1)
    }
  } catch (error) {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }
}

function printHelp() {
  console.log(`
Database Synchronization Tool

Usage:
  npm run sync-db [command] [options]

Commands:
  sync      Sync data between Payload and Supabase (default)
  validate  Validate data consistency between systems
  backup    Create backup of current data
  cleanup   Clean up orphaned data

Options:
  -c, --collections <list>    Comma-separated list of collections to sync
  -d, --direction <dir>       Sync direction: payload-to-supabase, supabase-to-payload, bidirectional
  -b, --batch-size <num>      Number of items to process in each batch (default: 50)
  --dry-run                   Show what would be synced without making changes
  -v, --verbose               Show detailed progress information
  -h, --help                  Show this help message

Examples:
  npm run sync-db sync --collections users,customers --direction bidirectional
  npm run sync-db validate --collections services,appointments
  npm run sync-db backup --dry-run
  npm run sync-db cleanup
`)
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error)
}

export default DatabaseSyncManager
