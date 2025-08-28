import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiting configuration for different auth operations
const AUTH_RATE_LIMITS = {
  signin: {
    requests: 5,
    window: '5m', // 5 requests per 5 minutes
    description: 'Sign in attempts'
  },
  signup: {
    requests: 3,
    window: '1h', // 3 registrations per hour
    description: 'User registrations'
  },
  forgotPassword: {
    requests: 3,
    window: '1h', // 3 password reset requests per hour
    description: 'Password reset requests'
  },
  resetPassword: {
    requests: 5,
    window: '1h', // 5 password reset attempts per hour
    description: 'Password reset attempts'
  },
  api: {
    requests: 100,
    window: '1m', // 100 requests per minute for general API
    description: 'API requests'
  }
}

// Environment validation
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const isProduction = process.env.NODE_ENV === 'production'
// Only enable Redis if we have valid URLs (not placeholder values)
const enableRedis = REDIS_URL && REDIS_TOKEN && 
  REDIS_URL !== 'your-redis-url' && 
  REDIS_URL !== 'your_production_redis_url' &&
  REDIS_URL !== 'your-actual-redis-url' &&
  !REDIS_URL.includes('your-redis-url')

// Initialize Redis connection
let redis: Redis | null = null
let redisConnectionError: Error | null = null

if (enableRedis) {
  try {
    redis = new Redis({
      url: REDIS_URL!,
      token: REDIS_TOKEN!,
    })

    // Test Redis connection
    if (isProduction) {
      redis.ping().catch((error) => {
        console.error('Redis connection failed:', error)
        redisConnectionError = error
      })
    }
  } catch (error) {
    console.error('Failed to initialize Redis:', error)
    redisConnectionError = error as Error
  }
}

// Global rate limiter for fallback
let globalRateLimiter: Ratelimit | null = null

if (redis && !redisConnectionError) {
  try {
    globalRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 requests per minute global limit
    })
  } catch (error) {
    console.error('Failed to create global rate limiter:', error)
  }
}

// In-memory rate limiting store for development
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

function getInMemoryRatelimit(requests: number, windowMs: number) {
  return {
    limit: async (identifier: string) => {
      const now = Date.now()
      const key = identifier
      const stored = inMemoryStore.get(key)

      if (!stored || now > stored.resetTime) {
        inMemoryStore.set(key, { count: 1, resetTime: now + windowMs })
        return { success: true, remaining: requests - 1 }
      }

      if (stored.count >= requests) {
        return {
          success: false,
          remaining: 0,
          reset: new Date(stored.resetTime)
        }
      }

      stored.count++
      return { success: true, remaining: requests - stored.count }
    }
  }
}

export class AuthRateLimiter {
  private limiter: Ratelimit | ReturnType<typeof getInMemoryRatelimit>
  private fallbackLimiter: ReturnType<typeof getInMemoryRatelimit>
  private useRedis: boolean

