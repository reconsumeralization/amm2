import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock recent activities data
    const mockActivities = [
      {
        id: '1',
        type: 'appointment',
        description: 'New appointment booked for John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        status: 'success'
      },
      {
        id: '2',
        type: 'customer',
        description: 'Jane Smith registered as new customer',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        status: 'success'
      },
      {
        id: '3',
        type: 'payment',
        description: 'Payment of $85.00 received',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        status: 'success'
      },
      {
        id: '4',
        type: 'content',
        description: 'Homepage content updated',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        status: 'warning'
      },
      {
        id: '5',
        type: 'appointment',
        description: 'Appointment cancelled by customer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        status: 'error'
      },
      {
        id: '6',
        type: 'customer',
        description: 'Profile updated for Mike Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        status: 'success'
      }
    ];

    return NextResponse.json(mockActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities data' },
      { status: 500 }
    );
  }
}
