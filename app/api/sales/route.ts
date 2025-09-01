import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { searchParams } = new URL(request.url)
    const customer = searchParams.get('customer')
    const cashier = searchParams.get('cashier')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // Build where clause
    const where: any = {}

    if (customer) {
      where.customer = { equals: customer }
    }

    if (cashier) {
      where.cashier = { equals: cashier }
    }

    if (status) {
      where.status = { equals: status }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.greater_than_equal = new Date(dateFrom).toISOString()
      if (dateTo) where.createdAt.less_than_equal = new Date(dateTo).toISOString()
    }

    const sales = await payload.find({
      collection: 'sales',
      where,
      limit,
      page,
      sort: '-createdAt',
      depth: 2 // Include relationships
    })

    return NextResponse.json({
      success: true,
      sales: sales.docs,
      total: sales.totalDocs,
      page: sales.page,
      totalPages: sales.totalPages,
      hasNextPage: sales.hasNextPage,
      hasPrevPage: sales.hasPrevPage
    })
  } catch (error) {
    console.error('GET /api/sales error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sales'
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
    const requiredFields = ['cashier', 'items', 'totalAmount', 'paymentMethod']
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

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Items array is required and cannot be empty'
        },
        { status: 400 }
      )
    }

    // Process items and update inventory
    for (const item of body.items) {
      if (!item.inventoryItem || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid item data'
          },
          { status: 400 }
        )
      }

      // Check inventory availability
      const inventoryItem = await payload.findByID({
        collection: 'inventory',
        id: item.inventoryItem
      })

      if (!inventoryItem) {
        return NextResponse.json(
          {
            success: false,
            error: `Inventory item not found: ${item.inventoryItem}`
          },
          { status: 404 }
        )
      }

      if (inventoryItem.currentStock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.currentStock}`
          },
          { status: 400 }
        )
      }

      // Update inventory stock
      await payload.update({
        collection: 'inventory',
        id: item.inventoryItem,
        data: {
          currentStock: inventoryItem.currentStock - item.quantity,
          lastRestocked: inventoryItem.lastRestocked // Keep existing value
        }
      })
    }

    // Create the sale
    const saleData = {
      ...body,
      status: body.status || 'completed',
      taxRate: body.taxRate || 0.08,
      discountAmount: body.discountAmount || 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    const sale = await payload.create({
      collection: 'sales',
      data: saleData
    })

    return NextResponse.json({
      success: true,
      sale,
      message: 'Sale completed successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sales error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process sale'
      },
      { status: 500 }
    )
  }
}
