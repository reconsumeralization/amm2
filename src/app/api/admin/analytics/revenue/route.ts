import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock revenue analytics data
    const mockData = {
      total: 45678.90,
      today: 1234.56,
      thisWeek: 8765.43,
      thisMonth: 34567.89,
      lastMonth: 32109.87,
      changePercent: 8.2,
      averageOrderValue: 85.50
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics data' },
      { status: 500 }
    );
  }
}
