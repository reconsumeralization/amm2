import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Check if user has template access
    if (session.user.role !== 'admin' && session.user.role !== 'barber' && session.user.role !== 'manager') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
    }

    const { searchParams } = new URL(request.url)
    const tenantId = request.headers.get('X-Tenant-ID') || searchParams.get('tenantId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const isPublic = searchParams.get('isPublic')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'usageCount'

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 'MISSING_REQUIRED_FIELD', 400)
    }

    const payload = await getPayload({ config })

    // Build query filters
    const where: any = {
      or: [
        { tenant: { equals: tenantId } },
        { isPublic: { equals: true } }
      ]
    }

    if (category && category !== 'all') {
      where.category = { equals: category }
    }

    if (isActive !== undefined) {
      where.isActive = { equals: isActive === 'true' }
    }

    if (isPublic !== undefined) {
      where.isPublic = { equals: isPublic === 'true' }
    }

    if (search) {
      where.or = where.or.map((condition: any) => ({
        ...condition,
        and: [
          {
            or: [
              { name: { like: search } },
              { description: { like: search } },
              { tags: { tag: { like: search } } }
            ]
          }
        ]
      }))
    }

    // Fetch templates with pagination
    const templates = await payload.find({
      collection: 'editorTemplates',
      where,
      page,
      limit,
      sort,
      depth: 2,
    })

    // Transform templates for frontend
    const transformedTemplates = templates.docs.map((template: any) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      thumbnail: template.thumbnail,
      templateData: template.templateData,
      css: template.css,
      variables: template.variables || [],
      blocks: template.blocks || [],
      tags: template.tags || [],
      isActive: template.isActive,
      isPublic: template.isPublic,
      usageCount: template.usageCount || 0,
      lastUsed: template.lastUsed,
      rating: template.rating || 0,
      reviewCount: template.reviewCount || 0,
      version: template.version || 1,
      compatibility: template.compatibility,
      metadata: template.metadata,
      createdBy: template.createdBy,
      updatedBy: template.updatedBy,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }))

    return createSuccessResponse({
      templates: transformedTemplates,
      total: templates.totalDocs,
      page: templates.page,
      totalPages: templates.totalPages,
      hasNext: templates.hasNextPage,
      hasPrev: templates.hasPrevPage,
    })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return createErrorResponse('Failed to fetch templates', 'INTERNAL_SERVER_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Check if user can create templates
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
    }

    const payload = await getPayload({ config })
    const body = await request.json()
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 'MISSING_REQUIRED_FIELD', 400)
    }

    // Validate required fields
    if (!body.name || !body.templateData) {
      return createErrorResponse('Name and template data are required', 'MISSING_REQUIRED_FIELD', 400)
    }

    // Create template
    const template = await payload.create({
      collection: 'editorTemplates',
      data: {
        ...body,
        tenant: tenantId,
        createdBy: session.user.id,
        version: 1,
        usageCount: 0,
      },
      depth: 2,
    })

    return createSuccessResponse({
      template,
      message: 'Template created successfully'
    }, 'Template created successfully', 201)

  } catch (error) {
    console.error('Error creating template:', error)
    return createErrorResponse('Failed to create template', 'INTERNAL_SERVER_ERROR', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const payload = await getPayload({ config })
    const body = await request.json()
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId
    const { id, ...updateData } = body

    if (!id || !tenantId) {
      return createErrorResponse('Template ID and Tenant ID are required', 'MISSING_REQUIRED_FIELD', 400)
    }

    // Check if user can update this template
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
      const existingTemplate = await payload.findByID({
        collection: 'editorTemplates',
        id,
      })

      if (!existingTemplate || existingTemplate.createdBy !== session.user.id) {
        return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
      }
    }

    // Increment version for updates
    const currentTemplate = await payload.findByID({
      collection: 'editorTemplates',
      id,
    })

    updateData.version = (currentTemplate.version || 1) + 1
    updateData.updatedBy = session.user.id

    // Update template
    const updatedTemplate = await payload.update({
      collection: 'editorTemplates',
      id,
      data: {
        ...updateData,
        tenant: tenantId,
      },
      depth: 2,
    })

    return createSuccessResponse({
      template: updatedTemplate,
      message: 'Template updated successfully'
    })

  } catch (error) {
    console.error('Error updating template:', error)
    return createErrorResponse('Failed to update template', 'INTERNAL_SERVER_ERROR', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const tenantId = request.headers.get('X-Tenant-ID')

    if (!id || !tenantId) {
      return createErrorResponse('Template ID and Tenant ID are required', 'MISSING_REQUIRED_FIELD', 400)
    }

    // Only admins can delete templates
    if (session.user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
    }

    const payload = await getPayload({ config })

    // Check if template exists
    const template = await payload.findByID({
      collection: 'editorTemplates',
      id,
    })

    if (!template) {
      return createErrorResponse('Template not found', 'RESOURCE_NOT_FOUND', 404)
    }

    // Delete template
    await payload.delete({
      collection: 'editorTemplates',
      id,
    })

    return createSuccessResponse({
      message: 'Template deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting template:', error)
    return createErrorResponse('Failed to delete template', 'INTERNAL_SERVER_ERROR', 500)
  }
}
