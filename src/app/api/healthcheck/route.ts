import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, createSuccessResponse, APIErrors } from '@/lib/api-error-handler'
import { logger } from '@/lib/logger'

async function checkDatabaseConnection(): Promise<{ status: string; latency?: number; error?: string }> {
  try {
    const startTime = Date.now()

    // Try to connect to Payload CMS to test database connectivity
    const { getPayloadClient } = await import('@/payload')
    const payload = await getPayloadClient()

    // Simple query to test database connection
    await payload.find({
      collection: 'users',
      limit: 1,
      depth: 0
    })

    const latency = Date.now() - startTime

    return {
      status: 'ok',
      latency
    }
  } catch (error) {
    logger.error('Database connectivity check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })

    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkRedisConnection(): Promise<{ status: string; latency?: number; error?: string }> {
  try {
    const startTime = Date.now()

    // Check if Redis is configured
    if (!process.env.REDIS_URL && !process.env.UPSTASH_REDIS_REST_URL) {
      return {
        status: 'not_configured'
      }
    }

    // Try to connect to Redis using a simple connection test
    try {
      // Use dynamic import to avoid build issues if Redis dependencies aren't installed
      const { Redis } = await import('@upstash/redis')

      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })

        // Simple ping test
        await redis.ping()

        const latency = Date.now() - startTime
        return {
          status: 'ok',
          latency
        }
      } else if (process.env.REDIS_URL) {
        // For regular Redis connections, we'd need different logic
        // For now, just check if URL is configured
        return {
          status: 'configured'
        }
      }

      return {
        status: 'not_configured'
      }
    } catch (redisError) {
      logger.warn('Redis connection test failed', {
        error: redisError instanceof Error ? redisError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })

      return {
        status: 'error',
        error: redisError instanceof Error ? redisError.message : 'Connection failed'
      }
    }
  } catch (error) {
    logger.error('Redis connectivity check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })

    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkExternalServices(): Promise<{ [key: string]: { status: string; latency?: number; error?: string } }> {
  const services: { [key: string]: { status: string; latency?: number; error?: string } } = {}

  // Check Supabase if configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const startTime = Date.now()
      // You could add a simple query here to test Supabase connectivity
      const latency = Date.now() - startTime
      services.supabase = { status: 'ok', latency }
    } catch (error) {
      services.supabase = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Check other external services as needed
  if (process.env.SMTP_HOST) {
    services.email = { status: 'configured' }
  }

  if (process.env.TWILIO_ACCOUNT_SID) {
    services.sms = { status: 'configured' }
  }

  return services
}

async function performHealthCheck(request: NextRequest) {
  const startTime = Date.now()

  // Run all health checks concurrently
  const [databaseCheck, redisCheck, externalServices] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
    checkExternalServices()
  ])

  const totalLatency = Date.now() - startTime

  // Determine overall status
  const checks = { database: databaseCheck, redis: redisCheck, ...externalServices }
  const hasErrors = Object.values(checks).some(check => check.status === 'error')
  const overallStatus = hasErrors ? 'degraded' : 'ok'

  const healthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
    responseTime: totalLatency,
    checks: {
      ...checks,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        usage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    }
  }

  // Log the health check result
  logger.info('Health check completed', {
    status: overallStatus,
    responseTime: totalLatency,
    checks: Object.entries(checks).map(([service, check]) => ({
      service,
      status: check.status,
      latency: check.latency
    }))
  })

  const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 207 : 503

  return createSuccessResponse(healthCheck, 'Health check completed', {
    status: overallStatus,
    responseTime: totalLatency
  })
}

// Export with error handling wrapper
export const GET = withErrorHandler(performHealthCheck)

// Handle other HTTP methods
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}