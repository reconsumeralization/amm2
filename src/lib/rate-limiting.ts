import { NextApiRequest, NextApiResponse } from 'next'
import { yoloMonitoring } from './monitoring'

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Error message
  statusCode?: number // HTTP status code
  headers?: boolean // Whether to include rate limit headers
  skipSuccessfulRequests?: boolean // Skip rate limiting for successful requests
  skipFailedRequests?: boolean // Skip rate limiting for failed requests
  keyGenerator?: (req: NextApiRequest) => string // Custom key generator
}

// Default configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later.',
  statusCode: 429,
  headers: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

// In-memory store for rate limiting (use Redis in production)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const resetTime = now + windowMs

    const existing = this.store.get(key)
    if (existing && existing.resetTime > now) {
      existing.count++
      return existing
    }

    const newEntry = { count: 1, resetTime }
    this.store.set(key, newEntry)
    return newEntry
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    if (entry.resetTime <= Date.now()) {
      this.store.delete(key)
      return null
    }

    return entry
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore()

// Clean up expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    rateLimitStore.cleanup()
  }, 5 * 60 * 1000)
}

// Generate rate limit key
function generateKey(req: NextApiRequest, config: RateLimitConfig): string {
  if (config.keyGenerator) {
    return config.keyGenerator(req)
  }

  // Default key generation based on IP and user agent
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'
  
  // If user is authenticated, include user ID
  const userId = (req as any).user?.id || 'anonymous'
  
  return `rate_limit:${userId}:${ip}:${userAgent}`
}

// Rate limiting middleware
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return function rateLimitMiddleware(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  ) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const key = generateKey(req, finalConfig)
        const { count, resetTime } = await rateLimitStore.increment(key, finalConfig.windowMs)

        // Set rate limit headers
        if (finalConfig.headers) {
          res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests.toString())
          res.setHeader('X-RateLimit-Remaining', Math.max(0, finalConfig.maxRequests - count).toString())
          res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
        }

        // Check if rate limit exceeded
        if (count > finalConfig.maxRequests) {
          // Track rate limit violation
          yoloMonitoring.trackApiPerformance(req.url || 'unknown', 0, finalConfig.statusCode || 429)

          res.status(finalConfig.statusCode || 429).json({
            error: 'Rate limit exceeded',
            message: finalConfig.message,
            retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
          })
          return
        }

        // Call the original handler
        await handler(req, res)

        // Track successful request
        if (!finalConfig.skipSuccessfulRequests) {
          yoloMonitoring.trackApiPerformance(req.url || 'unknown', 0, res.statusCode)
        }
      } catch (error) {
        // Track failed request
        if (!finalConfig.skipFailedRequests) {
          yoloMonitoring.captureException(error as Error, {
            endpoint: req.url,
            method: req.method,
            userAgent: req.headers['user-agent'],
          })
        }

        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        })
      }
    }
  }
}

// Collection-specific rate limiting
export const collectionRateLimits = {
  customers: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50, // 50 requests per 5 minutes
    message: 'Too many customer operations, please try again later.',
  },
  appointments: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
    message: 'Too many appointment operations, please try again later.',
  },
  services: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 100, // 100 requests per 10 minutes
    message: 'Too many service operations, please try again later.',
  },
  stylists: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30, // 30 requests per 5 minutes
    message: 'Too many stylist operations, please try again later.',
  },
  users: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 25, // 25 requests per 5 minutes
    message: 'Too many user operations, please try again later.',
  },
}

// Helper function to get rate limit config for a collection
export function getCollectionRateLimit(collection: string): RateLimitConfig {
  return collectionRateLimits[collection as keyof typeof collectionRateLimits] || defaultConfig
}

// Rate limiting for specific operations
export const operationRateLimits = {
  create: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 10, // 10 create operations per minute
    message: 'Too many create operations, please try again later.',
  },
  update: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20, // 20 update operations per minute
    message: 'Too many update operations, please try again later.',
  },
  delete: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 5, // 5 delete operations per minute
    message: 'Too many delete operations, please try again later.',
  },
  read: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 read operations per minute
    message: 'Too many read operations, please try again later.',
  },
}

// Helper function to get rate limit config for an operation
export function getOperationRateLimit(operation: string): RateLimitConfig {
  return operationRateLimits[operation as keyof typeof operationRateLimits] || defaultConfig
}

// Advanced rate limiting with user-based limits
export function userRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return function userRateLimitMiddleware(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  ) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Get user from request (assuming authentication middleware has run)
        const user = (req as any).user
        if (!user) {
          res.status(401).json({ error: 'Authentication required' })
          return
        }

        // Generate user-specific key
        const key = `user_rate_limit:${user.id}:${req.url}`
        const { count, resetTime } = await rateLimitStore.increment(key, finalConfig.windowMs)

        // Set rate limit headers
        if (finalConfig.headers) {
          res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests.toString())
          res.setHeader('X-RateLimit-Remaining', Math.max(0, finalConfig.maxRequests - count).toString())
          res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
        }

        // Check if rate limit exceeded
        if (count > finalConfig.maxRequests) {
          yoloMonitoring.trackApiPerformance(req.url || 'unknown', 0, finalConfig.statusCode || 429)

          res.status(finalConfig.statusCode || 429).json({
            error: 'Rate limit exceeded',
            message: finalConfig.message,
            retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
            userId: user.id,
          })
          return
        }

        // Call the original handler
        await handler(req, res)

        // Track successful request
        if (!finalConfig.skipSuccessfulRequests) {
          yoloMonitoring.trackApiPerformance(req.url || 'unknown', 0, res.statusCode)
        }
      } catch (error) {
        if (!finalConfig.skipFailedRequests) {
          yoloMonitoring.captureException(error as Error, {
            endpoint: req.url,
            method: req.method,
            userId: (req as any).user?.id,
          })
        }

        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        })
      }
    }
  }
}

// Export default rate limiting middleware
export default rateLimit
