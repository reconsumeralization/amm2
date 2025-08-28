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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const user = getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and owners can view metrics
    if (!['system_admin', 'salon_owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { rchParams } = new URL(request.url)
    const startDate = rchParams.get('startDate')
    const endDate = rchParams.get('endDate')

    let dateRange: { start: Date; end: Date } | undefined
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      }
    }

    const metrics = await docService.getDocumentationMetrics(dateRange)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching documentation metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}