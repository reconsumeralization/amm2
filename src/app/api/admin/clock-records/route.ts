import { getPayloadClient } from '@/payload';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET - List clock records with filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const { searchParams } = new URL(req.url);

    // Build query based on user role and filters
    let where: any = {};

    // Filter by staff if user is not admin/manager
    if ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager') {
      where.staff = { equals: (session as any).user.id };
    }

    // Apply filters from query params
    const staff = searchParams.get('staff');
    const tenant = searchParams.get('tenant');
    const action = searchParams.get('action');
    const date = searchParams.get('createdAt');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (staff) where.staff = { equals: staff };
    if (tenant) where.tenant = { equals: tenant };
    if (action) where.action = { equals: action };

    // Date filtering for createdAt field
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      where.createdAt = {
        greater_than_or_equal: targetDate.toISOString(),
        less_than: nextDay.toISOString()
      };
    }

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.createdAt = { greater_than_or_equal: new Date(startDate).toISOString() };
      if (endDate) dateFilter.createdAt = { ...dateFilter.createdAt, less_than_or_equal: new Date(endDate).toISOString() };

      where.and = where.and || [];
      where.and.push(dateFilter);
    }

    const clockRecords = await payload.find({
      collection: 'clock-records',
      where,
      sort: searchParams.get('sort') || '-createdAt',
      limit: parseInt(searchParams.get('limit') || '50'),
      page: parseInt(searchParams.get('page') || '1'),
    });

    return NextResponse.json(clockRecords);
  } catch (error: any) {
    console.error('Error fetching clock records:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch clock records'
    }, { status: 500 });
  }
}
