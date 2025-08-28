import { NextRequest, NextResponse } from 'next/server'
import { validateRequestBody, createValidationErrorResponse } from '@/lib/validation-utils'
import { createUserSchema, createAppointmentSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    let schema: any

    switch (type) {
      case 'user':
        schema = createUserSchema
        break
      case 'appointment':
        schema = createAppointmentSchema
        break
      default:
        return NextResponse.json(
          { error: 'Invalid validation type. Use "user" or "appointment"' },
          { status: 400 }
        )
    }

    // Validate the data
    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })

    const validation = await validateRequestBody(mockRequest, schema)

    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!)
    }

    return NextResponse.json({
      success: true,
      message: 'Validation passed!',
      data: validation.data,
      type
    })

  } catch (error) {
    console.error('Validation demo error:', error)
    return NextResponse.json(
      { error: 'Validation demo failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to show validation examples
export async function GET() {
  return NextResponse.json({
    message: 'Validation Demo API',
    examples: {
      user: {
        valid: {
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
          phone: '+1234567890'
        },
        invalid: {
          email: 'invalid-email',
          firstName: '',
          role: 'invalid-role'
        }
      },
      appointment: {
        valid: {
          customerId: 'user-id-123',
          stylistId: 'stylist-id-456',
          serviceId: 'service-id-789',
          dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration: 60
        },
        invalid: {
          customerId: '',
          dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
        }
      }
    },
    usage: {
      endpoint: '/api/validate-demo',
      method: 'POST',
      body: {
        type: 'user|appointment',
        data: 'validation data'
      }
    }
  })
}
