import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const specialization = searchParams.get('specialization')
    const limit = parseInt(searchParams.get('limit') || '20')
    const featured = searchParams.get('featured') === 'true'

    if (!query || query.length < 2) {
      return createErrorResponse('Search query must be at least 2 characters', 'VALIDATION_ERROR')
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()

    // Build search query
    const where: any = {
      isActive: { equals: true },
      or: [
        { name: { like: query } },
        { bio: { like: query } }
      ]
    }

    // Add specialization filter if provided
    if (specialization) {
      where.specializations = { in: [specialization] }
    }

    // Add featured filter if requested
    if (featured) {
      where.featured = { equals: true }
    }

    // Search stylists
    const stylists = await payload.find({
      collection: 'stylists',
      where,
      limit,
      sort: 'name',
      depth: 1,
    })

    // Format search results
    const results = stylists.docs.map((stylist: any) => ({
      id: stylist.id,
      name: stylist.name,
      bio: stylist.bio,
      profileImage: stylist.profileImage,
      specializations: stylist.specializations,
      experience: stylist.experience,
      performance: stylist.performance,
      featured: stylist.featured,
      type: 'stylist'
    }))

    return createSuccessResponse({
      query,
      results,
      total: stylists.totalDocs,
      filters: {
        specialization,
        featured
      }
    })

  } catch (error) {
    console.error('Error searching stylists:', error)
    return createErrorResponse('Failed to search stylists', 'INTERNAL_SERVER_ERROR')
  }
}
