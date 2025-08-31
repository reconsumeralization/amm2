import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getPayloadClient } from '@/payload'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler'



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayloadClient()
    const { id } = await params

    const stylist = await payload.findByID({
      collection: 'stylists',
      id,
      depth: 3, // Include deep related data
    })

    if (!stylist) {
      return createErrorResponse('Stylist not found', ERROR_CODES.RESOURCE_NOT_FOUND, 404)
    }

    // Transform for frontend
    const transformedStylist = {
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
      portfolio: stylist.portfolio || [],
      schedule: stylist.schedule,
      pricing: stylist.pricing,
      certifications: stylist.experience?.certifications || [],
      awards: stylist.experience?.awards || [],
    }

    return createSuccessResponse({ stylist: transformedStylist })

  } catch (error) {
    console.error('Stylist detail API error:', error)
    return createErrorResponse('Failed to fetch stylist details', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401)
    }

    const payload = await getPayloadClient()
    const { id } = await params
    const body = await request.json()

    // Check permissions - admin can update any stylist, stylists can update their own profile
    if ((session as any).user.role !== 'admin') {
      // For non-admin users, verify they own the stylist profile
      const existingStylist = await payload.findByID({
        collection: 'stylists',
        id,
      })

      if (!existingStylist || existingStylist.user !== (session as any).user.id) {
        return createErrorResponse('Insufficient permissions', ERROR_CODES.FORBIDDEN, 403)
      }
    }

    // Update stylist
    const updatedStylist = await payload.update({
      collection: 'stylists',
      id,
      data: {
        ...body,
        updatedBy: (session as any).user.id,
      },
      depth: 2,
    })

    return createSuccessResponse({
      stylist: updatedStylist,
      message: 'Stylist updated successfully'
    })

  } catch (error) {
    console.error('Error updating stylist:', error)
    return createErrorResponse('Failed to update stylist', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401)
    }

    // Only admins can delete stylists
    if ((session as any).user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', ERROR_CODES.FORBIDDEN, 403)
    }

    const payload = await getPayloadClient()
    const { id } = await params

    // Check if stylist exists
    const stylist = await payload.findByID({
      collection: 'stylists',
      id,
    })

    if (!stylist) {
      return createErrorResponse('Stylist not found', ERROR_CODES.RESOURCE_NOT_FOUND, 404)
    }

    // Delete stylist
    await payload.delete({
      collection: 'stylists',
      id,
    })

    return createSuccessResponse({
      message: 'Stylist deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting stylist:', error)
    return createErrorResponse('Failed to delete stylist', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
  }
}
