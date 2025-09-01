// src/lib/api-error-handler.ts
import { NextResponse } from 'next/server';

export interface APIError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
  timestamp?: string;
  requestId?: string;
}

/**
 * Create a standardized error response
 * @param message - Error message
 * @param code - Error code for client handling
 * @param statusCode - HTTP status code
 * @param details - Additional error details (only in development)
 * @returns NextResponse with error
 */
export function createErrorResponse(
  message: string,
  code: string,
  statusCode: number = 500,
  details?: any
): NextResponse {
  const errorResponse: APIError = {
    message,
    code,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };

  // Only include details in development environment
  if (process.env.NODE_ENV === 'development' && details) {
    errorResponse.details = details;
  }

  return NextResponse.json(
    { success: false, error: errorResponse },
    { status: statusCode }
  );
}

/**
 * Create a standardized success response
 * @param data - Response data
 * @param message - Success message
 * @param statusCode - HTTP status code
 * @param meta - Additional metadata
 * @returns NextResponse with success data
 */
export function createSuccessResponse(
  data: any,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: any
): NextResponse {
  const response = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...(meta && { meta }),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Generate a unique request ID for tracking
 * @returns Unique request identifier
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Handle and log API errors consistently
 * @param error - Error object
 * @param context - Additional context for logging
 * @returns Standardized error response
 */
export function handleAPIError(
  error: any,
  context: string = 'API Error'
): NextResponse {
  console.error(`${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return createErrorResponse(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      process.env.NODE_ENV === 'development' ? error.details : undefined
    );
  }

  if (error.name === 'UnauthorizedError') {
    return createErrorResponse(
      'Authentication required',
      'UNAUTHORIZED',
      401
    );
  }

  if (error.name === 'ForbiddenError') {
    return createErrorResponse(
      'Access denied',
      'FORBIDDEN',
      403
    );
  }

  if (error.name === 'NotFoundError') {
    return createErrorResponse(
      'Resource not found',
      'NOT_FOUND',
      404
    );
  }

  // Default to internal server error
  return createErrorResponse(
    'An unexpected error occurred',
    'INTERNAL_SERVER_ERROR',
    500,
    process.env.NODE_ENV === 'development' ? {
      message: error.message,
      stack: error.stack
    } : undefined
  );
}

/**
 * Create a paginated response
 * @param data - Array of items
 * @param page - Current page
 * @param limit - Items per page
 * @param total - Total number of items
 * @param message - Success message
 * @returns Paginated response
 */
export function createPaginatedResponse(
  data: any[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data retrieved successfully'
): NextResponse {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return createSuccessResponse(
    {
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    },
    message
  );
}

/**
 * Create a rate limit exceeded response
 * @param resetTime - Time when rate limit resets
 * @returns Rate limit error response
 */
export function createRateLimitResponse(resetTime: number): NextResponse {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        resetIn: resetInSeconds,
        timestamp: new Date().toISOString(),
      },
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Reset': resetTime.toString(),
        'Retry-After': resetInSeconds.toString(),
      },
    }
  );
}