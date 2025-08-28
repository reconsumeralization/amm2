import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayloadIntegrationService } from '@/lib/payload-integration'
import { getUserFromSession } from '@/lib/documentation-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const user = getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rchParams } = new URL(request.url)
    const query = rchParams.get('q') || ''
    const collections = rchParams.get('collections')?.split(',') || ['services', 'customers', 'stylists', 'documentation']
    const limit = parseInt(rchParams.get('limit') || '20')

    if (!query.trim()) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const payloadService = getPayloadIntegrationService()
    await payloadService.initialize()
    
    const results = await payloadService.globalrch(query, collections, limit)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error performing global rch:', error)
    return NextResponse.json(
      { error: 'rch failed' },
      { status: 500 }
    )
  }
}