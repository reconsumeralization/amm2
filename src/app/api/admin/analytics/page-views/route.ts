import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would fetch this data from your analytics database
    // For now, we'll return mock data
    const mockData = {
      total: 15420,
      today: 234,
      yesterday: 189,
      thisWeek: 1456,
      lastWeek: 1321,
      changePercent: 12.5
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching page views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page views data' },
      { status: 500 }
    );
  }
}
