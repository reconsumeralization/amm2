import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing Payload CMS connection...')

    // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()

    console.log('Payload client obtained successfully')

    // Test a simple query
    const users = await payload.find({
      collection: 'users',
      limit: 1
    })

    console.log('Users query successful:', users.totalDocs)

    return NextResponse.json({
      success: true,
      message: 'Payload CMS is working',
      userCount: users.totalDocs
    })
  } catch (error) {
    console.error('Payload CMS test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Payload CMS failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}