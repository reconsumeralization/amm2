/**
 * Payload CMS Synchronization Configuration
 *
 * This file contains configuration settings for keeping Payload CMS
 * synchronized with its database schema and data.
 */

export interface SyncConfig {
  /** Collections to include in synchronization */
  collections: string[]

  /** Environment URLs for cross-environment sync */
  environments: {
    development: string
    staging: string
    production: string
  }

  /** Migration settings */
  migrations: {
    /** Directory for migration files */
    directory: string
    /** Auto-generate migrations on schema changes */
    autoGenerate: boolean
    /** Run migrations automatically */
    autoRun: boolean
  }

  /** Backfill settings */
  backfill: {
    /** Batch size for data processing */
    batchSize: number
    /** Collections that require backfill */
    requiredCollections: string[]
  }

  /** Drizzle settings */
  drizzle: {
    /** Enable Drizzle integration */
    enabled: boolean
    /** Auto-push schema changes */
    autoPush: boolean
  }

  /** Monitoring and logging */
  monitoring: {
    /** Log synchronization events */
    enableLogging: boolean
    /** Send notifications on sync failures */
    enableNotifications: boolean
    /** Notification webhook URL */
    webhookUrl?: string
  }
}

export const syncConfig: SyncConfig = {
  collections: [
    'users',
    'services',
    'customers',
    'appointments',
    'stylists',
    'media',
    'commissions',
    'service-packages',
    'inventory',
    'wait-list',
    'notifications',
    'documentation',
    'documentation-templates',
    'documentation-workflows',
  ],

  environments: {
    development: 'http://localhost:3000',
    staging: 'https://staging.modernmen.com',
    production: 'https://modernmen.com',
  },

  migrations: {
    directory: 'src/migrations',
    autoGenerate: true,
    autoRun: false, // Manual control for production
  },

  backfill: {
    batchSize: 100,
    requiredCollections: ['users', 'customers', 'appointments'],
  },

  drizzle: {
    enabled: true,
    autoPush: false, // Manual control for schema changes
  },

  monitoring: {
    enableLogging: true,
    enableNotifications: true,
    webhookUrl: process.env.SYNC_WEBHOOK_URL,
  },
}

/**
 * Get current environment URL
 */
export function getCurrentEnvironment(): string {
  const env = process.env.NODE_ENV || 'development'
  return syncConfig.environments[env as keyof typeof syncConfig.environments] || syncConfig.environments.development
}

/**
 * Check if collection should be synchronized
 */
export function shouldSyncCollection(collection: string): boolean {
  return syncConfig.collections.includes(collection)
}

/**
 * Get collections that require backfill
 */
export function getBackfillCollections(): string[] {
  return syncConfig.backfill.requiredCollections
}

/**
 * Validate synchronization configuration
 */
export function validateSyncConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required environment variables
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL environment variable is required')
  }

  if (!process.env.PAYLOAD_SECRET) {
    errors.push('PAYLOAD_SECRET environment variable is required')
  }

  // Check webhook URL if notifications are enabled
  if (syncConfig.monitoring.enableNotifications && !syncConfig.monitoring.webhookUrl) {
    errors.push('SYNC_WEBHOOK_URL is required when notifications are enabled')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export default syncConfig
