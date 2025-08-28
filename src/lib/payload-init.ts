import getPayloadClient from '../payload'
import { logger } from './logger'

export async function initializePayload() {
  try {
    logger.info('Initializing Payload CMS...')

    const payload = await getPayloadClient()

    // Test database connection
    await payload.db.connect()
    logger.info('✅ Database connection successful')

    // Test collections
    const collections = [
      'users', 'services', 'customers', 'appointments',
      'stylists', 'media', 'commissions', 'service-packages',
      'inventory', 'wait-list', 'notifications', 'documentation'
    ]

    for (const collection of collections) {
      try {
        await payload.count({ collection })
        logger.info(`✅ Collection '${collection}' is accessible`)
      } catch (error) {
        logger.warn(`⚠️  Collection '${collection}' may not exist yet:`, { 
          collection,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Create default admin user if none exists
    try {
      const adminUsers = await payload.find({
        collection: 'users',
        where: {
          role: {
            equals: 'admin'
          }
        },
        limit: 1
      })

      if (adminUsers.docs.length === 0) {
        logger.info('Creating default admin user...')
        await payload.create({
          collection: 'users',
          data: {
            email: 'admin@modernmen.com',
            firstName: 'Modern',
            lastName: 'Men',
            role: 'admin',
            isActive: true,
          }
        })
        logger.info('✅ Default admin user created')
      } else {
        logger.info('✅ Admin user already exists')
      }
    } catch (error) {
      logger.error('Failed to create admin user:', { operation: 'create_admin_user' }, error instanceof Error ? error : undefined)
    }

    logger.info('🎉 Payload CMS initialization complete!')
    return payload

  } catch (error) {
    logger.error('❌ Payload CMS initialization failed:', { operation: 'payload_init' }, error instanceof Error ? error : undefined)
    throw error
  }
}

// Health check function for Payload
export async function checkPayloadHealth() {
  try {
    const payload = await getPayloadClient()
    await payload.db.connect()
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Function to seed initial data
export async function seedInitialData() {
  try {
    const payload = await getPayloadClient()

    logger.info('🌱 Seeding initial data...')

    // Create default services
    const defaultServices = [
      {
        name: 'Premium Haircut',
        description: 'Professional haircut with styling',
        duration: 30,
        price: 35,
        category: 'hair',
        isActive: true
      },
      {
        name: 'Hot Towel Shave',
        description: 'Traditional hot towel shave experience',
        duration: 45,
        price: 50,
        category: 'shave',
        isActive: true
      },
      {
        name: 'Beard Trim & Style',
        description: 'Expert beard grooming and styling',
        duration: 25,
        price: 25,
        category: 'beard',
        isActive: true
      }
    ]

    for (const service of defaultServices) {
      const existing = await payload.find({
        collection: 'services',
        where: { name: { equals: service.name } },
        limit: 1
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'services',
          data: service
        })
        logger.info(`✅ Created service: ${service.name}`)
      }
    }

    logger.info('✅ Initial data seeding complete!')
  } catch (error) {
    logger.error('❌ Failed to seed initial data:', { operation: 'seed_data' }, error instanceof Error ? error : undefined)
    throw error
  }
}
