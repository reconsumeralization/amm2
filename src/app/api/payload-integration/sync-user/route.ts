import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayloadIntegrationService } from '@/lib/payload-integration'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payloadService = getPayloadIntegrationService()
    await payloadService.initialize()
    
    const syncedUser = await payloadService.syncUserWithPayload(session)
    
    if (!syncedUser) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        name: syncedUser.name,
        role: syncedUser.role
      }
    })
  } catch (error) {
    console.error('Error syncing user with Payload:', error)
    return NextResponse.json(
      { error: 'Failed to sync user with Payload' },
      { status: 500 }
    )
  }
}