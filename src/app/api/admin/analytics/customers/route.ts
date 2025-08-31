import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock customer analytics data
    const mockData = {
      total: 234,
      new: 5,
      active: 189,
      returning: 145,
      newToday: 2,
      newThisWeek: 8,
      newThisMonth: 15,
      averageLifetimeValue: 450.75,
      retentionRate: 78.5
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics data' },
      { status: 500 }
    );
  }
}
