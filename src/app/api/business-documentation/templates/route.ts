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

    const { rchParams } = new URL(request.url)
    const type = rchParams.get('type') || undefined
    const category = rchParams.get('category') || undefined

    const templates = await docService.getTemplates(type, category)

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}