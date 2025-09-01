import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    // Check if sale exists
    const existingSale = await payload.findByID({
      collection: 'sales',
      id: params.id,
      depth: 2
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

    // Only allow refunds on completed sales
    if (existingSale.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only completed sales can be refunded'
        },
        { status: 400 }
      )
    }

    const refundAmount = body.refundAmount || existingSale.totalAmount
    const reason = body.reason || 'Customer refund'

    // Validate refund amount
    if (refundAmount > existingSale.totalAmount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Refund amount cannot exceed sale total'
        },
        { status: 400 }
      )
    }

    // Determine new status
    let newStatus = 'refunded'
    if (refundAmount < existingSale.totalAmount) {
      newStatus = 'partially_refunded'
    }

    // Update sale status and add refund note
    const refundNote = `Refund processed: $${refundAmount.toFixed(2)} - ${reason}`
    const existingNotes = existingSale.notes || ''
    const updatedNotes = existingNotes ? `${existingNotes}\n${refundNote}` : refundNote

    const sale = await payload.update({
      collection: 'sales',
      id: params.id,
      data: {
        status: newStatus,
        notes: updatedNotes,
        lastUpdated: new Date().toISOString()
      }
    })

    // Restore inventory stock for refunded items
    if (existingSale.items && Array.isArray(existingSale.items)) {
      for (const item of existingSale.items) {
        // Calculate how much stock to restore based on refund percentage
        const refundPercentage = refundAmount / existingSale.totalAmount
        const stockToRestore = Math.round(item.quantity * refundPercentage)

        if (stockToRestore > 0) {
          await payload.update({
            collection: 'inventory',
            id: item.inventoryItem,
            data: {
              currentStock: {
                $inc: stockToRestore
              }
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      sale,
      refundAmount,
      message: `Refund of $${refundAmount.toFixed(2)} processed successfully`
    })
  } catch (error) {
    console.error('POST /api/sales/[id]/refund error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process refund'
      },
      { status: 500 }
    )
  }
}
