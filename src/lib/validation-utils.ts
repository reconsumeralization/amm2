import { z } from 'zod'
import { NextResponse } from 'next/server'

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: string[]
  error?: string
}

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.join('.')
        return path ? `${path}: ${err.message}` : err.message
      })
      return { success: false, errors }
    }
    return { success: false, error: 'Invalid JSON in request body' }
  }
}

/**
 * Validates URL rch parameters
 */
export function validaterchParams<T>(
  rchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const params = Object.fromEntries(rchParams.entries())
    const validatedData = schema.parse(params)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.join('.')
        return path ? `${path}: ${err.message}` : err.message
      })
      return { success: false, errors }
    }
    return { success: false, error: 'Invalid URL parameters' }
  }
}

/**
 * Creates a standardized validation error response
 */
export function createValidationErrorResponse(errors: string[] | string) {
  const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors

  return NextResponse.json(
    {
      error: 'Validation failed',
      message: errorMessage,
      details: Array.isArray(errors) ? errors : [errors]
    },
    { status: 400 }
  )
}

/**
 * Creates a standardized server error response
 */
export function createServerErrorResponse(error: string = 'Internal server error') {
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error : 'Something went wrong'
    },
    { status: 500 }
  )
}

/**
 * Validates request with authentication context
 */
export async function validateAuthenticatedRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T & { userId: string }>> {
  try {
    // This would typically get the user ID from the session/auth context
    // For now, we'll return a mock validation result
    const bodyValidation = await validateRequestBody(request, schema)

    if (!bodyValidation.success) {
      return bodyValidation as ValidationResult<T & { userId: string }>
    }

    // In a real implementation, you'd get the user ID from the auth context
    const userId = 'mock-user-id' // This should come from auth middleware

    return {
      success: true,
      data: { ...bodyValidation.data!, userId }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.join('.')
        return path ? `${path}: ${err.message}` : err.message
      })
      return { success: false, errors }
    }
    return { success: false, error: 'Invalid request' }
  }
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Sanitizes object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as any)[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as any)[key] = sanitizeObject(value)
    } else if (Array.isArray(value)) {
      (sanitized as any)[key] = value.map((item: any) =>
        typeof item === 'string' ? sanitizeString(item) : item
      )
    }
  }

  return sanitized as T
}

/**
 * Rate limiting validation wrapper
 */
export async function withRateLimit<T>(
  request: Request,
  handler: () => Promise<NextResponse>,
  rateLimitFn: () => Promise<{ success: boolean; remaining: number; reset: Date }>
): Promise<NextResponse> {
  try {
    const rateLimit = await rateLimitFn()

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    return await handler()
  } catch (error) {
    console.error('Rate limiting error:', error)
    return await handler() // Allow request on rate limiting failure
  }
}
