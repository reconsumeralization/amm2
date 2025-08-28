import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { BusinessDocumentationService } from '@/lib/business-documentation-service'
import { getUserFromSession } from '@/lib/documentation-auth'

const docService = new BusinessDocumentationService({
  payloadApiUrl: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000/api',
  payloadApiKey: process.env.PAYLOAD_SECRET,
  enableWorkflowAutomation: true,
  enableNotifications: true,
  enableAnalytics: true
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const user = getUserFromSession(session)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const documentation = await docService.getDocumentationById(id)

    if (!documentation) {
      return NextResponse.json({ error: 'Documentation not found' }, { status: 404 })
    }

    // Check if user can access this documentation
    const roleHierarchy = {
      'salon_customer': ['guest', 'salon_customer'],
      'salon_employee': ['guest', 'salon_customer', 'salon_employee'],
      'salon_owner': ['guest', 'salon_customer', 'salon_employee', 'salon_owner'],
      'developer': ['guest', 'salon_customer', 'salon_employee', 'salon_owner', 'developer'],
      'system_admin': ['guest', 'salon_customer', 'salon_employee', 'salon_owner', 'developer', 'system_admin']
    }

    const accessibleRoles = roleHierarchy[user.role as keyof typeof roleHierarchy] || [user.role]

    if (!accessibleRoles.includes(documentation.targetRole) && documentation.status !== 'published') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(documentation)
  } catch (error) {
    console.error('Error fetching business documentation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const user = getUserFromSession(session)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can edit documentation
    if (!['system_admin', 'salon_owner', 'developer'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const updateRequest = {
      id,
      ...body
    }

    const documentation = await docService.updateDocumentation(updateRequest, user.id)

    return NextResponse.json(documentation)
  } catch (error) {
    console.error('Error updating business documentation:', error)
    return NextResponse.json(
      { error: 'Failed to update documentation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const user = getUserFromSession(session)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and owners can delete documentation
    if (!['system_admin', 'salon_owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // In a real implementation, you would call the Payload API to delete the document
    // For now, we'll just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business documentation:', error)
    return NextResponse.json(
      { error: 'Failed to delete documentation' },
      { status: 500 }
    )
  }
}
