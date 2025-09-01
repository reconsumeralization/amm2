// =====================================================
// SUPABASE UTILITIES: Configuration and Helpers
// Utility functions for Supabase integration
// =====================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

export function validateSupabaseEnv() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missing = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return requiredEnvVars as Record<string, string>
}

// =====================================================
// CLIENT FACTORY
// =====================================================

export function createSupabaseClient(options?: {
  serviceKey?: string
  autoRefreshToken?: boolean
  persistSession?: boolean
}) {
  const env = validateSupabaseEnv()
  
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    options?.serviceKey || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: options?.autoRefreshToken ?? true,
        persistSession: options?.persistSession ?? true,
      },
    }
  )
}

// Service role client (server-side only)
export function createSupabaseServiceClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Service client should only be used server-side')
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  }

  return createSupabaseClient({ serviceKey })
}

// =====================================================
// ERROR HANDLING
// =====================================================

export interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

export function handleSupabaseError(error: any): SupabaseError {
  if (!error) return { message: 'Unknown error occurred' }

  return {
    message: error.message || 'An error occurred',
    code: error.code,
    details: error.details,
    hint: error.hint,
  }
}

export function isSupabaseError(error: any): error is SupabaseError {
  return error && typeof error.message === 'string'
}

// =====================================================
// BATCH OPERATIONS
// =====================================================

export async function batchInsert<T>(
  client: SupabaseClient<Database>,
  tableName: string,
  records: T[],
  batchSize = 100
): Promise<T[]> {
  const results: T[] = []
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    const { data, error } = await client
      .from(tableName)
      .insert(batch.map(record => ({ data: record })))
      .select()

    if (error) throw handleSupabaseError(error)
    if (data) results.push(...(data as T[]))
  }

  return results
}

export async function batchUpdate<T>(
  client: SupabaseClient<Database>,
  tableName: string,
  updates: Array<{ id: string; data: Partial<T> }>,
  batchSize = 50
): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    
    for (const update of batch) {
      const { data, error } = await client
        .from(tableName)
        .update({ data: update.data })
        .eq('id', update.id)
        .select()
        .single()

      if (error) throw handleSupabaseError(error)
      if (data) results.push(data as T)
    }
  }

  return results
}

export async function batchDelete(
  client: SupabaseClient<Database>,
  tableName: string,
  ids: string[],
  batchSize = 100
): Promise<number> {
  let deletedCount = 0

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    
    const { count, error } = await client
      .from(tableName)
      .delete({ count: 'exact' })
      .in('id', batch)

    if (error) throw handleSupabaseError(error)
    deletedCount += count || 0
  }

  return deletedCount
}

// =====================================================
// MIGRATION HELPERS
// =====================================================

export async function runMigration(
  client: SupabaseClient<Database>,
  sql: string
): Promise<void> {
  const { error } = await client.rpc('exec_sql', { sql })
  if (error) throw handleSupabaseError(error)
}

export async function checkTableExists(
  client: SupabaseClient<Database>,
  tableName: string
): Promise<boolean> {
  const { data, error } = await client
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_name', tableName)
    .eq('table_schema', 'public')

  if (error) return false
  return (data?.length || 0) > 0
}

export async function getTableColumns(
  client: SupabaseClient<Database>,
  tableName: string
): Promise<Array<{ column_name: string; data_type: string; is_nullable: string }>> {
  const { data, error } = await client
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', tableName)
    .eq('table_schema', 'public')

  if (error) throw handleSupabaseError(error)
  return data || []
}

// =====================================================
// REALTIME HELPERS
// =====================================================

export function subscribeToTable<T>(
  client: SupabaseClient<Database>,
  tableName: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new?: T
    old?: T
  }) => void,
  filter?: string
) {
  return client
    .channel(`${tableName}_changes`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: tableName,
        filter: filter || undefined
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T,
          old: payload.old as T,
        })
      }
    )
    .subscribe()
}

export function subscribeToUserChanges<T>(
  client: SupabaseClient<Database>,
  tableName: string,
  userId: string,
  callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new?: T; old?: T }) => void
) {
  return subscribeToTable(
    client,
    tableName,
    callback,
    `data->>user_id=eq.${userId}`
  )
}

// =====================================================
// QUERY BUILDERS
// =====================================================

export class SupabaseQueryBuilder<T> {
  private query: any
  private client: SupabaseClient<Database>
  private tableName: string

  constructor(client: SupabaseClient<Database>, tableName: string) {
    this.client = client
    this.tableName = tableName
    this.query = client.from(tableName).select('*')
  }

