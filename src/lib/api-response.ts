import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export function createSuccessResponse<T = any>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function createErrorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function createValidationErrorResponse(
  message: string,
  details?: any
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 'VALIDATION_ERROR', 400, details);
}

export function createNotFoundResponse(
  message: string = 'Resource not found'
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 'NOT_FOUND', 404);
}

export function createUnauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 'UNAUTHORIZED', 401);
}

export function createForbiddenResponse(
  message: string = 'Forbidden'
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 'FORBIDDEN', 403);
}
