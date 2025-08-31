import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test API is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({
    message: 'Test API POST received',
    data: body,
    timestamp: new Date().toISOString()
  })
}
