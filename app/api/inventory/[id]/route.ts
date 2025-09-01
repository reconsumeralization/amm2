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

    const item = await payload.findByID({
      collection: 'inventory',
      id: params.id
    })

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inventory item not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      item
    })
  } catch (error) {
    console.error('GET /api/inventory/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inventory item'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    // Check if item exists
    const existingItem = await payload.findByID({
      collection: 'inventory',
      id: params.id
    })

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inventory item not found'
        },
        { status: 404 }
      )
    }

    // If SKU is being updated, check for conflicts
    if (body.sku && body.sku !== existingItem.sku) {
      const skuConflict = await payload.find({
        collection: 'inventory',
        where: { sku: { equals: body.sku } }
      })

      if (skuConflict.docs.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'SKU already exists'
          },
          { status: 409 }
        )
      }
    }

    // Calculate status based on stock levels if stock is being updated
    let updateData = { ...body }
    if (body.currentStock !== undefined || body.minStock !== undefined) {
      const currentStock = body.currentStock !== undefined ? body.currentStock : existingItem.currentStock
      const minStock = body.minStock !== undefined ? body.minStock : existingItem.minStock

      let status = existingItem.status
      if (currentStock <= 0) {
        status = 'out_of_stock'
      } else if (currentStock <= minStock) {
        status = 'low_stock'
      } else {
        status = 'in_stock'
      }
      updateData.status = status
    }

    updateData.lastUpdated = new Date().toISOString()

    const item = await payload.update({
      collection: 'inventory',
      id: params.id,
      data: updateData
    })

    return NextResponse.json({
      success: true,
      item,
      message: 'Inventory item updated successfully'
    })
  } catch (error) {
    console.error('PUT /api/inventory/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update inventory item'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await getPayload({ config })

    // Check if item exists
    const existingItem = await payload.findByID({
      collection: 'inventory',
      id: params.id
    })

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inventory item not found'
        },
        { status: 404 }
      )
    }

    await payload.delete({
      collection: 'inventory',
      id: params.id
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/inventory/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete inventory item'
      },
      { status: 500 }
    )
  }
}
