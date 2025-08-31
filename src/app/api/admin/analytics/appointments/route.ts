import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock appointment analytics data
    const mockData = {
      total: 156,
      pending: 12,
      confirmed: 89,
      completed: 45,
      cancelled: 10,
      today: 8,
      thisWeek: 23,
      thisMonth: 67,
      noShow: 3,
      averageDuration: 60,
      completionRate: 85.2
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching appointment analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment analytics data' },
      { status: 500 }
    );
  }
}
