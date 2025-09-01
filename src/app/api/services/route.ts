
// src/app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';
import { validateRequestBody, validateQueryParams } from '@/lib/validation-utils';
import { rateLimit } from '@/lib/rate-limit';
import { unstable_noStore as noStore } from 'next/cache';
import type { Service } from '@/payload-types';

// Input validation schemas
const getServicesSchema = z.object({
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
  sort: z.enum(['name', '-name', 'price', '-price', 'createdAt', '-createdAt']).default('-createdAt'),
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
});

const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Service name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  price: z.coerce.number().min(0, 'Price must be positive').max(10000, 'Price too high'),
  duration: z.coerce.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category name too long'),
  isActive: z.boolean().default(true),
  image: z.string().url().optional(),
  features: z.array(z.string()).default([]),
  tenant: z.string().optional(),
});

/**
 * GET /api/services - Fetch services with advanced filtering
 * @param request - NextRequest object
 * @returns Promise<NextResponse>
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  noStore();

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      limit: 200,
      window: '1m',
      identifier: 'services-get'
    });

    if (rateLimitResult.error) {
      return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = getServicesSchema.safeParse(queryParams);
    if (!validation.success) {
      return createErrorResponse(
        `Invalid query parameters: ${validation.error.errors.map(e => e.message).join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    const {
      category,
      isActive,
      minPrice,
      maxPrice,
      search,
      sort,
      limit,
      page
    } = validation.data;

    const payload = await getPayloadClient();

    // Build query filters
    const where: any = {};

    // Category filter
    if (category) {
      where.category = { equals: category };
    }

    // Active status filter
    if (isActive !== undefined) {
      where.isActive = { equals: isActive };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.greater_than_equal = minPrice;
      if (maxPrice !== undefined) where.price.less_than_equal = maxPrice;
    }

    // Search filter
    if (search) {
      where.or = [
        { name: { like: search } },
        { description: { like: search } },
        { category: { like: search } }
      ];
    }

    // Fetch services with optimized query
    const services = await payload.find({
      collection: 'services',
      where,
      limit,
      page,
      sort,
      depth: 2, // Include related data
    });

    // Add metadata for better client-side handling
    const response = {
      ...services,
      meta: {
        filters: {
          category,
          isActive,
          minPrice,
          maxPrice,
          search,
        },
        availableCategories: await getAvailableCategories(payload),
      },
    };

    return createSuccessResponse(response, 'Services retrieved successfully');
  } catch (error) {
    console.error('Error fetching services:', error);
    return createErrorResponse(
      'Failed to fetch services',
      'INTERNAL_SERVER_ERROR',
      500,
      { error: process.env.NODE_ENV === 'development' ? error.message : undefined }
    );
  }
}

/**
 * POST /api/services - Create a new service
 * @param request - NextRequest object
 * @returns Promise<NextResponse>
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      limit: 50,
      window: '1m',
      identifier: 'services-create'
    });

    if (rateLimitResult.error) {
      return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Authentication
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const payload = await getPayloadClient();
    const userRole = (session as any).user.role;

    // Role-based permission check
    if (!['admin', 'manager'].includes(userRole)) {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403);
    }

    // Validate request body
    const validation = await validateRequestBody(request, createServiceSchema);
    if (!validation.success) {
      return createErrorResponse(
        `Validation error: ${validation.errors?.join(', ') || 'Unknown validation error'}`,
        'VALIDATION_ERROR',
        400
      );
    }

    const serviceData = validation.data;

    // Business logic validations
    const errors: string[] = [];

    // Check for duplicate service name
    const existingService = await payload.find({
      collection: 'services',
      where: {
        name: { equals: serviceData.name },
        category: { equals: serviceData.category },
      },
      limit: 1,
    });

    if (existingService.docs.length > 0) {
      errors.push('A service with this name already exists in the selected category');
    }

    // Validate duration is reasonable for price
    if (serviceData.price > 500 && serviceData.duration < 60) {
      errors.push('High-priced services should have longer duration');
    }

    if (errors.length > 0) {
      return createErrorResponse(
        `Service validation failed: ${errors.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    // Set tenant if not provided
    if (!serviceData.tenant && (session as any).user.tenant) {
      serviceData.tenant = (session as any).user.tenant;
    }

    // Create service
    const newService = await payload.create({
      collection: 'services',
      data: {
        ...serviceData,
        createdBy: (session as any).user.id,
      },
      depth: 2,
    });

    // Log the creation for audit purposes
    console.log(`Service created: ${newService.id} by user ${(session as any).user.id}`);

    return createSuccessResponse(
      newService,
      'Service created successfully',
      201
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return createErrorResponse(
      'Failed to create service',
      'INTERNAL_SERVER_ERROR',
      500,
      { error: process.env.NODE_ENV === 'development' ? error.message : undefined }
    );
  }
}

/**
 * Get available service categories for filtering
 * @param payload - Payload client
 * @returns Promise<string[]>
 */
async function getAvailableCategories(payload: any): Promise<string[]> {
  try {
    const categories = await payload.find({
      collection: 'services',
      where: {
        isActive: { equals: true },
      },
      limit: 0, // Get all for aggregation
    });

    // Extract unique categories
    const uniqueCategories = [...new Set(
      categories.docs
        .map((service: any) => service.category)
        .filter(Boolean)
    )];

    return uniqueCategories.sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
