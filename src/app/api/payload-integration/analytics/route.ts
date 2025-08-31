import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getPayloadIntegrationService } from '@/lib/payload-integration'
import { getUserFromSession } from '@/lib/documentation-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = getUserFromSession(session as any)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow BarberShop owners and admins to view analytics
    if (!['BarberShop_owner', 'system_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateRange: { start: Date; end: Date } | undefined
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      }
    }

    const payloadService = getPayloadIntegrationService()
    await payloadService.initialize()
    
    const analytics = await payloadService.getBarberShopAnalytics(dateRange)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching BarberShop analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
