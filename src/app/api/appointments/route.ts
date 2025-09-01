// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';
import { validateRequestBody } from '@/lib/validation-utils';
import { rateLimit } from '@/lib/rate-limit';
import type { Appointment, User } from '@/payload-types';

// Input validation schemas
const getAppointmentsSchema = z.object({
  tenant: z.string().optional(),
  user: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  service: z.string().optional(),
  stylist: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
  sort: z.enum(['createdAt', '-createdAt', 'date', '-date']).default('-createdAt'),
});

const createAppointmentSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  service: z.string().min(1, 'Service is required'),
  stylist: z.string().min(1, 'Stylist is required'),
  date: z.string().datetime('Invalid date format'),
  duration: z.coerce.number().min(15).max(480, 'Duration must be between 15-480 minutes'),
  status: z.enum(['scheduled', 'confirmed']).default('scheduled'),
  notes: z.string().max(1000).optional(),
  price: z.coerce.number().min(0).optional(),
  tenant: z.string().optional(),
});

/**
 * GET /api/appointments - Fetch appointments with advanced filtering
 * @param request - NextRequest object
 * @returns Promise<NextResponse>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, {
      limit: 100,
      window: '1m',
      identifier: 'appointments-get'
    });

    if (rateLimitResult.error) {
      return createErrorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Authentication
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = getAppointmentsSchema.safeParse(queryParams);
    if (!validation.success) {
      return createErrorResponse(
        `Invalid query parameters: ${validation.error.errors.map(e => e.message).join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    const {
      tenant,
      user,
      status,
      dateFrom,
      dateTo,
      service,
      stylist,
      limit,
      page,
      sort
    } = validation.data;

    const payload = await getPayloadClient();
    const userRole = (session as any).user.role;
    const userId = (session as any).user.id;

    // Build query filters with role-based access control
    const where: any = {};

    // Multi-tenant support
    if (tenant) {
      where.tenant = { equals: tenant };
    }

    // Role-based filtering
    if (userRole === 'customer') {
      // Customers can only see their own appointments
      where.customer = { equals: userId };
    } else if (userRole === 'stylist') {
      // Stylists can see appointments assigned to them
      where.or = [
        { stylist: { equals: userId } },
        { createdBy: { equals: userId } }
      ];
    } else if (userRole === 'manager') {
      // Managers can see appointments for their team/staff
      // Additional logic would be needed here for team management
      where.tenant = { equals: (session as any).user.tenant };
    }
    // Admin can see all

    // Apply filters
    if (user && userRole !== 'customer') {
      where.customer = { equals: user };
    }

    if (status) {
      where.status = { equals: status };
    }

    if (service) {
      where.service = { equals: service };
    }

    if (stylist) {
      where.stylist = { equals: stylist };
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.greater_than_equal = dateFrom;
      if (dateTo) where.date.less_than_equal = dateTo;
    }

    // Fetch appointments with optimized query
    const appointments = await payload.find({
      collection: 'appointments',
      where,
      limit,
      page,
      sort,
      depth: 3, // Include customer, service, and stylist data
      populate: ['customer', 'service', 'stylist', 'createdBy'],
    });

    // Add metadata for better client-side handling
    const response = {
      ...appointments,
      meta: {
        filters: {
          tenant,
          status,
          dateFrom,
          dateTo,
          service,
          stylist,
        },
        userRole,
        permissions: {
          canCreate: ['admin', 'manager', 'stylist'].includes(userRole),
          canEdit: ['admin', 'manager'].includes(userRole),
          canDelete: ['admin', 'manager'].includes(userRole),
          canViewAll: ['admin', 'manager'].includes(userRole),
        },
      },
    };

    return createSuccessResponse(response, 'Appointments retrieved successfully');
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return createErrorResponse(
      'Failed to fetch appointments',
      'INTERNAL_SERVER_ERROR',
      500,
      { error: process.env.NODE_ENV === 'development' ? error.message : undefined }
    );
  }
}

/**
 * POST /api/appointments - Create a new appointment
 * @param request - NextRequest object
 * @returns Promise<NextResponse>
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, {
      limit: 20,
      window: '1m',
      identifier: 'appointments-create'
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
    const userId = (session as any).user.id;

    // Role-based permission check
    if (!['admin', 'manager', 'stylist', 'customer'].includes(userRole)) {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403);
    }

    // Validate request body
    const validation = await validateRequestBody(req, createAppointmentSchema);
    if (!validation.success) {
      return createErrorResponse(
        `Validation error: ${validation.errors?.join(', ') || 'Unknown validation error'}`,
        'VALIDATION_ERROR',
        400
      );
    }

    const appointmentData = validation.data;

    // Business logic validations
    const errors: string[] = [];

    // Check if customer exists and is active
    const customer = await payload.findByID({
      collection: 'customers',
      id: appointmentData.customer,
    });

    if (!customer) {
      errors.push('Customer not found');
    } else if (!(customer as any).isActive) {
      errors.push('Customer account is not active');
    }

    // Check if service exists
    const service = await payload.findByID({
      collection: 'services',
      id: appointmentData.service,
    });

    if (!service) {
      errors.push('Service not found');
    }

    // Check if stylist exists and is available
    const stylist = await payload.findByID({
      collection: 'stylists',
      id: appointmentData.stylist,
    });

    if (!stylist) {
      errors.push('Stylist not found');
    } else if (!(stylist as any).isActive) {
      errors.push('Stylist is not active');
    }

    // Check for scheduling conflicts
    if (customer && service && stylist) {
      const conflictCheck = await payload.find({
        collection: 'appointments',
        where: {
          stylist: { equals: appointmentData.stylist },
          date: { equals: appointmentData.date },
          status: { in: ['scheduled', 'confirmed', 'in-progress'] },
        },
        limit: 1,
      });

      if (conflictCheck.docs.length > 0) {
        errors.push('Stylist has a scheduling conflict at this time');
      }
    }

    if (errors.length > 0) {
      return createErrorResponse(
        `Appointment validation failed: ${errors.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    // Set default price if not provided
    if (!appointmentData.price && service) {
      appointmentData.price = (service as any).price;
    }

    // Set tenant if not provided
    if (!appointmentData.tenant && (session as any).user.tenant) {
      appointmentData.tenant = (session as any).user.tenant;
    }

    // Create appointment
    const newAppointment = await payload.create({
      collection: 'appointments',
      data: {
        ...appointmentData,
        createdBy: userId,
      },
      depth: 3,
    });

    // Log the creation for audit purposes
    console.log(`Appointment created: ${newAppointment.id} by user ${userId}`);

    return createSuccessResponse(
      newAppointment,
      'Appointment created successfully',
      201
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return createErrorResponse(
      'Failed to create appointment',
      'INTERNAL_SERVER_ERROR',
      500,
      { error: process.env.NODE_ENV === 'development' ? error.message : undefined }
    );
  }
}
