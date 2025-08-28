import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock response since Payload CMS was removed
    return NextResponse.json({
      success: true,
      message: 'Mock Payload CMS response - using sample data',
      data: {
        version: 'mock',
        collections: ['Users', 'Customers', 'Appointments', 'Services', 'Stylists', 'Commissions', 'ServicePackages', 'Inventory', 'WaitList', 'Media'],
        status: 'mock'
      }
    })

  } catch (error) {
    console.error('Payload test error:', error)
    return NextResponse.json({
      success: false,
      error: `Mock Payload CMS error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: 'Mock error response'
    }, { status: 500 })
  }
}