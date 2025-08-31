import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getPayloadClient } from '@/payload'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!(session as any)?.user || (session as any).user.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/admin', request.url))
    }

    const payload = await getPayloadClient()
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/admin/payload', '')

    // Handle PayloadCMS admin requests
    const response = await payload.request({
      method: 'GET',
      url: path || '/',
      query: Object.fromEntries(url.searchParams),
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Payload admin GET error:', error)
    return NextResponse.json(
      { error: 'Failed to access PayloadCMS admin' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!(session as any)?.user || (session as any).user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/admin/payload', '')
    const body = await request.json()

    const response = await payload.request({
      method: 'POST',
      url: path || '/',
      data: body,
      query: Object.fromEntries(url.searchParams),
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Payload admin POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!(session as any)?.user || (session as any).user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/admin/payload', '')
    const body = await request.json()

    const response = await payload.request({
      method: 'PUT',
      url: path || '/',
      data: body,
      query: Object.fromEntries(url.searchParams),
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Payload admin PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!(session as any)?.user || (session as any).user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/admin/payload', '')

    const response = await payload.request({
      method: 'DELETE',
      url: path || '/',
      query: Object.fromEntries(url.searchParams),
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Payload admin DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

