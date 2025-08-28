import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayload } from 'payload'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check if user is admin or has customer access
    if (session.user.role !== 'admin' && session.user.role !== 'employee') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const payload = await getPayload()
    const { id } = params

    // Fetch customer
    const customer = await payload.findByID({
      collection: 'customers',
      id,
      depth: 2, // Include relationships
    })

    if (!customer) {
      return createErrorResponse('Customer not found', 404)
    }

    // Check if user can access this customer
    if (session.user.role !== 'admin' && customer.createdBy !== session.user.id) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    return createSuccessResponse({ customer })

  } catch (error) {
    console.error('Error fetching customer:', error)
    return createErrorResponse('Failed to fetch customer', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const payload = await getPayload()
    const { id } = params
    const body = await request.json()

    // Check if user is admin or owns this customer
    if (session.user.role !== 'admin') {
      // For non-admin users, verify they own the customer
      const existingCustomer = await payload.findByID({
        collection: 'customers',
        id,
      })

      if (!existingCustomer || existingCustomer.createdBy !== session.user.id) {
        return createErrorResponse('Insufficient permissions', 403)
      }
    }

    // Update customer
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id,
      data: {
        ...body,
        updatedBy: session.user.id,
      },
      depth: 2,
    })

    return createSuccessResponse({
      customer: updatedCustomer,
      message: 'Customer updated successfully'
    })

  } catch (error) {
    console.error('Error updating customer:', error)
    return createErrorResponse('Failed to update customer', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Only admins can delete customers
    if (session.user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const payload = await getPayload()
    const { id } = params

    // Check if customer exists
    const customer = await payload.findByID({
      collection: 'customers',
      id,
    })

    if (!customer) {
      return createErrorResponse('Customer not found', 404)
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
    return createErrorResponse('Failed to delete customer', 500)
  }
}