  constructor(private config: typeof AUTH_RATE_LIMITS.signin) {
    this.useRedis = Boolean(enableRedis && redis !== null && !redisConnectionError)
    this.fallbackLimiter = getInMemoryRatelimit(config.requests, this.parseWindow(config.window))

    if (this.useRedis && redis) {
      try {
        // Use Redis-based rate limiting
        this.limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.requests, config.window as any),
        })
      } catch (error) {
        console.error(`Failed to create Redis rate limiter for ${config.description}:`, error)
        this.useRedis = false
        this.limiter = this.fallbackLimiter
      }
    } else {
      // Use in-memory rate limiting
      this.limiter = this.fallbackLimiter
    }

    if (!this.useRedis && isProduction) {
      console.warn(`Using in-memory rate limiting for ${config.description} - consider setting UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN`)
    }
  }

  private parseWindow(window: string): number {
    const match = window.match(/(\d+)([smhd])/)
    if (!match) return 60000 // Default to 1 minute

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's': return value * 1000
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      case 'd': return value * 24 * 60 * 60 * 1000
      default: return 60000
    }
  }

  async check(identifier: string) {
    const startTime = Date.now()

    try {
      let result: any

      if (this.useRedis && this.limiter instanceof Ratelimit) {
        // Use Redis rate limiter
        result = await this.limiter.limit(identifier)
      } else {
        // Use in-memory rate limiter
        result = await (this.limiter as ReturnType<typeof getInMemoryRatelimit>).limit(identifier)
      }

      const responseTime = Date.now() - startTime
      if (responseTime > 1000 && isProduction) {
        console.warn(`Rate limit check took ${responseTime}ms for ${identifier}`)
      }

      return {
        success: result.success,
        remaining: result.remaining || 0,
        reset: result.reset || new Date(Date.now() + this.parseWindow(this.config.window)),
        limit: this.config.requests,
        window: this.config.window,
        redis: this.useRedis
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`Rate limit error for ${identifier} (${responseTime}ms):`, error)

      // In production with Redis, try fallback to in-memory
      if (this.useRedis && isProduction) {
        try {
          console.warn(`Falling back to in-memory rate limiting for ${identifier}`)
          const fallbackResult = await this.fallbackLimiter.limit(identifier)
          return {
            success: fallbackResult.success,
            remaining: fallbackResult.remaining || 0,
            reset: fallbackResult.reset || new Date(Date.now() + this.parseWindow(this.config.window)),
            limit: this.config.requests,
            window: this.config.window,
            redis: false,
            fallback: true
          }
        } catch (fallbackError) {
          console.error(`Fallback rate limiting also failed for ${identifier}:`, fallbackError)
        }
      }

      // Final fallback: allow request but log the issue
      console.error(`Rate limiting completely failed for ${identifier} - allowing request`)
      return {
        success: true,
        remaining: this.config.requests - 1,
        reset: new Date(Date.now() + this.parseWindow(this.config.window)),
        limit: this.config.requests,
        window: this.config.window,
        redis: false,
        error: true
      }
    }
  }
}

// Export pre-configured rate limiters
export const authRateLimiters = {
  signin: new AuthRateLimiter(AUTH_RATE_LIMITS.signin),
  signup: new AuthRateLimiter(AUTH_RATE_LIMITS.signup),
  forgotPassword: new AuthRateLimiter(AUTH_RATE_LIMITS.forgotPassword),
  resetPassword: new AuthRateLimiter(AUTH_RATE_LIMITS.resetPassword),
  api: new AuthRateLimiter(AUTH_RATE_LIMITS.api),
}

// Helper function to get rate limit from request
export function getRateLimitIdentifier(request: Request, type: keyof typeof AUTH_RATE_LIMITS): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  switch (type) {
    case 'signin':
    case 'signup':
      return `auth:${type}:${ip}`
    case 'forgotPassword':
    case 'resetPassword':
      return `auth:${type}:${ip}`
    case 'api':
      return `api:${ip}`
    default:
      return `auth:${type}:${ip}`
  }
}

// Helper function to create rate limit response
export function createRateLimitResponse(result: any) {
  const resetTime = Math.ceil((result.reset.getTime() - Date.now()) / 1000)

  return new Response(JSON.stringify({
    error: 'Rate limit exceeded',
    message: `Too many requests. Please try again in ${Math.ceil(resetTime / 60)} minutes.`,
    retryAfter: resetTime,
    details: {
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset.toISOString(),
      window: result.window,
      usingRedis: result.redis,
      fallbackMode: result.fallback,
      errorOccurred: result.error
    }
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toISOString(),
      'Retry-After': resetTime.toString(),
      'X-RateLimit-Using-Redis': result.redis ? 'true' : 'false'
    }
  })
}

// Health check function for Redis connection
export async function checkRedisHealth(): Promise<{
  healthy: boolean
  redis: boolean
  fallback: boolean
  error?: string
}> {
  try {
    if (!enableRedis) {
      return {
        healthy: true,
        redis: false,
        fallback: true,
        error: 'Redis not configured'
      }
    }

    if (redisConnectionError) {
      return {
        healthy: false,
        redis: false,
        fallback: true,
        error: redisConnectionError.message
      }
    }

    if (redis) {
      try {
        await redis.ping()
        return {
          healthy: true,
          redis: true,
          fallback: false
        }
      } catch (error) {
        return {
          healthy: false,
          redis: false,
          fallback: true,
          error: (error as Error).message
        }
      }
    }

    return {
      healthy: false,
      redis: false,
      fallback: true,
      error: 'Redis not initialized'
    }
  } catch (error) {
    return {
      healthy: false,
      redis: false,
      fallback: true,
      error: (error as Error).message
    }
  }
}
