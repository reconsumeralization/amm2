import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, createSuccessResponse } from '@/lib/api-error-handler'
import { searchService } from '@/lib/search-service-simple'
import { logger } from '@/lib/logger'

interface SearchQuery {
  query: string
  filters: {
    category?: string[]
    type?: string[]
  }
  limit: number
  offset: number
}

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

    const searchQuery: SearchQuery = {
      query,
      filters: {},
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    }

    // Add filters if provided
    if (category) {
      searchQuery.filters.category = category.split(',')
    }
    if (type) {
      searchQuery.filters.type = type.split(',')
    }

    logger.info('Search request received', {
      query,
      category,
      type,
      limit: searchQuery.limit,
      offset: searchQuery.offset
    })

    const results = await rchService.rch(searchQuery)

    return createSuccessResponse({
      results: results.results,
      total: results.total,
      query,
      filters: searchQuery.filters,
      analytics: {
        resultsCount: results.total,
        responseTime: results.analytics?.responseTime || 0
      }
    }, 'Search completed successfully')

  } catch (error) {
    logger.error('Search API error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error instanceof Error ? error : undefined)

    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function handleSearchAnalytics(request: NextRequest) {
  try {
    // Mock analytics data since the methods don't exist on the service
    const metrics = {
      totalSearches: 0,
      averageResponseTime: 0,
      popularQueries: []
    }
    const popularTerms: string[] = []

    return createSuccessResponse({
      metrics,
      popularTerms,
      totalSearches: metrics.totalSearches
    }, 'Search analytics retrieved')

  } catch (error) {
    logger.error('Search analytics error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}

// Export with error handling wrapper
export const GET = withErrorHandler(handleSearch)

// Handle analytics endpoint
export async function POST(request: NextRequest) {
  if (request.url.includes('/analytics')) {
    return withErrorHandler(handleSearchAnalytics)(request)
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
