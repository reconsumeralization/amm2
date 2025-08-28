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
    const contentId = searchParams.get('contentId')
    const tenantId = request.headers.get('X-Tenant-ID') || searchParams.get('tenantId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!contentId || !tenantId) {
      return createErrorResponse('Content ID and Tenant ID are required', 400)
    }

    const payload = await getPayload()

    // Fetch content versions (revisions)
    const content = await payload.findByID({
      collection: 'content',
      id: contentId,
    })

    if (!content) {
      return createErrorResponse('Content not found', 404)
    }

    // Check if user can access this content
    if (session.user.role !== 'admin' && session.user.role !== 'manager' && content.createdBy !== session.user.id) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    // Get all revisions for this content
    const revisions = content.revisions || []

    // Apply pagination to revisions
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRevisions = revisions.slice(startIndex, endIndex)

    return createSuccessResponse({
      contentId,
      currentVersion: content.version,
      revisions: paginatedRevisions,
      total: revisions.length,
      page,
      totalPages: Math.ceil(revisions.length / limit),
      hasNext: endIndex < revisions.length,
      hasPrev: page > 1,
    })

  } catch (error) {
    console.error('Error fetching content versions:', error)
    return createErrorResponse('Failed to fetch content versions', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const payload = await getPayload()
    const body = await request.json()
    const { contentId, versionId, action = 'restore' } = body
    const tenantId = request.headers.get('X-Tenant-ID')

    if (!contentId || !versionId || !tenantId) {
      return createErrorResponse('Content ID, Version ID, and Tenant ID are required', 400)
    }

    // Fetch current content
    const currentContent = await payload.findByID({
      collection: 'content',
      id: contentId,
    })

    if (!currentContent) {
      return createErrorResponse('Content not found', 404)
    }

    // Check permissions
    if (session.user.role !== 'admin' && session.user.role !== 'manager' && currentContent.createdBy !== session.user.id) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    // Find the specific revision
    const revision = currentContent.revisions?.find((rev: any) => rev.id === versionId)

    if (!revision) {
      return createErrorResponse('Version not found', 404)
    }

    if (action === 'restore') {
      // Create a new revision with current content before restoring
      const newRevision = {
        version: currentContent.version,
        content: currentContent.content,
        lexicalContent: currentContent.lexicalContent,
        changedBy: currentContent.updatedBy || currentContent.createdBy,
        changeDescription: `Auto-saved before restoring to version ${revision.version}`,
        createdAt: new Date(),
      }

      // Restore the selected version
      const updatedContent = await payload.update({
        collection: 'content',
        id: contentId,
        data: {
          content: revision.content,
          lexicalContent: revision.lexicalContent,
          version: (currentContent.version || 1) + 1,
          updatedBy: session.user.id,
          revisions: [...(currentContent.revisions || []), newRevision],
        },
        depth: 2,
      })

      return createSuccessResponse({
        content: updatedContent,
        message: `Content restored to version ${revision.version}`
      })

    } else if (action === 'delete') {
      // Remove the specific revision
      const filteredRevisions = currentContent.revisions?.filter((rev: any) => rev.id !== versionId) || []

      await payload.update({
        collection: 'content',
        id: contentId,
        data: {
          revisions: filteredRevisions,
          updatedBy: session.user.id,
        },
      })

      return createSuccessResponse({
        message: 'Version deleted successfully'
      })
    }

    return createErrorResponse('Invalid action', 400)

  } catch (error) {
    console.error('Error managing content version:', error)
    return createErrorResponse('Failed to manage content version', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')
    const tenantId = request.headers.get('X-Tenant-ID')

    if (!contentId || !tenantId) {
      return createErrorResponse('Content ID and Tenant ID are required', 400)
    }

    // Only admins can clear all revisions
    if (session.user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const payload = await getPayload()

    // Clear all revisions for this content
    await payload.update({
      collection: 'content',
      id: contentId,
      data: {
        revisions: [],
        updatedBy: session.user.id,
      },
    })

    return createSuccessResponse({
      message: 'All revisions cleared successfully'
    })

  } catch (error) {
    console.error('Error clearing content revisions:', error)
    return createErrorResponse('Failed to clear content revisions', 500)
  }
}
