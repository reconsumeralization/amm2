import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse, handleAPIError } from '@/lib/api-error-handler'
import { searchService } from '@/lib/search-service-simple'
import { searchQuery } from '@/lib/search-core'
import { logger } from '@/lib/logger'

async function handleSearch(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const searchQuery: searchQuery = {
      query,
      filters: {},
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    }

    // Add filters if provided
    if (category) {
      searchQuery.filters!.category = category.split(',')
    }
    if (type) {
      searchQuery.filters!.type = type.split(',')
    }

    logger.info('search request received', {
      query,
      category,
      type,
      limit: searchQuery.limit,
      offset: searchQuery.offset
    })

    const results = await searchService.search(searchQuery)

    return NextResponse.json({
      results: results.results,
      total: results.total,
      query,
      filters: searchQuery.filters,
      analytics: {
        resultsCount: results.total,
        responseTime: results.analytics.responseTime
      },
      message: 'search completed successfully'
    })

  } catch (error) {
    logger.error('search API error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error instanceof Error ? error : undefined)

    return createErrorResponse('search failed', 'INTERNAL_SERVER_ERROR', 500)
  }
}

async function handleSearchAnalytics(request: NextRequest) {
  try {
    const metrics = searchService.getSearchPerformanceMetrics()
    const popularTerms = searchService.getPopularSearchTerms()

    return NextResponse.json({
      metrics,
      popularTerms,
      totalSearches: metrics.totalSearches,
      message: 'search analytics retrieved'
    })

  } catch (error) {
    logger.error('search analytics error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return createErrorResponse('Failed to retrieve analytics', 'INTERNAL_SERVER_ERROR', 500)
  }
}

// Export the main search handler
export const GET = handleSearch

// Handle analytics endpoint
export async function POST(request: NextRequest) {
  if (request.url.includes('/analytics')) {
    return handleSearchAnalytics(request)
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
