import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await getPayload({ config })

    const sale = await payload.findByID({
      collection: 'sales',
      id: params.id,
      depth: 2 // Include relationships
    })

    if (!sale) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sale not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      sale
    })
  } catch (error) {
    console.error('GET /api/sales/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sale'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    // Check if sale exists
    const existingSale = await payload.findByID({
      collection: 'sales',
      id: params.id
    })

    if (!existingSale) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sale not found'
        },
        { status: 404 }
      )
    }

    // Only allow status updates for completed sales
    if (existingSale.status === 'completed' && body.status && body.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot modify completed sales'
        },
        { status: 400 }
      )
    }

    const updateData = {
      ...body,
      lastUpdated: new Date().toISOString()
    }

    const sale = await payload.update({
      collection: 'sales',
      id: params.id,
      data: updateData,
      depth: 2
    })

    return NextResponse.json({
      success: true,
      sale,
      message: 'Sale updated successfully'
    })
  } catch (error) {
    console.error('PUT /api/sales/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update sale'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await getPayload({ config })

    // Check if sale exists
    const existingSale = await payload.findByID({
      collection: 'sales',
      id: params.id
    })

    if (!existingSale) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sale not found'
        },
        { status: 404 }
      )
    }

    // Only allow deletion of pending sales
    if (existingSale.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only pending sales can be deleted'
        },
        { status: 400 }
      )
    }

    // Restore inventory stock
    if (existingSale.items && Array.isArray(existingSale.items)) {
      for (const item of existingSale.items) {
        await payload.update({
          collection: 'inventory',
          id: item.inventoryItem,
          data: {
            currentStock: {
              $inc: item.quantity // Increment stock by the quantity sold
            }
          }
        })
      }
    }

    await payload.delete({
      collection: 'sales',
      id: params.id
    })

    return NextResponse.json({
      success: true,
      message: 'Sale deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/sales/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete sale'
      },
      { status: 500 }
    )
  }
}
