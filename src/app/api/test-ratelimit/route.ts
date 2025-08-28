import { NextRequest, NextResponse } from 'next/server'
import { authRateLimiters, getRateLimitIdentifier } from '@/lib/auth-ratelimit'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request, 'api')
    const result = await authRateLimiters.api.check(identifier)

    return NextResponse.json({
      message: 'Rate limit check successful',
      rateLimit: {
        success: result.success,
        remaining: result.remaining,
        limit: result.limit,
        window: result.window,
        usingRedis: result.redis,
        resetTime: result.reset.toISOString()
      }
    })

  } catch (error) {
    console.error('Test rate limit error:', error)
    return NextResponse.json(
      { error: 'Rate limit test failed' },
      { status: 500 }
    )
  }
}
