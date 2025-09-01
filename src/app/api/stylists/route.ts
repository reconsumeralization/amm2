// src/app/api/stylists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getPayloadClient } from '@/payload';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';
import { validateRequestBody, validateQueryParams } from '@/lib/validation-utils';
import { rateLimit } from '@/lib/rate-limit';
import { unstable_noStore as noStore } from 'next/cache';
import type { Stylist } from '@/payload-types';

// Input validation schemas
const getStylistsSchema = z.object({
  featured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  specialization: z.string().optional(),
  location: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(['name', '-name', 'displayOrder', '-displayOrder', 'rating', '-rating', 'createdAt', '-createdAt']).default('displayOrder'),
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
});

const createStylistSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  bio: z.string().max(1000, 'Bio too long').optional(),
  profileImage: z.string().url().optional(),
  specializations: z.array(z.string()).min(1, 'At least one specialization required'),
  experience: z.object({
    years: z.coerce.number().min(0).max(50).optional(),
    certifications: z.array(z.string()).optional(),
    awards: z.array(z.string()).optional(),
  }).optional(),
  performance: z.object({
    rating: z.coerce.number().min(0).max(5).optional(),
    totalReviews: z.coerce.number().min(0).optional(),
    completedServices: z.coerce.number().min(0).optional(),
  }).optional(),
  socialMedia: z.object({
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).optional(),
  schedule: z.object({
    monday: z.object({
      isAvailable: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
    tuesday: z.object({
      isAvailable: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
    wednesday: z.object({
      isAvailable: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
    thursday: z.object({
      isAvailable: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
    friday: z.object({
      isAvailable: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
    saturday: z.object({
      isAvailable: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
    sunday: z.object({
      isAvailable: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
  }).optional(),
  pricing: z.record(z.coerce.number().min(0)).optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().min(0).optional(),
  portfolio: z.array(z.string().url()).optional(),
  tenant: z.string().optional(),
});

/**
 * GET /api/stylists - Fetch stylists with advanced filtering
 * @param request - NextRequest object
 * @returns Promise<NextResponse>
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  noStore();

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      limit: 150,
      window: '1m',
      identifier: 'stylists-get'
    });

    if (rateLimitResult.error) {
      return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = getStylistsSchema.safeParse(queryParams);
    if (!validation.success) {
      return createErrorResponse(
        `Invalid query parameters: ${validation.error.errors.map(e => e.message).join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    const {
      featured,
      isActive,
      search,
      specialization,
      location,
      minRating,
      maxRating,
      sort,
      limit,
      page
    } = validation.data;

    const payload = await getPayloadClient();

    // Build query filters
    const where: any = {};

    if (featured !== undefined) {
      where.featured = { equals: featured };
    }

    if (isActive !== undefined) {
      where.isActive = { equals: isActive };
    }

    if (search) {
      where.or = [
        { name: { like: search } },
        { bio: { like: search } },
        { specializations: { in: [search] } }
      ];
    }

    if (specialization) {
      where.specializations = { in: [specialization] };
    }

    if (location) {
      where.location = { equals: location };
    }

    // Rating range filter
    if (minRating !== undefined || maxRating !== undefined) {
      where['performance.rating'] = {};
      if (minRating !== undefined) where['performance.rating'].greater_than_equal = minRating;
      if (maxRating !== undefined) where['performance.rating'].less_than_equal = maxRating;
    }

    // Fetch stylists with optimized query
    const stylists = await payload.find({
      collection: 'stylists',
      where,
      limit,
      page,
      sort,
      depth: 3, // Include user and related data
    });

    // Transform stylists for frontend with enhanced data
    const transformedStylists = stylists.docs.map((stylist: any) => ({
      id: stylist.id,
      name: stylist.name,
      bio: stylist.bio,
      profileImage: stylist.profileImage,
      specializations: stylist.specializations || [],
      experience: stylist.experience,
      performance: stylist.performance,
      socialMedia: stylist.socialMedia,
      featured: stylist.featured,
      isActive: stylist.isActive,
      displayOrder: stylist.displayOrder,
      certifications: stylist.experience?.certifications || [],
      awards: stylist.experience?.awards || [],
      portfolio: stylist.portfolio || [],
      schedule: stylist.schedule,
      pricing: stylist.pricing,
      user: stylist.user,
      tenant: stylist.tenant,
      createdAt: stylist.createdAt,
      updatedAt: stylist.updatedAt,
    }));

    // Add metadata for better client-side handling
    const response = {
      stylists: transformedStylists,
      total: stylists.totalDocs,
      page: stylists.page,
      totalPages: stylists.totalPages,
      hasNext: stylists.hasNextPage,
      hasPrev: stylists.hasPrevPage,
      meta: {
        filters: {
          featured,
          isActive,
          search,
          specialization,
          location,
          minRating,
          maxRating,
        },
        availableSpecializations: await getAvailableSpecializations(payload),
        averageRating: await getAverageRating(payload),
      },
    };

    return createSuccessResponse(response, 'Stylists retrieved successfully');
  } catch (error) {
    console.error('Error fetching stylists:', error);
    return createErrorResponse(
      'Failed to fetch stylists',
      'INTERNAL_SERVER_ERROR',
      500,
      { error: process.env.NODE_ENV === 'development' ? error.message : undefined }
    );
  }
}

/**
 * POST /api/stylists - Create a new stylist
 * @param request - NextRequest object
 * @returns Promise<NextResponse>
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      limit: 30,
      window: '1m',
      identifier: 'stylists-create'
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
    const validation = await validateRequestBody(request, createStylistSchema);
    if (!validation.success) {
      return createErrorResponse(
        `Validation error: ${validation.errors?.join(', ') || 'Unknown validation error'}`,
        'VALIDATION_ERROR',
        400
      );
    }

    const stylistData = validation.data;

    // Business logic validations
    const errors: string[] = [];

    // Check if user exists and is not already a stylist
    const existingUser = await payload.findByID({
      collection: 'users',
      id: stylistData.user,
    });

    if (!existingUser) {
      errors.push('User not found');
    }

    // Check if user is already a stylist
    const existingStylist = await payload.find({
      collection: 'stylists',
      where: {
        user: { equals: stylistData.user },
      },
      limit: 1,
    });

    if (existingStylist.docs.length > 0) {
      errors.push('User is already registered as a stylist');
    }

    // Validate specializations are not empty
    if (!stylistData.specializations || stylistData.specializations.length === 0) {
      errors.push('At least one specialization is required');
    }

    // Validate schedule has at least one available day
    if (stylistData.schedule) {
      const hasAvailableDay = Object.values(stylistData.schedule).some(
        (day: any) => day.isAvailable
      );
      if (!hasAvailableDay) {
        errors.push('Stylist must be available on at least one day');
      }
    }

    if (errors.length > 0) {
      return createErrorResponse(
        `Stylist validation failed: ${errors.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    // Set tenant if not provided
    if (!stylistData.tenant && (session as any).user.tenant) {
      stylistData.tenant = (session as any).user.tenant;
    }

    // Create stylist
    const newStylist = await payload.create({
      collection: 'stylists',
      data: {
        ...stylistData,
        createdBy: (session as any).user.id,
      },
      depth: 3,
    });

    // Log the creation for audit purposes
    console.log(`Stylist created: ${newStylist.id} by user ${(session as any).user.id}`);

    return createSuccessResponse(
      newStylist,
      'Stylist created successfully',
      201
    );
  } catch (error) {
    console.error('Error creating stylist:', error);
    return createErrorResponse(
      'Failed to create stylist',
      'INTERNAL_SERVER_ERROR',
      500,
      { error: process.env.NODE_ENV === 'development' ? error.message : undefined }
    );
  }
}

/**
 * Get available specializations for filtering
 * @param payload - Payload client
 * @returns Promise<string[]>
 */
async function getAvailableSpecializations(payload: any): Promise<string[]> {
  try {
    const stylists = await payload.find({
      collection: 'stylists',
      where: {
        isActive: { equals: true },
      },
      limit: 0, // Get all for aggregation
    });

    // Extract unique specializations
    const allSpecializations = stylists.docs.flatMap((stylist: any) =>
      stylist.specializations || []
    );

    return [...new Set(allSpecializations)].sort();
  } catch (error) {
    console.error('Error fetching specializations:', error);
    return [];
  }
}

/**
 * Get average rating across all stylists
 * @param payload - Payload client
 * @returns Promise<number>
 */
async function getAverageRating(payload: any): Promise<number> {
  try {
    const stylists = await payload.find({
      collection: 'stylists',
      where: {
        isActive: { equals: true },
        'performance.rating': { greater_than: 0 },
      },
      limit: 0,
    });

    if (stylists.docs.length === 0) return 0;

    const totalRating = stylists.docs.reduce((sum: number, stylist: any) =>
      sum + (stylist.performance?.rating || 0), 0
    );

    return Math.round((totalRating / stylists.docs.length) * 10) / 10;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
}
