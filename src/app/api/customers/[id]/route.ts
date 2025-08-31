import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getPayloadClient } from '@/payload'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Check if user is admin or has customer access
    if ((session as any).user.role !== 'admin' && (session as any).user.role !== 'employee') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    const { id } = await params
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()

    // Fetch customer
    const customer = await payload.findByID({
      collection: 'customers',
      id,
      depth: 2, // Include relationships
    })

    if (!customer) {
      return createErrorResponse('Customer not found', 'RESOURCE_NOT_FOUND')
    }

    // Check if user can access this customer
    if ((session as any).user.role !== 'admin' && customer.createdBy !== (session as any).user.id) {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    return createSuccessResponse({ customer })

  } catch (error) {
    console.error('Error fetching customer:', error)
    return createErrorResponse('Failed to fetch customer', 'INTERNAL_SERVER_ERROR')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED')
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { id } = await params
    const body = await request.json()

    // Check if user is admin or owns this customer
    if ((session as any).user.role !== 'admin') {
      // For non-admin users, verify they own the customer
      const existingCustomer = await payload.findByID({
        collection: 'customers',
        id,
      })

      if (!existingCustomer || existingCustomer.createdBy !== (session as any).user.id) {
        return createErrorResponse('Insufficient permissions', 'FORBIDDEN')
      }
    }

    // Update customer
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id,
      data: {
        ...body,
        updatedBy: (session as any).user.id,
      },
      depth: 2,
    })

    return createSuccessResponse({
      customer: updatedCustomer,
      message: 'Customer updated successfully'
    })

  } catch (error) {
    console.error('Error updating customer:', error)
    return createErrorResponse('Failed to update customer', 'INTERNAL_SERVER_ERROR')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Only admins can delete customers
    if ((session as any).user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN')
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { id } = await params

    // Check if customer exists
    const customer = await payload.findByID({
      collection: 'customers',
      id,
    })

    if (!customer) {
      return createErrorResponse('Customer not found', 'RESOURCE_NOT_FOUND')
    }

    // Delete customer
    await payload.delete({
      collection: 'customers',
      id,
    })

    return createSuccessResponse({
      message: 'Customer deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting customer:', error)
    return createErrorResponse('Failed to delete customer', 'INTERNAL_SERVER_ERROR')
  }
}
