import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayload } from 'payload'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check if user has content access
    if (session.user.role !== 'admin' && session.user.role !== 'barber' && session.user.role !== 'manager') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const { searchParams } = new URL(request.url)
    const tenantId = request.headers.get('X-Tenant-ID') || searchParams.get('tenantId')
    const slug = searchParams.get('slug')
    const status = searchParams.get('status') || 'published'
    const pageType = searchParams.get('pageType')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const template = searchParams.get('template')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'updatedAt'

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 400)
    }

    const payload = await getPayload()

    // Build query filters
    const where: any = {
      tenant: { equals: tenantId }
    }

    if (slug) {
      where.slug = { equals: slug }
    }

    if (status && status !== 'all') {
      where.status = { equals: status }
    }

    if (pageType) {
      where.pageType = { equals: pageType }
    }

    if (category) {
      where.category = { like: category }
    }

    if (featured !== undefined) {
      where.featured = { equals: featured === 'true' }
    }

    if (search) {
      where.or = [
        { title: { like: search } },
        { description: { like: search } },
        { tags: { tag: { like: search } } }
      ]
    }

    if (template) {
      where.template = { equals: template }
    }

    // Fetch content with pagination
    const content = await payload.find({
      collection: 'content',
      where,
      page,
      limit,
      sort,
      depth: 2, // Include relationships
    })

    // Transform content for frontend
    const transformedContent = content.docs.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      content: item.content,
      lexicalContent: item.lexicalContent,
      status: item.status,
      pageType: item.pageType,
      category: item.category,
      tags: item.tags || [],
      featured: item.featured,
      featuredOrder: item.featuredOrder,
      seo: item.seo,
      analytics: item.analytics,
      settings: item.settings,
      media: item.media || [],
      template: item.template,
      theme: item.theme,
      version: item.version,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
      publishedBy: item.publishedBy,
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    return createSuccessResponse({
      content: transformedContent,
      total: content.totalDocs,
      page: content.page,
      totalPages: content.totalPages,
      hasNext: content.hasNextPage,
      hasPrev: content.hasPrevPage,
    })

  } catch (error) {
    console.error('Error fetching content:', error)
    return createErrorResponse('Failed to fetch content', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check if user can create content
    if (session.user.role !== 'admin' && session.user.role !== 'barber' && session.user.role !== 'manager') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const payload = await getPayload()
    const body = await request.json()
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 400)
    }

    // Validate required fields
    if (!body.title || !body.slug) {
      return createErrorResponse('Title and slug are required', 400)
    }

    // Check if slug is unique
    const existingContent = await payload.find({
      collection: 'content',
      where: {
        tenant: { equals: tenantId },
        slug: { equals: body.slug }
      },
      limit: 1,
    })

    if (existingContent.docs.length > 0) {
      return createErrorResponse('Slug already exists', 400)
    }

    // Create content
    const content = await payload.create({
      collection: 'content',
      data: {
        ...body,
        tenant: tenantId,
        createdBy: session.user.id,
        version: 1,
      },
      depth: 2,
    })

    return createSuccessResponse({
      content,
      message: 'Content created successfully'
    }, 201)

  } catch (error) {
    console.error('Error creating content:', error)
    return createErrorResponse('Failed to create content', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const payload = await getPayload()
    const body = await request.json()
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId
    const { id, ...updateData } = body

    if (!id || !tenantId) {
      return createErrorResponse('Content ID and Tenant ID are required', 400)
    }

    // Check if user can update this content
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
      const existingContent = await payload.findByID({
        collection: 'content',
        id,
      })

      if (!existingContent || existingContent.createdBy !== session.user.id) {
        return createErrorResponse('Insufficient permissions', 403)
      }
    }

    // Increment version for updates
    const currentContent = await payload.findByID({
      collection: 'content',
      id,
    })

    updateData.version = (currentContent.version || 1) + 1
    updateData.updatedBy = session.user.id

    // Handle publishing
    if (updateData.status === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date()
      updateData.publishedBy = session.user.id
    }

    // Update content
    const updatedContent = await payload.update({
      collection: 'content',
      id,
      data: {
        ...updateData,
        tenant: tenantId,
      },
      depth: 2,
    })

    return createSuccessResponse({
      content: updatedContent,
      message: 'Content updated successfully'
    })

  } catch (error) {
    console.error('Error updating content:', error)
    return createErrorResponse('Failed to update content', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const tenantId = request.headers.get('X-Tenant-ID')

    if (!id || !tenantId) {
      return createErrorResponse('Content ID and Tenant ID are required', 400)
    }

    // Only admins and managers can delete content
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const payload = await getPayload()

    // Check if content exists
    const content = await payload.findByID({
      collection: 'content',
      id,
    })

    if (!content) {
      return createErrorResponse('Content not found', 404)
    }

    // Delete content
    await payload.delete({
      collection: 'content',
      id,
    })

    return createSuccessResponse({
      message: 'Content deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting content:', error)
    return createErrorResponse('Failed to delete content', 500)
  }
}



