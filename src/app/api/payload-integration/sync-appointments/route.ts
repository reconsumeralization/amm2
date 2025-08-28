import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getPayloadIntegrationService } from '@/lib/payload-integration'
import { getUserFromSession } from '@/lib/documentation-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
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
    
    await payloadService.syncAppointments()

    return NextResponse.json({ 
      success: true, 
      message: 'Appointments synced successfully' 
    })
  } catch (error) {
    console.error('Error syncing appointments:', error)
    return NextResponse.json(
      { error: 'Failed to sync appointments' },
      { status: 500 }
    )
  }
}