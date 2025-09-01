import { Config } from 'payload/config'
import { CollectionConfig, Field } from 'payload/types'
import { PayloadSupabaseSync } from '../../lib/payload-supabase-sync'

export interface SupabaseIntegrationOptions {
  collections?: string[]
  syncOnSave?: boolean
  syncOnDelete?: boolean
  supabaseUrl?: string
  supabaseKey?: string
}

export const supabaseIntegration = (options: SupabaseIntegrationOptions = {}) => {
  const {
    collections = [],
    syncOnSave = true,
    syncOnDelete = true,
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  } = options

  return (config: Config): Config => {
    // Add Supabase sync hooks to specified collections
    const enhancedCollections = config.collections?.map(collection => {
      if (collections.length === 0 || collections.includes(collection.slug)) {
        return addSupabaseSyncHooks(collection, {
          syncOnSave,
          syncOnDelete,
          supabaseUrl,
          supabaseKey
        })
      }
      return collection
    })

    return {
      ...config,
      collections: enhancedCollections
    }
  }
}

function addSupabaseSyncHooks(
  collection: CollectionConfig,
  options: {
    syncOnSave: boolean
    syncOnDelete: boolean
    supabaseUrl: string
    supabaseKey: string
  }
): CollectionConfig {
  const hooks = collection.hooks || {}

  // Add afterChange hook for syncing to Supabase
  if (options.syncOnSave) {
    const existingAfterChange = hooks.afterChange || []
    hooks.afterChange = [
      ...existingAfterChange,
      async ({ doc, operation, req }) => {
        try {
          if (operation === 'create' || operation === 'update') {
            await PayloadSupabaseSync.syncToSupabase({
              collection: collection.slug,
              direction: 'payload-to-supabase',
              onProgress: (progress) => {
                console.log(`Synced ${progress.current}/${progress.total} items from ${collection.slug}`)
              }
            })
          }
        } catch (error) {
          console.error(`Supabase sync failed for ${collection.slug}:`, error)
          // Don't throw error to prevent Payload operation from failing
        }

        return doc
      }
    ]
  }

  // Add afterDelete hook for syncing deletions to Supabase
  if (options.syncOnDelete) {
    const existingAfterDelete = hooks.afterDelete || []
    hooks.afterDelete = [
      ...existingAfterDelete,
      async ({ doc, req }) => {
        try {
          // Mark as deleted in Supabase or remove entirely
          console.log(`Item deleted from ${collection.slug}:`, doc.id)
          // Implement deletion sync logic here
        } catch (error) {
          console.error(`Supabase delete sync failed for ${collection.slug}:`, error)
        }

        return doc
      }
    ]
  }

  return {
    ...collection,
    hooks
  }
}

// Supabase field types for Payload
export const supabaseFields = {
  // UUID field that syncs with Supabase
  uuid: (name: string, options: Partial<Field> = {}): Field => ({
    name,
    type: 'text',
    admin: {
      description: 'UUID field synced with Supabase'
    },
    hooks: {
      beforeValidate: [({ value }) => {
        if (!value) {
          return crypto.randomUUID()
        }
        return value
      }]
    },
    ...options
  }),

  // Timestamp field that syncs with Supabase
  timestamp: (name: string, options: Partial<Field> = {}): Field => ({
    name,
    type: 'date',
    admin: {
      description: 'Timestamp field synced with Supabase',
      date: {
        pickerAppearance: 'dayAndTime'
      }
    },
    ...options
  }),

  // JSON field for complex data
  jsonField: (name: string, options: Partial<Field> = {}): Field => ({
    name,
    type: 'json',
    admin: {
      description: 'JSON field for complex data structures'
    },
    ...options
  }),

  // Relationship field with Supabase foreign key
  supabaseRelation: (
    name: string,
    relationTo: string,
    options: Partial<Field> = {}
  ): Field => ({
    name,
    type: 'relationship',
    relationTo,
    admin: {
      description: `Relationship to ${relationTo} (synced with Supabase)`
    },
    ...options
  })
}

// Helper to create Supabase-compatible collections
export const createSupabaseCollection = (
  slug: string,
  fields: Field[],
  options: Partial<CollectionConfig> = {}
): CollectionConfig => ({
  slug,
  admin: {
    useAsTitle: 'name',
    ...options.admin
  },
  fields: [
    // Add Supabase-compatible ID field
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier (UUID format)'
      },
      hooks: {
        beforeValidate: [({ value }) => {
          if (!value) {
            return crypto.randomUUID()
          }
          return value
        }]
      }
    },
    // Add timestamps
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        description: 'Creation timestamp'
      },
      hooks: {
        beforeChange: [() => new Date()]
      }
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        description: 'Last update timestamp'
      },
      hooks: {
        beforeChange: [() => new Date()]
      }
    },
    ...fields
  ],
  ...options
})

// Real-time sync utilities
export const realtimeSync = {
  // Setup real-time sync for a collection
  setupRealtimeSync: (collection: string, callback: (payload: any) => void) => {
    return PayloadSupabaseSync.setupRealtimeSync(collection, callback)
  },

  // Get sync status
  getSyncStatus: (collection: string) => {
    return PayloadSupabaseSync.getSyncStatus(collection)
  },

  // Validate sync integrity
  validateSync: (collection: string) => {
    return PayloadSupabaseSync.validateSync(collection)
  }
}

export default supabaseIntegration
