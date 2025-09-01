import payload from '../../payload'
import { CollectionConfig, Field } from 'payload/types'
import fs from 'fs'
import path from 'path'

export interface MigrationOptions {
  dryRun?: boolean
  verbose?: boolean
  backup?: boolean
  rollbackOnError?: boolean
}

export interface MigrationResult {
  success: boolean
  migrated: number
  skipped: number
  errors: Array<{ collection: string; error: Error; item?: any }>
  duration: number
  backupPath?: string
}

export class PayloadMigrationUtils {
  /**
   * Migrate data from one collection structure to another
   */
  static async migrateCollectionData(
    collectionSlug: string,
    transformFunction: (item: any) => any,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    const startTime = Date.now()
    const { dryRun = false, verbose = true, backup = true, rollbackOnError = true } = options

    let backupPath: string | undefined
    const result: MigrationResult = {
      success: true,
      migrated: 0,
      skipped: 0,
      errors: [],
      duration: 0
    }

    try {
      if (verbose) {
        console.log(`🚀 Starting migration for collection: ${collectionSlug}`)
        if (dryRun) console.log('🧪 Running in dry-run mode')
      }

      // Create backup if requested
      if (backup && !dryRun) {
        backupPath = await this.createBackup(collectionSlug)
        result.backupPath = backupPath
        if (verbose) console.log(`💾 Backup created: ${backupPath}`)
      }

      // Get all items from collection
      const allItems = await payload.find({
        collection: collectionSlug,
        limit: 10000 // Adjust as needed
      })

      if (verbose) {
        console.log(`📊 Found ${allItems.docs.length} items to migrate`)
      }

      // Process each item
      for (const item of allItems.docs) {
        try {
          const transformedItem = await transformFunction(item)

          if (transformedItem) {
            if (!dryRun) {
              await payload.update({
                collection: collectionSlug,
                id: item.id,
                data: transformedItem
              })
            }
            result.migrated++
            if (verbose && result.migrated % 100 === 0) {
              console.log(`📈 Migrated ${result.migrated} items...`)
            }
          } else {
            result.skipped++
            if (verbose) {
              console.log(`⏭️  Skipped item ${item.id}`)
            }
          }
        } catch (error) {
          result.errors.push({
            collection: collectionSlug,
            error: error as Error,
            item
          })

          if (rollbackOnError && !dryRun) {
            console.error(`💥 Migration failed, rolling back...`)
            await this.rollbackFromBackup(backupPath!)
            result.success = false
            break
          }
        }
      }

      result.duration = Date.now() - startTime

      if (verbose) {
        console.log(`✅ Migration completed in ${result.duration}ms`)
        console.log(`📊 Results: ${result.migrated} migrated, ${result.skipped} skipped, ${result.errors.length} errors`)
      }

    } catch (error) {
      result.success = false
      result.errors.push({
        collection: collectionSlug,
        error: error as Error
      })
      result.duration = Date.now() - startTime

      if (verbose) {
        console.error('💥 Migration failed:', error)
      }
    }

    return result
  }

  /**
   * Add new fields to existing collection items
   */
  static async addFieldsToCollection(
    collectionSlug: string,
    newFields: Record<string, any>,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    return this.migrateCollectionData(
      collectionSlug,
      (item) => {
        const updates: any = {}
        let hasChanges = false

        for (const [fieldName, defaultValue] of Object.entries(newFields)) {
          if (item[fieldName] === undefined) {
            updates[fieldName] = defaultValue
            hasChanges = true
          }
        }

        return hasChanges ? updates : null
      },
      options
    )
  }

  /**
   * Remove fields from collection items
   */
  static async removeFieldsFromCollection(
    collectionSlug: string,
    fieldsToRemove: string[],
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    return this.migrateCollectionData(
      collectionSlug,
      (item) => {
        const updates: any = {}
        let hasChanges = false

        for (const field of fieldsToRemove) {
          if (item[field] !== undefined) {
            updates[field] = null // Set to null instead of removing to maintain history
            hasChanges = true
          }
        }

        return hasChanges ? updates : null
      },
      options
    )
  }

