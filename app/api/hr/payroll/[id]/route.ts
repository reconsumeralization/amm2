import { NextRequest, NextResponse } from 'next/server'
import payload from '@/lib/payload'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const payroll = await payload.findByID({
      collection: 'payroll',
      id,
    })

    if (!payroll) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      payroll,
    })
  } catch (error) {
    console.error('Payroll fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, notes, approvedBy } = body

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updateData: any = {
      status,
    }

    // Add approval tracking
    if (status === 'approved') {
      updateData.approvedBy = approvedBy || user.id
      updateData.approvedAt = new Date().toISOString()
    }

    if (status === 'paid') {
      updateData.paymentDetails = {
        ...updateData.paymentDetails,
        paidAt: new Date().toISOString(),
      }
    }

    if (notes) {
      updateData.notes = notes
    }

    const updatedPayroll = await payload.update({
      collection: 'payroll',
      id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      payroll: updatedPayroll,
      message: `Payroll status updated to ${status}`,
    })
  } catch (error) {
    console.error('Payroll update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
