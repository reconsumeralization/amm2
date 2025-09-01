import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // Build where clause
    const where: any = {}

    if (category && category !== 'all') {
      where.category = { equals: category }
    }

    if (status && status !== 'all') {
      where.status = { equals: status }
    }

    if (search) {
      where.or = [
        { name: { like: search } },
        { sku: { like: search } },
        { description: { like: search } }
      ]
    }

    const items = await payload.find({
      collection: 'inventory',
      where,
      limit,
      page,
      sort: '-createdAt'
    })

    return NextResponse.json({
      success: true,
      items: items.docs,
      total: items.totalDocs,
      page: items.page,
      totalPages: items.totalPages,
      hasNextPage: items.hasNextPage,
      hasPrevPage: items.hasPrevPage
    })
  } catch (error) {
    console.error('GET /api/inventory error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inventory items'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'sku', 'category', 'unitPrice', 'currentStock', 'minStock', 'unitOfMeasure']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`
          },
          { status: 400 }
        )
      }
    }

    // Check if SKU already exists
    const existingItem = await payload.find({
      collection: 'inventory',
      where: { sku: { equals: body.sku } }
    })

    if (existingItem.docs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'SKU already exists'
        },
        { status: 409 }
      )
    }

    // Calculate status based on stock levels
    let status = 'in_stock'
    if (body.currentStock <= 0) {
      status = 'out_of_stock'
    } else if (body.currentStock <= body.minStock) {
      status = 'low_stock'
    }

    const itemData = {
      ...body,
      status,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    const item = await payload.create({
      collection: 'inventory',
      data: itemData
    })

    return NextResponse.json({
      success: true,
      item,
      message: 'Inventory item created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/inventory error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create inventory item'
      },
      { status: 500 }
    )
  }
}