  /**
   * Transform field values in collection
   */
  static async transformFieldValues(
    collectionSlug: string,
    fieldName: string,
    transformFunction: (value: any, item: any) => any,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    return this.migrateCollectionData(
      collectionSlug,
      (item) => {
        if (item[fieldName] !== undefined) {
          const newValue = transformFunction(item[fieldName], item)
          if (newValue !== item[fieldName]) {
            return { [fieldName]: newValue }
          }
        }
        return null
      },
      options
    )
  }

  /**
   * Migrate data between collections
   */
  static async migrateBetweenCollections(
    sourceCollection: string,
    targetCollection: string,
    transformFunction: (item: any) => any,
    options: MigrationOptions & { skipDuplicates?: boolean } = {}
  ): Promise<MigrationResult> {
    const startTime = Date.now()
    const { dryRun = false, verbose = true, skipDuplicates = true } = options

    const result: MigrationResult = {
      success: true,
      migrated: 0,
      skipped: 0,
      errors: [],
      duration: 0
    }

    try {
      if (verbose) {
        console.log(`🚀 Starting collection-to-collection migration`)
        console.log(`📁 From: ${sourceCollection} → To: ${targetCollection}`)
      }

      // Get all items from source collection
      const sourceItems = await payload.find({
        collection: sourceCollection,
        limit: 10000
      })

      if (verbose) {
        console.log(`📊 Found ${sourceItems.docs.length} items to migrate`)
      }

      // Process each item
      for (const item of sourceItems.docs) {
        try {
          const transformedItem = await transformFunction(item)

          if (transformedItem) {
            if (!dryRun) {
              // Check for duplicates if requested
              if (skipDuplicates) {
                const existing = await payload.find({
                  collection: targetCollection,
                  where: {
                    // Add your duplicate check logic here
                    // For example: { slug: { equals: transformedItem.slug } }
                  }
                })

                if (existing.docs.length > 0) {
                  result.skipped++
                  continue
                }
              }

              await payload.create({
                collection: targetCollection,
                data: transformedItem
              })
            }
            result.migrated++
          } else {
            result.skipped++
          }
        } catch (error) {
          result.errors.push({
            collection: targetCollection,
            error: error as Error,
            item
          })
        }
      }

      result.duration = Date.now() - startTime

      if (verbose) {
        console.log(`✅ Migration completed in ${result.duration}ms`)
        console.log(`📊 Results: ${result.migrated} migrated, ${result.skipped} skipped`)
      }

    } catch (error) {
      result.success = false
      result.errors.push({
        collection: targetCollection,
        error: error as Error
      })
      result.duration = Date.now() - startTime
    }

    return result
  }

  /**
   * Create backup of collection data
   */
  static async createBackup(collectionSlug: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'backups', 'payload', timestamp)

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Get all data from collection
    const data = await payload.find({
      collection: collectionSlug,
      limit: 10000
    })

    // Save to file
    const backupPath = path.join(backupDir, `${collectionSlug}.json`)
    fs.writeFileSync(backupPath, JSON.stringify(data.docs, null, 2))

