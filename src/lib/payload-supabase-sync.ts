import payload from '../payload'
import { supabase, supabaseAdmin } from './supabase'
import type { PayloadRequest } from 'payload/types'

export interface SyncOptions {
  collection: string
  direction: 'payload-to-supabase' | 'supabase-to-payload' | 'bidirectional'
  batchSize?: number
  onProgress?: (progress: { current: number; total: number; item: any }) => void
  onError?: (error: Error, item: any) => void
}

export interface SyncResult {
  success: boolean
  syncedCount: number
  errors: Array<{ error: Error; item: any }>
  duration: number
}

export class PayloadSupabaseSync {
  /**
   * Sync data from Payload CMS to Supabase
   */
  static async syncToSupabase(options: SyncOptions): Promise<SyncResult> {
    const startTime = Date.now()
    const { collection, batchSize = 100, onProgress, onError } = options
    let syncedCount = 0
    const errors: Array<{ error: Error; item: any }> = []

    try {
      // Get total count
      const totalResult = await payload.count({
        collection
      })
      const total = totalResult.totalDocs

      // Process in batches
      for (let offset = 0; offset < total; offset += batchSize) {
        const result = await payload.find({
          collection,
          limit: batchSize,
          page: Math.floor(offset / batchSize) + 1
        })

        for (const item of result.docs) {
          try {
            // Transform Payload data to Supabase format
            const supabaseData = this.transformPayloadToSupabase(collection, item)

            // Upsert to Supabase
            const { error } = await supabase
              .from(collection)
              .upsert(supabaseData, {
                onConflict: 'id'
              })

            if (error) throw error

            syncedCount++
            onProgress?.({ current: syncedCount, total, item })
          } catch (error) {
            console.error(`Error syncing item ${item.id}:`, error)
            errors.push({ error: error as Error, item })
            onError?.(error as Error, item)
          }
        }
      }

      return {
        success: errors.length === 0,
        syncedCount,
        errors,
        duration: Date.now() - startTime
      }
    } catch (error) {
      console.error('Sync to Supabase failed:', error)
      return {
        success: false,
        syncedCount,
        errors: [...errors, { error: error as Error, item: null }],
        duration: Date.now() - startTime
      }
    }
  }

  /**
   * Sync data from Supabase to Payload CMS
   */
  static async syncToPayload(options: SyncOptions): Promise<SyncResult> {
    const startTime = Date.now()
    const { collection, batchSize = 100, onProgress, onError } = options
    let syncedCount = 0
    const errors: Array<{ error: Error; item: any }> = []

    try {
      // Get total count from Supabase
      const { count: total } = await supabase
        .from(collection)
        .select('*', { count: 'exact', head: true })

      // Process in batches
      for (let offset = 0; offset < (total || 0); offset += batchSize) {
        const { data: items, error } = await supabase
          .from(collection)
          .select('*')
          .range(offset, offset + batchSize - 1)

        if (error) throw error

        for (const item of items || []) {
          try {
            // Transform Supabase data to Payload format
            const payloadData = this.transformSupabaseToPayload(collection, item)

            // Upsert to Payload
            await payload.upsert({
              collection,
              where: {
                id: {
                  equals: item.id
                }
              },
              data: payloadData
            })

            syncedCount++
            onProgress?.({ current: syncedCount, total: total || 0, item })
          } catch (error) {
            console.error(`Error syncing item ${item.id}:`, error)
            errors.push({ error: error as Error, item })
            onError?.(error as Error, item)
          }
        }
      }

      return {
        success: errors.length === 0,
        syncedCount,
        errors,
        duration: Date.now() - startTime
      }
    } catch (error) {
      console.error('Sync to Payload failed:', error)
      return {
        success: false,
        syncedCount,
        errors: [...errors, { error: error as Error, item: null }],
        duration: Date.now() - startTime
      }
    }
  }

  /**
   * Bidirectional sync between Payload and Supabase
   */
  static async syncBidirectional(options: Omit<SyncOptions, 'direction'>): Promise<{
    payloadToSupabase: SyncResult
    supabaseToPayload: SyncResult
  }> {
    const payloadToSupabaseOptions = { ...options, direction: 'payload-to-supabase' as const }
    const supabaseToPayloadOptions = { ...options, direction: 'supabase-to-payload' as const }

    const [payloadToSupabase, supabaseToPayload] = await Promise.all([
      this.syncToSupabase(payloadToSupabaseOptions),
      this.syncToPayload(supabaseToPayloadOptions)
    ])

    return {
      payloadToSupabase,
      supabaseToPayload
    }
  }

