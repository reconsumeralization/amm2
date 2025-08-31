// src/app/api/customers/[id]/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 401);
    }

    const payload = await getPayload();
    const customerId = params.id;

    // 1. Fetch Customer Details
    const customer = await payload.findByID({
      collection: 'customers',
      id: customerId,
      depth: 2, // To populate relationships like preferredStylist
    });

    if (!customer) {
      return createErrorResponse('Customer not found', 404);
    }

    // 2. Fetch Appointment History
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        user: { equals: customerId },
      },
      sort: '-date',
      limit: 10, // Get the 10 most recent appointments
    });

    // 3. Fetch Customer Notes
    const notes = await payload.find({
        collection: 'customer-notes',
        where: {
            customer: { equals: customerId },
        },
        sort: '-createdAt',
        limit: 5, // Get the 5 most recent notes
    });

    // 4. Calculate Stats
    const stats = {
        totalAppointments: appointments.totalDocs,
        totalSpent: customer.loyaltyProgram?.totalSpent || 0,
        lastVisit: customer.visitHistory?.lastVisit || null,
    };

    // 5. Consolidate and Return Data
    const dashboardData = {
      customer,
      appointments: appointments.docs,
      notes: notes.docs,
      stats,
    };

    return createSuccessResponse(dashboardData);

  } catch (error) {
    console.error(`Error fetching customer dashboard for ${params.id}:`, error);
    return createErrorResponse('Failed to fetch customer dashboard', 500);
  }
}