  where(column: string, operator: string, value: any): this {
    switch (operator) {
      case '=':
      case 'eq':
        this.query = this.query.eq(column, value)
        break
      case '!=':
      case 'neq':
        this.query = this.query.neq(column, value)
        break
      case '>':
      case 'gt':
        this.query = this.query.gt(column, value)
        break
      case '>=':
      case 'gte':
        this.query = this.query.gte(column, value)
        break
      case '<':
      case 'lt':
        this.query = this.query.lt(column, value)
        break
      case '<=':
      case 'lte':
        this.query = this.query.lte(column, value)
        break
      case 'like':
        this.query = this.query.like(column, value)
        break
      case 'ilike':
        this.query = this.query.ilike(column, value)
        break
      case 'in':
        this.query = this.query.in(column, value)
        break
      case 'not_in':
        this.query = this.query.not(column, 'in', value)
        break
      case 'is_null':
        this.query = this.query.is(column, null)
        break
      case 'not_null':
        this.query = this.query.not(column, 'is', null)
        break
      default:
        throw new Error(`Unsupported operator: ${operator}`)
    }
    return this
  }

  orderBy(column: string, ascending = true): this {
    this.query = this.query.order(column, { ascending })
    return this
  }

  limit(count: number): this {
    this.query = this.query.limit(count)
    return this
  }

  offset(count: number): this {
    this.query = this.query.range(count, count + 1000) // Supabase uses range
    return this
  }

  range(from: number, to: number): this {
    this.query = this.query.range(from, to)
    return this
  }

  select(columns: string): this {
    this.query = this.client.from(this.tableName).select(columns)
    return this
  }

  async execute(): Promise<T[]> {
    const { data, error } = await this.query
    if (error) throw handleSupabaseError(error)
    return data as T[]
  }

  async single(): Promise<T | null> {
    const { data, error } = await this.query.single()
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw handleSupabaseError(error)
    }
    return data as T
  }

  async count(): Promise<number> {
    const { count, error } = await this.query.select('*', { count: 'exact', head: true })
    if (error) throw handleSupabaseError(error)
    return count || 0
  }
}

export function createQueryBuilder<T>(
  client: SupabaseClient<Database>,
  tableName: string
): SupabaseQueryBuilder<T> {
  return new SupabaseQueryBuilder<T>(client, tableName)
}

// =====================================================
// PERFORMANCE MONITORING
// =====================================================

export class SupabasePerformanceMonitor {
  private static instance: SupabasePerformanceMonitor
  private queries: Array<{ query: string; duration: number; timestamp: Date }> = []

  static getInstance(): SupabasePerformanceMonitor {
    if (!SupabasePerformanceMonitor.instance) {
      SupabasePerformanceMonitor.instance = new SupabasePerformanceMonitor()
    }
    return SupabasePerformanceMonitor.instance
  }

  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await queryFn()
      const duration = performance.now() - startTime
      
      this.queries.push({
        query: queryName,
        duration,
        timestamp: new Date(),
      })

      // Keep only last 100 queries
      if (this.queries.length > 100) {
        this.queries = this.queries.slice(-100)
      }

      if (duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`Query failed: ${queryName} took ${duration.toFixed(2)}ms`, error)
      throw error
    }
  }

  getPerformanceStats() {
    if (this.queries.length === 0) return null

    const durations = this.queries.map(q => q.duration)
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const maxDuration = Math.max(...durations)
    const minDuration = Math.min(...durations)

    return {
      totalQueries: this.queries.length,
      avgDuration: Math.round(avgDuration),
      maxDuration: Math.round(maxDuration),
      minDuration: Math.round(minDuration),
      slowQueries: this.queries.filter(q => q.duration > 1000).length,
    }
  }

  clearStats(): void {
    this.queries = []
  }
}

export const performanceMonitor = SupabasePerformanceMonitor.getInstance()

// =====================================================
// CACHE HELPERS
// =====================================================

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of cached items
}

export class SupabaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize: number

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000
  }

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  size(): number {
    return this.cache.size
  }
}

export const supabaseCache = new SupabaseCache()

// =====================================================
// TYPE GUARDS
// =====================================================

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function hasRequiredFields<T extends Record<string, any>>(
  obj: any,
  fields: Array<keyof T>
): obj is T {
  return fields.every(field => obj && obj[field] !== undefined)
}

// =====================================================
// EXPORT CONFIGURED CLIENT
// =====================================================

export const supabase = createSupabaseClient()