  /**
   * Transform Payload data to Supabase format
   */
  private static transformPayloadToSupabase(collection: string, payloadData: any): any {
    const baseTransform = {
      id: payloadData.id,
      created_at: payloadData.createdAt,
      updated_at: payloadData.updatedAt
    }

    switch (collection) {
      case 'users':
        return {
          ...baseTransform,
          email: payloadData.email,
          full_name: payloadData.name,
          role: payloadData.role,
          tenant_id: payloadData.tenant,
          is_active: true
        }

      case 'customers':
        return {
          ...baseTransform,
          first_name: payloadData.firstName,
          last_name: payloadData.lastName,
          email: payloadData.email,
          phone: payloadData.phone,
          tenant_id: payloadData.tenant
        }

      case 'services':
        return {
          ...baseTransform,
          name: payloadData.name,
          description: payloadData.description,
          price: payloadData.price,
          duration_minutes: payloadData.duration,
          category: payloadData.category,
          is_active: true
        }

      case 'appointments':
        return {
          ...baseTransform,
          user_id: payloadData.customer,
          stylist_id: payloadData.stylist,
          service_id: payloadData.service,
          appointment_date: payloadData.date,
          appointment_time: payloadData.time,
          status: payloadData.status,
          notes: payloadData.notes,
          total_price: payloadData.totalPrice
        }

      case 'products':
        return {
          ...baseTransform,
          name: payloadData.name,
          description: payloadData.description,
          price: payloadData.price,
          category: payloadData.category,
          brand: payloadData.brand,
          sku: payloadData.sku,
          is_active: payloadData.inStock,
          image_url: payloadData.image
        }

      default:
        return {
          ...baseTransform,
          ...payloadData
        }
    }
  }

  /**
   * Transform Supabase data to Payload format
   */
  private static transformSupabaseToPayload(collection: string, supabaseData: any): any {
    const baseTransform = {
      id: supabaseData.id,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at
    }

    switch (collection) {
      case 'users':
        return {
          ...baseTransform,
          email: supabaseData.email,
          name: supabaseData.full_name,
          role: supabaseData.role,
          tenant: supabaseData.tenant_id
        }

      case 'customers':
        return {
          ...baseTransform,
          firstName: supabaseData.first_name,
          lastName: supabaseData.last_name,
          email: supabaseData.email,
          phone: supabaseData.phone,
          tenant: supabaseData.tenant_id
        }

      case 'services':
        return {
          ...baseTransform,
          name: supabaseData.name,
          description: supabaseData.description,
          price: supabaseData.price,
          duration: supabaseData.duration_minutes,
          category: supabaseData.category
        }

      case 'appointments':
        return {
          ...baseTransform,
          customer: supabaseData.user_id,
          stylist: supabaseData.stylist_id,
          service: supabaseData.service_id,
          date: supabaseData.appointment_date,
          time: supabaseData.appointment_time,
          status: supabaseData.status,
          notes: supabaseData.notes,
          totalPrice: supabaseData.total_price
        }

      case 'products':
        return {
          ...baseTransform,
          name: supabaseData.name,
          description: supabaseData.description,
          price: supabaseData.price,
          category: supabaseData.category,
          brand: supabaseData.brand,
          sku: supabaseData.sku,
          inStock: supabaseData.is_active,
          image: supabaseData.image_url
        }

      default:
        return {
          ...baseTransform,
          ...supabaseData
        }
    }
  }

  /**
   * Real-time sync setup for specific collection
   */
  static setupRealtimeSync(collection: string, onPayloadChange?: (payload: any) => void) {
    // Listen for Supabase changes
    const supabaseChannel = supabase
      .channel(`${collection}_sync`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: collection
        },
        (payload) => {
          console.log(`Supabase ${collection} change:`, payload)
          onPayloadChange?.(payload)
        }
      )
      .subscribe()

