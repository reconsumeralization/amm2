// src/app/api/crm/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../payload.config';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const payload = await getPayload({ config });

    // 1. Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await payload.find({
      collection: 'appointments',
      where: {
        date: {
          greater_than_equal: today.toISOString(),
          less_than: tomorrow.toISOString(),
        },
      },
    });

    // 2. Get new customers this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newCustomersThisWeek = await payload.find({
        collection: 'customers',
        where: {
            createdAt: {
                greater_than_equal: oneWeekAgo.toISOString(),
            },
        },
    });

    // 3. Get total revenue this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const completedAppointmentsThisMonth = await payload.find({
        collection: 'appointments',
        where: {
            status: { equals: 'completed' },
            date: {
                greater_than_equal: thisMonth.toISOString(),
            },
        },
        limit: 1000, // Adjust as needed
    });

    const totalRevenueThisMonth = completedAppointmentsThisMonth.docs.reduce((total, app) => total + (app.price || 0), 0);

    // 4. Get recent activity (e.g., last 5 created appointments)
    const recentActivity = await payload.find({
        collection: 'appointments',
        sort: '-createdAt',
        limit: 5,
        depth: 1, // To get customer name
    });

    const dashboardData = {
      stats: {
        upcomingAppointmentsToday: todaysAppointments.totalDocs,
        newCustomersThisWeek: newCustomersThisWeek.totalDocs,
        totalRevenueThisMonth: totalRevenueThisMonth,
      },
      recentActivity: recentActivity.docs,
    };

    return createSuccessResponse(dashboardData);

  } catch (error) {
    console.error('Error fetching CRM dashboard data:', error);
    return createErrorResponse('Failed to fetch CRM dashboard data', 'INTERNAL_SERVER_ERROR');
  }
}
