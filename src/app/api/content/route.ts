import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {

    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Check if user has content access
    const allowedRoles = ['admin', 'manager', 'barber', 'stylist']
    if (!allowedRoles.includes(((session as any).user)?.role || '')) {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
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
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const author = searchParams.get('author')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const sort = searchParams.get('sort') || '-updatedAt'

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 'VALIDATION_ERROR', 400)
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()

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

    if (featured !== null && featured !== undefined) {
      where.featured = { equals: featured === 'true' }
    }

    if (author) {
      where.createdBy = { equals: author }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.greater_than_equal = new Date(dateFrom).toISOString()
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.less_than_equal = endDate.toISOString()
      }
    }

    if (search) {
      where.or = [
        { title: { like: search } },
        { description: { like: search } },
        { content: { like: search } },
        { 'tags.tag': { like: search } }
      ]
    }

    if (tags && tags.length > 0) {
      where['tags.tag'] = { in: tags }
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
      depth: 3, // Include deeper relationships for media and user data
    })

    // Transform content for frontend with enhanced data
    const transformedContent = content.docs.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      excerpt: item.description?.substring(0, 200) + (item.description?.length > 200 ? '...' : ''),
      content: item.content,
      lexicalContent: item.lexicalContent,
      status: item.status,
      pageType: item.pageType,
      category: item.category,
      tags: item.tags?.map((tag: any) => ({
        id: tag.id,
        tag: tag.tag,
        color: tag.color
      })) || [],
      featured: item.featured,
      featuredOrder: item.featuredOrder,
      seo: {
        title: item.seo?.title || item.title,
        description: item.seo?.description || item.description,
        keywords: item.seo?.keywords || [],
        ogImage: item.seo?.ogImage,
        canonical: item.seo?.canonical,
        noIndex: item.seo?.noIndex || false
      },
      analytics: {
        views: item.analytics?.views || 0,
        shares: item.analytics?.shares || 0,
        likes: item.analytics?.likes || 0,
        comments: item.analytics?.comments || 0,
        lastViewed: item.analytics?.lastViewed
      },
      settings: {
        allowComments: item.settings?.allowComments !== false,
        showAuthor: item.settings?.showAuthor !== false,
        showDate: item.settings?.showDate !== false,
        showTags: item.settings?.showTags !== false,
        showSocialShare: item.settings?.showSocialShare !== false
      },
      media: item.media?.map((mediaItem: any) => ({
        id: mediaItem.id,
        url: mediaItem.url,
        alt: mediaItem.alt,
        caption: mediaItem.caption,
        type: mediaItem.mimeType?.split('/')[0] || 'image'
      })) || [],
      template: item.template,
      theme: item.theme,
      version: item.version || 1,
      author: {
        id: item.createdBy?.id,
        name: item.createdBy?.name,
        email: item.createdBy?.email,
        avatar: item.createdBy?.avatar
      },
      editor: {
        id: item.updatedBy?.id,
        name: item.updatedBy?.name,
        email: item.updatedBy?.email
      },
      publisher: {
        id: item.publishedBy?.id,
        name: item.publishedBy?.name,
        email: item.publishedBy?.email
      },
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      readingTime: calculateReadingTime(item.content || ''),
      wordCount: countWords(item.content || '')
    }))

    // Add aggregation data
    const aggregations = {
      totalByStatus: await getContentCountByStatus(payload, tenantId),
      totalByCategory: await getContentCountByCategory(payload, tenantId),
      recentActivity: await getRecentContentActivity(payload, tenantId)
    }

    return createSuccessResponse({
      content: transformedContent,
      pagination: {
        total: content.totalDocs,
        page: content.page,
        totalPages: content.totalPages,
        hasNext: content.hasNextPage,
        hasPrev: content.hasPrevPage,
        limit
      },
      aggregations,
      filters: {
        status,
        pageType,
        category,
        featured,
        template,
        tags,
        author,
        dateFrom,
        dateTo
      }
    })

  } catch (error) {
    console.error('Error fetching content:', error)
    return createErrorResponse(
      'Failed to fetch content', 
      'INTERNAL_SERVER_ERROR', 
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Check if user can create content
    const allowedRoles = ['admin', 'manager', 'barber', 'stylist']
    if (!allowedRoles.includes(((session as any).user)?.role || '')) {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const body = await request.json()
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 'VALIDATION_ERROR', 400)
    }

    // Enhanced validation
    const validationErrors = validateContentData(body)
    if (validationErrors.length > 0) {
      return createErrorResponse(
        'Validation failed', 
        'VALIDATION_ERROR', 
        400, 
        { errors: validationErrors }
      )
    }

    // Check if slug is unique within tenant
    const existingContent = await payload.find({
      collection: 'content',
      where: {
        tenant: { equals: tenantId },
        slug: { equals: body.slug }
      },
      limit: 1,
    })

    if (existingContent.docs.length > 0) {
      return createErrorResponse('Slug already exists for this tenant', 'VALIDATION_ERROR', 400)
    }

    const result = await payload.create({
      collection: 'content',
      data: {
        ...body,
        tenant: tenantId,
        createdBy: ((session as any).user)?.id,
        version: 1,
        seo: {
          title: body.seo?.title || body.title,
          description: body.seo?.description || body.description?.substring(0, 160),
          keywords: body.seo?.keywords || extractKeywords(body.content || ''),
          ...body.seo
        },
        analytics: {
          views: 0,
          shares: 0,
          likes: 0,
          comments: 0,
          ...body.analytics
        },
        settings: {
          allowComments: true,
          showAuthor: true,
          showDate: true,
          showTags: true,
          showSocialShare: true,
          ...body.settings
        }
      },
      depth: 3,
    })

    // Log content creation activity
    await logContentActivity(payload, {
      action: 'created',
      contentId: result.id,
      userId: ((session as any).user)?.id,
      tenantId,
      metadata: {
        title: result.title,
        status: result.status
      }
    })

    return createSuccessResponse({
      content: result,
      message: 'Content created successfully'
    }, undefined, 201)

  } catch (error) {
    console.error('Error creating content:', error)
    return createErrorResponse(
      'Failed to create content', 
      'INTERNAL_SERVER_ERROR', 
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const body = await request.json()
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId
    const { id, ...updateData } = body

    if (!id || !tenantId) {
      return createErrorResponse('Content ID and Tenant ID are required', 'VALIDATION_ERROR', 400)
    }

    // Enhanced validation
    const validationErrors = validateContentData(updateData, true)
    if (validationErrors.length > 0) {
      return createErrorResponse(
        'Validation failed', 
        'VALIDATION_ERROR', 
        400, 
        { errors: validationErrors }
      )
    }

    // Get existing content for permission check and version tracking
    const existingContent = await payload.findByID({
      collection: 'content',
      id,
      depth: 1
    })

    if (!existingContent) {
      return createErrorResponse('Content not found', 'RESOURCE_NOT_FOUND', 404)
    }

    // Check permissions - enhanced role-based access
    const canEdit = checkContentEditPermissions((session as any).user, existingContent)
    if (!canEdit) {
      return createErrorResponse('Insufficient permissions to edit this content', 'FORBIDDEN', 403)
    }

    // Check for slug uniqueness if slug is being updated
    if (updateData.slug && updateData.slug !== existingContent.slug) {
      const slugExists = await payload.find({
        collection: 'content',
        where: {
          tenant: { equals: tenantId },
          slug: { equals: updateData.slug },
          id: { not_equals: id }
        },
        limit: 1,
      })

      if (slugExists.docs.length > 0) {
        return createErrorResponse('Slug already exists for this tenant', 'VALIDATION_ERROR', 400)
      }
    }

    // Track changes for audit log
    const changes = trackContentChanges(existingContent, updateData)

    // Increment version and set update metadata
    updateData.version = (existingContent.version || 1) + 1
    updateData.updatedBy = ((session as any).user)?.id

    // Handle publishing workflow
    if (updateData.status === 'published' && existingContent.status !== 'published') {
      updateData.publishedAt = new Date()
      updateData.publishedBy = ((session as any).user)?.id
    }

    // Update SEO data if content changed
    if (updateData.content || updateData.title || updateData.description) {
      updateData.seo = {
        ...existingContent.seo,
        title: updateData.seo?.title || updateData.title || existingContent.seo?.title,
        description: updateData.seo?.description || updateData.description?.substring(0, 160) || existingContent.seo?.description,
        keywords: updateData.seo?.keywords || extractKeywords(updateData.content || existingContent.content || ''),
        ...updateData.seo
      }
    }

    // Update content
    const content = await payload.update({
      collection: 'content',
      id,
      data: {
        ...updateData,
        tenant: tenantId,
      },
      depth: 3,
    })

    // Log content update activity
    await logContentActivity(payload, {
      action: 'updated',
      contentId: id,
      userId: ((session as any).user)?.id,
      tenantId,
      metadata: {
        title: content.title,
        status: content.status,
        changes
      }
    })

    return createSuccessResponse({
      content: content,
      message: 'Content updated successfully',
      changes
    })

  } catch (error) {
    console.error('Error updating content:', error)
    return createErrorResponse(
      'Failed to update content', 
      'INTERNAL_SERVER_ERROR', 
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const tenantId = request.headers.get('X-Tenant-ID')
    const force = searchParams.get('force') === 'true'

    if (!id || !tenantId) {
      return createErrorResponse('Content ID and Tenant ID are required', 'VALIDATION_ERROR', 400)
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()

    // Check if content exists
    const content = await payload.findByID({
      collection: 'content',
      id,
      depth: 1
    })

    if (!content) {
      return createErrorResponse('Content not found', 'RESOURCE_NOT_FOUND', 404)
    }

    // Enhanced permission check
    const canDelete = checkContentDeletePermissions((session as any).user, content)
    if (!canDelete) {
      return createErrorResponse('Insufficient permissions to delete this content', 'FORBIDDEN', 403)
    }

    // Check for dependencies (if content is referenced elsewhere)
    const dependencies = await checkContentDependencies(payload, id, tenantId)
    if (dependencies.length > 0 && !force) {
      return createErrorResponse(
        'Content has dependencies and cannot be deleted', 
        'VALIDATION_ERROR', 
        400,
        { 
          dependencies,
          message: 'Use force=true to delete anyway or remove dependencies first'
        }
      )
    }

    // Soft delete by default (move to trash)
    if (!force) {
      const trashedContent = await payload.update({
        collection: 'content',
        id,
        data: {
          status: 'trash',
          trashedAt: new Date(),
          trashedBy: ((session as any).user)?.id
        }
      })

      await logContentActivity(payload, {
        action: 'trashed',
        contentId: id,
        userId: ((session as any).user)?.id,
        tenantId,
        metadata: {
          title: content.title,
          originalStatus: content.status
        }
      })

      return createSuccessResponse({
        message: 'Content moved to trash successfully',
        content: trashedContent
      })
    }

    // Hard delete
    await payload.delete({
      collection: 'content',
      id,
    })

    // Log permanent deletion
    await logContentActivity(payload, {
      action: 'deleted',
      contentId: id,
      userId: ((session as any).user)?.id,
      tenantId,
      metadata: {
        title: content.title,
        permanent: true
      }
    })

    return createSuccessResponse({
      message: 'Content permanently deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting content:', error)
    return createErrorResponse(
      'Failed to delete content', 
      'INTERNAL_SERVER_ERROR', 
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    )
  }
}

// Helper functions
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = countWords(content)
  return Math.ceil(wordCount / wordsPerMinute)
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length
}

function validateContentData(data: any, isUpdate = false): string[] {
  const errors: string[] = []

  if (!isUpdate) {
    if (!data.title?.trim()) errors.push('Title is required')
    if (!data.slug?.trim()) errors.push('Slug is required')
  }

  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens')
  }

  if (data.description && data.description.length > 500) {
    errors.push('Description must be less than 500 characters')
  }

  if (data.status && !['draft', 'published', 'archived', 'trash'].includes(data.status)) {
    errors.push('Invalid status value')
  }

  return errors
}

function extractKeywords(content: string): string[] {
  // Simple keyword extraction - in production, use a more sophisticated approach
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  const frequency: { [key: string]: number } = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

function checkContentEditPermissions(user: any, content: any): boolean {
  if (user.role === 'admin' || user.role === 'manager') return true
  if (content.createdBy === user.id) return true
  return false
}

function checkContentDeletePermissions(user: any, content: any): boolean {
  if (user.role === 'admin') return true
  if (user.role === 'manager' && content.status !== 'published') return true
  return false
}

function trackContentChanges(existing: any, updates: any): any[] {
  const changes: any[] = []
  const fieldsToTrack = ['title', 'slug', 'description', 'content', 'status', 'category', 'featured']

  fieldsToTrack.forEach(field => {
    if (updates[field] !== undefined && updates[field] !== existing[field]) {
      changes.push({
        field,
        oldValue: existing[field],
        newValue: updates[field]
      })
    }
  })

  return changes
}

async function logContentActivity(payload: any, activity: any) {
  try {
    await payload.create({
      collection: 'activity-logs',
      data: {
        type: 'content',
        ...activity,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log content activity:', error)
  }
}

async function getContentCountByStatus(payload: any, tenantId: string) {
  const statuses = ['draft', 'published', 'archived', 'trash']
  const counts: { [key: string]: number } = {}

  for (const status of statuses) {
    const result = await payload.find({
      collection: 'content',
      where: {
        tenant: { equals: tenantId },
        status: { equals: status }
      },
      limit: 0
    })
    counts[status] = result.totalDocs
  }

  return counts
}

async function getContentCountByCategory(payload: any, tenantId: string) {
  // This would need to be implemented based on your category structure
  return {}
}

async function getRecentContentActivity(payload: any, tenantId: string) {
  try {
    const activities = await payload.find({
      collection: 'activity-logs',
      where: {
        type: { equals: 'content' },
        tenantId: { equals: tenantId }
      },
      limit: 10,
      sort: '-timestamp'
    })
    return activities.docs
  } catch (error) {
    return []
  }
}

async function checkContentDependencies(payload: any, contentId: string, tenantId: string): Promise<any[]> {
  // Check for references in other collections
  const dependencies: any[] = []
  
  // This would check various collections that might reference this content
  // Implementation depends on your specific schema
  
  return dependencies
}