    return {
      supabaseChannel,
      unsubscribe: () => {
        supabaseChannel.unsubscribe()
      }
    }
  }

  /**
   * Sync user authentication between systems
   */
  static async syncUserAuth(payloadUserId: string, supabaseUserId: string): Promise<boolean> {
    try {
      // Update Payload user with Supabase ID
      await payload.update({
        collection: 'users',
        id: payloadUserId,
        data: {
          supabaseId: supabaseUserId
        }
      })

      // Update Supabase profile with Payload ID
      const { error } = await supabase
        .from('profiles')
        .update({
          payload_id: payloadUserId
        })
        .eq('id', supabaseUserId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('User auth sync failed:', error)
      return false
    }
  }

  /**
   * Get sync status for a collection
   */
  static async getSyncStatus(collection: string): Promise<{
    payloadCount: number
    supabaseCount: number
    lastSync?: Date
  }> {
    try {
      // Get Payload count
      const payloadResult = await payload.count({ collection })
      const payloadCount = payloadResult.totalDocs

      // Get Supabase count
      const { count: supabaseCount } = await supabase
        .from(collection)
        .select('*', { count: 'exact', head: true })

      // TODO: Implement last sync tracking
      // const lastSync = await getLastSyncTimestamp(collection)

      return {
        payloadCount,
        supabaseCount: supabaseCount || 0,
        // lastSync
      }
    } catch (error) {
      console.error('Get sync status failed:', error)
      throw error
    }
  }

  /**
   * Validate sync data integrity
   */
  static async validateSync(collection: string): Promise<{
    isValid: boolean
    inconsistencies: Array<{
      id: string
      payloadData: any
      supabaseData: any
      differences: string[]
    }>
  }> {
    const inconsistencies = []

    try {
      // Get all items from both systems
      const payloadResult = await payload.find({
        collection,
        limit: 1000
      })

      const { data: supabaseData } = await supabase
        .from(collection)
        .select('*')

      // Compare each item
      for (const payloadItem of payloadResult.docs) {
        const supabaseItem = supabaseData?.find(item => item.id === payloadItem.id)

        if (!supabaseItem) {
          inconsistencies.push({
            id: payloadItem.id,
            payloadData: payloadItem,
            supabaseData: null,
            differences: ['Item missing in Supabase']
          })
          continue
        }

        // Check for differences
        const differences = this.compareItems(payloadItem, supabaseItem)
        if (differences.length > 0) {
          inconsistencies.push({
            id: payloadItem.id,
            payloadData: payloadItem,
            supabaseData: supabaseItem,
            differences
          })
        }
      }

      return {
        isValid: inconsistencies.length === 0,
        inconsistencies
      }
    } catch (error) {
      console.error('Sync validation failed:', error)
      throw error
    }
  }

  /**
   * Compare items between Payload and Supabase
   */
  private static compareItems(payloadItem: any, supabaseItem: any): string[] {
    const differences = []

    // Compare common fields
    const fieldsToCompare = ['name', 'email', 'description', 'price', 'status']

    for (const field of fieldsToCompare) {
      const payloadValue = payloadItem[field]
      const supabaseValue = supabaseItem[field]

      if (payloadValue !== supabaseValue) {
        differences.push(`${field}: Payload=${payloadValue}, Supabase=${supabaseValue}`)
      }
    }

    // Compare dates (with some tolerance)
    if (payloadItem.updatedAt && supabaseItem.updated_at) {
      const payloadDate = new Date(payloadItem.updatedAt)
      const supabaseDate = new Date(supabaseItem.updated_at)
      const diffMs = Math.abs(payloadDate.getTime() - supabaseDate.getTime())

      if (diffMs > 1000) { // More than 1 second difference
        differences.push(`updatedAt: Payload=${payloadItem.updatedAt}, Supabase=${supabaseItem.updated_at}`)
      }
    }

    return differences
  }
}

// Collection-specific sync utilities
export class CollectionSync {
  static async syncUsers(options?: Partial<SyncOptions>): Promise<SyncResult> {
    return PayloadSupabaseSync.syncToSupabase({
      collection: 'users',
      direction: 'payload-to-supabase',
      ...options
    })
  }

  static async syncCustomers(options?: Partial<SyncOptions>): Promise<SyncResult> {
    return PayloadSupabaseSync.syncBidirectional({
      collection: 'customers',
      ...options
    })
  }

  static async syncServices(options?: Partial<SyncOptions>): Promise<SyncResult> {
    return PayloadSupabaseSync.syncToSupabase({
      collection: 'services',
      direction: 'payload-to-supabase',
      ...options
    })
  }

  static async syncAppointments(options?: Partial<SyncOptions>): Promise<SyncResult> {
    return PayloadSupabaseSync.syncBidirectional({
      collection: 'appointments',
      ...options
    })
  }

  static async syncProducts(options?: Partial<SyncOptions>): Promise<SyncResult> {
    return PayloadSupabaseSync.syncToSupabase({
      collection: 'products',
      direction: 'payload-to-supabase',
      ...options
    })
  }
}