    return backupPath
  }

  /**
   * Restore collection from backup
   */
  static async restoreFromBackup(backupPath: string, collectionSlug: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`)
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))

    console.log(`🔄 Restoring ${backupData.length} items to ${collectionSlug}`)

    for (const item of backupData) {
      try {
        await payload.update({
          collection: collectionSlug,
          id: item.id,
          data: item
        })
      } catch (error) {
        // Try to create if update fails
        try {
          delete item.id // Remove ID for creation
          await payload.create({
            collection: collectionSlug,
            data: item
          })
        } catch (createError) {
          console.error(`Failed to restore item ${item.id}:`, createError)
        }
      }
    }

    console.log(`✅ Restore completed`)
  }

  /**
   * Rollback migration using backup
   */
  static async rollbackFromBackup(backupPath: string): Promise<void> {
    const collectionSlug = path.basename(backupPath, '.json')
    await this.restoreFromBackup(backupPath, collectionSlug)
  }

  /**
   * Validate collection data against schema
   */
  static async validateCollectionData(
    collectionSlug: string,
    validator?: (item: any) => { isValid: boolean; errors: string[] }
  ): Promise<{
    valid: number
    invalid: number
    errors: Array<{ item: any; errors: string[] }>
  }> {
    const result = {
      valid: 0,
      invalid: 0,
      errors: [] as Array<{ item: any; errors: string[] }>
    }

    const data = await payload.find({
      collection: collectionSlug,
      limit: 10000
    })

    for (const item of data.docs) {
      if (validator) {
        const validation = validator(item)
        if (validation.isValid) {
          result.valid++
        } else {
          result.invalid++
          result.errors.push({ item, errors: validation.errors })
        }
      } else {
        // Basic validation - check required fields
        const errors: string[] = []

        // Add your validation logic here based on collection schema

        if (errors.length === 0) {
          result.valid++
        } else {
          result.invalid++
          result.errors.push({ item, errors })
        }
      }
    }

    return result
  }

  /**
   * Clean up orphaned relationships
   */
  static async cleanupOrphanedRelationships(
    collectionSlug: string,
    relationshipField: string,
    relatedCollection: string,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    return this.migrateCollectionData(
      collectionSlug,
      async (item) => {
        if (item[relationshipField]) {
          try {
            // Check if related item exists
            const relatedItem = await payload.findByID({
              collection: relatedCollection,
              id: item[relationshipField]
            })

            if (!relatedItem) {
              // Relationship is orphaned, remove it
              return { [relationshipField]: null }
            }
          } catch (error) {
            // Related item doesn't exist, remove relationship
            return { [relationshipField]: null }
          }
        }
        return null
      },
      options
    )
  }

  /**
   * Bulk update collection items
   */
  static async bulkUpdateCollection(
    collectionSlug: string,
    filter: any,
    updates: Record<string, any>,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    return this.migrateCollectionData(
      collectionSlug,
      (item) => {
        // Check if item matches filter
        let matchesFilter = true

        for (const [key, value] of Object.entries(filter)) {
          if (item[key] !== value) {
            matchesFilter = false
            break
          }
        }

        return matchesFilter ? updates : null
      },
      options
    )
  }
}

// Migration presets for common operations
export const MigrationPresets = {
  // Add timestamps to collection
  addTimestamps: (collectionSlug: string, options?: MigrationOptions) =>
    PayloadMigrationUtils.addFieldsToCollection(
      collectionSlug,
      {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      options
    ),

  // Add SEO fields to collection
  addSEOFields: (collectionSlug: string, options?: MigrationOptions) =>
    PayloadMigrationUtils.addFieldsToCollection(
      collectionSlug,
      {
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        canonicalUrl: '',
        noIndex: false
      },
      options
    ),

  // Add status field to collection
  addStatusField: (collectionSlug: string, defaultStatus = 'draft', options?: MigrationOptions) =>
    PayloadMigrationUtils.addFieldsToCollection(
      collectionSlug,
      { status: defaultStatus },
      options
    ),

  // Convert string field to relationship
  convertToRelationship: (
    collectionSlug: string,
    fieldName: string,
    relatedCollection: string,
    options?: MigrationOptions
  ) =>
    PayloadMigrationUtils.transformFieldValues(
      collectionSlug,
      fieldName,
      async (value, item) => {
        if (typeof value === 'string') {
          // Find related item by some field (e.g., slug, name)
          const relatedItems = await payload.find({
            collection: relatedCollection,
            where: {
              // Add your lookup logic here
              // For example: { slug: { equals: value } }
            }
          })

          if (relatedItems.docs.length > 0) {
            return relatedItems.docs[0].id
          }
        }
        return value
      },
      options
    )
}

export default PayloadMigrationUtils
