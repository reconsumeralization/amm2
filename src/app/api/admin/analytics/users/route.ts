import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock user analytics data
    const mockData = {
      active: 45,
      total: 1234,
      newToday: 8,
      newThisWeek: 23,
      online: 12,
      registered: 1156
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user analytics data' },
      { status: 500 }
    );
  }
}
