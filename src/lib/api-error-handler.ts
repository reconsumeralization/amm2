import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { yoloMonitoring } from '@/lib/monitoring';

/**
 * Standard API error response structure
 */
export interface APIError {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

/**
 * Standard API success response structure
 */
export interface APISuccess<T = any> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
  requestId?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Common error codes for the ModernMen API
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_UUID: 'INVALID_UUID',
  
  // Resource Management
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  RESOURCE_EXPIRED: 'RESOURCE_EXPIRED',
  
  // Business Logic
  APPOINTMENT_CONFLICT: 'APPOINTMENT_CONFLICT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BOOKING_WINDOW_CLOSED: 'BOOKING_WINDOW_CLOSED',
  CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
  
  // External Services
  STRIPE_ERROR: 'STRIPE_ERROR',
  GOOGLE_CALENDAR_ERROR: 'GOOGLE_CALENDAR_ERROR',
  OPENAI_ERROR: 'OPENAI_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  BUNNY_CDN_ERROR: 'BUNNY_CDN_ERROR',
  SMS_ERROR: 'SMS_ERROR',
  
  // Rate Limiting & Throttling
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  THROTTLED: 'THROTTLED',
  
  // System Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const;

export const APIErrors = ERROR_CODES

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a standardized error response with enhanced logging and monitoring
 */
export function createErrorResponse(
  error: string,
  code: keyof typeof ERROR_CODES = 'INTERNAL_SERVER_ERROR',
  status: number = 500,
  details?: any,
  requestId?: string,
  path?: string
): NextResponse<APIError> {
  const errorId = requestId || generateRequestId();
  
  const errorResponse: APIError = {
    error,
    code: ERROR_CODES[code],
    details,
    timestamp: new Date().toISOString(),
    requestId: errorId,
    path,
  };

  // Log error with appropriate level
  const severity = getErrorSeverity(status);
  logger.error('API Error', {
    ...errorResponse,
    severity,
    statusCode: status,
  });

  // Track error in monitoring
  yoloMonitoring.captureException(new Error(error), {
    code: ERROR_CODES[code],
    status,
    details,
    requestId: errorId,
    path,
    severity,
  });

  return NextResponse.json(errorResponse, { status });
}

/**
 * Determine error severity based on status code
 */
function getErrorSeverity(status: number): ErrorSeverity {
  if (status >= 500) return ErrorSeverity.CRITICAL;
  if (status >= 400 && status < 500) return ErrorSeverity.MEDIUM;
  return ErrorSeverity.LOW;
}

/**
 * Handle common API errors with proper logging and responses
 */
export function handleAPIError(error: any, context: string = 'API'): NextResponse<APIError> {
  console.error(`[${context}] Error:`, error);

  // Handle known error types
  if (error.name === 'ValidationError') {
    return createErrorResponse(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      error.details
    );
  }

  if (error.name === 'MongoError' && error.code === 11000) {
    return createErrorResponse(
      'Resource already exists',
      'RESOURCE_ALREADY_EXISTS',
      409
    );
  }

  if (error.status === 401) {
    return createErrorResponse(
      'Unauthorized access',
      'UNAUTHORIZED',
      401
    );
  }

  if (error.status === 403) {
    return createErrorResponse(
      'Access forbidden',
      'FORBIDDEN',
      403
    );
  }

  if (error.status === 404) {
    return createErrorResponse(
      'Resource not found',
      'RESOURCE_NOT_FOUND',
      404
    );
  }

  if (error.status === 429) {
    return createErrorResponse(
      'Rate limit exceeded',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  }

  // Handle Stripe errors
  if (error.type?.startsWith('Stripe')) {
    return createErrorResponse(
      `Payment error: ${error.message}`,
      'STRIPE_ERROR',
      400,
      { stripeError: error }
    );
  }

  // Handle OpenAI errors
  if (error.status === 429 && error.message?.includes('rate limit')) {
    return createErrorResponse(
      'AI service rate limit exceeded',
      'OPENAI_ERROR',
      429
    );
  }

  if (error.status === 401 && error.message?.includes('API key')) {
    return createErrorResponse(
      'AI service authentication failed',
      'OPENAI_ERROR',
      500
    );
  }

  // Handle Google Calendar errors
  if (error.code === 'GOOGLE_CALENDAR_ERROR') {
    return createErrorResponse(
      'Google Calendar sync failed',
      'GOOGLE_CALENDAR_ERROR',
      500,
      { googleError: error }
    );
  }

  // Default internal server error
  return createErrorResponse(
    'Internal server error',
    'INTERNAL_SERVER_ERROR',
    500
  );
}

/**
 * Validate required environment variables
 */
export function validateEnvironmentVariables(): { isValid: boolean; errors: string[] } {
  const requiredVars = [
    'DATABASE_URI',
    'PAYLOAD_SECRET',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const optionalVars = [
    'BUNNY_API_KEY',
    'BUNNY_STORAGE_ZONE',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
  ];

  const errors: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Warn about optional variables
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      console.warn(`Optional environment variable not set: ${varName}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate request body for required fields
 */
export function validateRequestBody(body: any, requiredFields: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate tenant ID for multi-tenant requests
 */
export function validateTenantId(tenantId: string | null | undefined): { isValid: boolean; error?: string } {
  if (!tenantId) {
    return { isValid: false, error: 'Tenant ID is required' };
  }

  if (typeof tenantId !== 'string' || tenantId.trim().length === 0) {
    return { isValid: false, error: 'Invalid tenant ID format' };
  }

  return { isValid: true };
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return false;
    }

    const requests = this.requests.get(identifier)!;
    const recentRequests = requests.filter(time => time > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      return true;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return false;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }

    const requests = this.requests.get(identifier)!;
    const recentRequests = requests.filter(time => time > windowStart);

    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

/**
 * Higher-order function to wrap API handlers with error handling
 */
export function withErrorHandler(handler: (req: any) => Promise<any>) {
  return async (req: any) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T = any>(
  data?: T, 
  message?: string, 
  status: number = 200,
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  },
  requestId?: string
): NextResponse<APISuccess<T>> {
  const response: APISuccess<T> = {
    success: true,
    message: message || 'Operation completed successfully',
    data: data || null,
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
    meta,
  };

  return NextResponse.json(response, { status });
}
