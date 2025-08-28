import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { DocumentationSearchService } from '@/lib/search-service'
import { SearchConfig, SearchQueryParams } from '@/lib/search-service'
import { getUserRoleFromSession } from '@/lib/documentation-permissions'

// Initialize search service
const searchConfig: SearchConfig = {
  provider: 'local',
  indexName: 'documentation',
  maxResults: 50,
  enableFacets: true,
  enableSuggestions: true,
  enableAnalytics: true,
  enableHighlighting: true,
  enableTypoTolerance: true,
  enableSynonyms: true,
  rankingConfig: {
    roleBasedBoost: {
      guest: 1,
      salon_customer: 1.1,
      salon_employee: 1.2,
      salon_owner: 1.3,
      developer: 1.4,
      system_admin: 1.5
    },
    recencyBoost: 0.01,
    popularityBoost: 0.001,
    accuracyBoost: 1.5,
    completionRateBoost: 0.5,
    ratingBoost: 0.3,
    viewsBoost: 0.0001,
    titleBoost: 3,
    descriptionBoost: 2,
    contentBoost: 1,
    tagsBoost: 2
  }
}

const searchService = new DocumentationSearchService(searchConfig)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortField = searchParams.get('sort') || 'relevance'
    const sortDirection = searchParams.get('order') || 'desc'
    
    // Parse filters from query parameters
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []
    const contentTypes = searchParams.get('types')?.split(',').filter(Boolean) || []
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const difficulty = searchParams.get('difficulty')?.split(',').filter(Boolean) || []
    const authors = searchParams.get('authors')?.split(',').filter(Boolean) || []
    const sections = searchParams.get('sections')?.split(',').filter(Boolean) || []

    // Get user session and role
    const session = await getServerSession()
    const userRole = getUserRoleFromSession(session)

    // Build search query
    const searchQuery: SearchQueryParams = {
      query,
      filters: {
        categories,
        contentTypes: contentTypes as any[],
        tags,
        difficulty: difficulty as any[],
        authors,
        sections,
        roles: [] // Will be handled by role-based filtering in service
      },
      pagination: {
        page,
        limit,
        offset: (page - 1) * limit
      },
      sorting: {
        field: sortField as any,
        direction: sortDirection as 'asc' | 'desc'
      }
    }

    // Perform search
    const searchResponse = await searchService.search(searchQuery, userRole)

    return NextResponse.json(searchResponse)
  } catch (error) {
    console.error('search API error:', error)
    return NextResponse.json(
      { error: 'search service unavailable' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters, pagination, sorting } = body

    // Get user session and role
    const session = await getServerSession()
    const userRole = getUserRoleFromSession(session)

    // Build search query
    const searchQuery: SearchQueryParams = {
      query: query || '',
      filters: filters || {},
      pagination: pagination || { page: 1, limit: 20, offset: 0 },
      sorting: sorting || { field: 'relevance', direction: 'desc' }
    }

    // Perform search
    const searchResponse = await searchService.search(searchQuery, userRole)

    return NextResponse.json(searchResponse)
  } catch (error) {
    console.error('search API error:', error)
    return NextResponse.json(
      { error: 'search service unavailable' },
      { status: 500 }
    )
  }
}