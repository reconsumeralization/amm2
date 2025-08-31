import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    console.log('Test appointments API called');

    // Mock appointment data without authentication
    const mockAppointments = [
      {
        id: '1',
        tenant: 'tenant-id-placeholder',
        user: 'user-id-placeholder',
        staff: '3',
        service: 'Classic Haircut',
        status: 'confirmed',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        price: 35,
        notes: 'Regular customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      docs: mockAppointments,
      totalDocs: mockAppointments.length,
      limit: 100,
      totalPages: 1,
      page: 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null
    });
  } catch (error) {
    console.error('Test appointments API error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}
