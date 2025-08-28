import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getPayloadIntegrationService } from '@/lib/payload-integration'
import { getUserFromSession } from '@/lib/documentation-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow salon owners and admins to sync appointments
    if (!['salon_owner', 'system_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const payloadService = getPayloadIntegrationService()
    await payloadService.initialize()
    
    const syncResult = await payloadService.syncAppointments()

    return NextResponse.json({ 
      success: true, 
      message: `Appointments sync completed: ${syncResult.synced} synced, ${syncResult.failed} failed`,
      syncedCount: syncResult.synced,
      failedCount: syncResult.failed,
      errors: syncResult.errors.length > 0 ? syncResult.errors : undefined
    })
  } catch (error) {
    console.error('Error syncing appointments:', error)
    return NextResponse.json(
      { error: 'Failed to sync appointments' },
      { status: 500 }
    )
  }
}