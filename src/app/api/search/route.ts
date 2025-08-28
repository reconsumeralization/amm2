import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, createSuccessResponse } from '@/lib/api-error-handler'
import { rchService } from '@/lib/search-service-simple'
import { rchQuery } from '@/lib/rch-core'
import { logger } from '@/lib/logger'

async function handlerch(request: NextRequest) {
  try {
    const { rchParams } = new URL(request.url)
    const query = rchParams.get('q')
    const category = rchParams.get('category')
    const type = rchParams.get('type')
    const limit = rchParams.get('limit')
    const offset = rchParams.get('offset')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const rchQuery: rchQuery = {
      query,
      filters: {},
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    }

    // Add filters if provided
    if (category) {
      rchQuery.filters!.category = category.split(',')
    }
    if (type) {
      rchQuery.filters!.type = type.split(',')
    }

    logger.info('rch request received', {
      query,
      category,
      type,
      limit: rchQuery.limit,
      offset: rchQuery.offset
    })

    const results = await rchService.rch(rchQuery)

    return createSuccessResponse({
      results: results.results,
      total: results.total,
      query,
      filters: rchQuery.filters,
      analytics: {
        resultsCount: results.total,
        responseTime: results.analytics.responseTime
      }
    }, 'rch completed successfully')

  } catch (error) {
    logger.error('rch API error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error instanceof Error ? error : undefined)

    return NextResponse.json(
      { error: 'rch failed' },
      { status: 500 }
    )
  }
}

async function handlerchAnalytics(request: NextRequest) {
  try {
    const metrics = rchService.getrchPerformanceMetrics()
    const popularTerms = rchService.getPopularrchTerms()

    return createSuccessResponse({
      metrics,
      popularTerms,
      totalrches: metrics.totalrches
    }, 'rch analytics retrieved')

  } catch (error) {
    logger.error('rch analytics error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}

// Export with error handling wrapper
export const GET = withErrorHandler(handlerch)

// Handle analytics endpoint
export async function POST(request: NextRequest) {
  if (request.url.includes('/analytics')) {
    return withErrorHandler(handlerchAnalytics)(request)
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
