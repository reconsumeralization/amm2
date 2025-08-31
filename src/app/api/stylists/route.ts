import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getPayloadClient } from '@/payload'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const featured = searchParams.get('featured') === 'true'
    const active = searchParams.get('active') !== 'false'
    const searchQuery = searchParams.get('search')
    const specialization = searchParams.get('specialization')
    const sort = searchParams.get('sort') || 'displayOrder'

    const payload = await getPayloadClient()

    // Build query filters
    const where: any = {}

    if (featured !== undefined) {
      where.featured = { equals: featured }
    }

    if (active !== undefined) {
      where.isActive = { equals: active }
    }

    if (searchQuery) {
      where.or = [
        { name: { like: searchQuery } },
        { bio: { like: searchQuery } }
      ]
    }

    if (specialization) {
      where.specializations = { in: [specialization] }
    }

    // Fetch stylists with pagination
    const stylists = await payload.find({
      collection: 'stylists',
      where,
      page,
      limit,
      sort,
      depth: 2, // Include relationships
    })

    // Transform stylists for frontend
    const transformedStylists = stylists.docs.map((stylist: any) => ({
      id: stylist.id,
      name: stylist.name,
      bio: stylist.bio,
      profileImage: stylist.profileImage,
      specializations: stylist.specializations,
      experience: stylist.experience,
      performance: stylist.performance,
      socialMedia: stylist.socialMedia,
      featured: stylist.featured,
      isActive: stylist.isActive,
      displayOrder: stylist.displayOrder,
      certifications: stylist.experience?.certifications || [],
      awards: stylist.experience?.awards || [],
      portfolio: stylist.portfolio || [],
      schedule: stylist.schedule,
      pricing: stylist.pricing,
    }))

    return createSuccessResponse({
      stylists: transformedStylists,
      total: stylists.totalDocs,
      page: stylists.page,
      totalPages: stylists.totalPages,
      hasNext: stylists.hasNextPage,
      hasPrev: stylists.hasPrevPage,
    })

  } catch (error) {
    console.error('Stylists API error:', error)
    return createErrorResponse('Failed to fetch stylists', 'INTERNAL_SERVER_ERROR')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Check if user is admin or manager
    if ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    const payload = await getPayloadClient()
    const body = await request.json()

    // Validate stylist data (you can add more validation here)
    if (!body.user) {
      return createErrorResponse('User ID is required', 'VALIDATION_ERROR')
    }

    // Create stylist
    const stylist = await payload.create({
      collection: 'stylists',
      data: {
        ...body,
        createdBy: (session as any).user.id,
      },
      depth: 2,
    })

    return createSuccessResponse({
      stylist,
      message: 'Stylist created successfully'
    }, '201')

  } catch (error) {
    console.error('Error creating stylist:', error)
    return createErrorResponse('Failed to create stylist', 'INTERNAL_SERVER_ERROR')
  }
}
