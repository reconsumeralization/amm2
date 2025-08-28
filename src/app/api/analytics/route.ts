import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const type = searchParams.get('type') || 'all' // revenue, services, employees, all

    const days = parseInt(period)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const analytics = await generateAnalytics(startDate, days, type)

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function generateAnalytics(startDate: Date, days: number, type: string) {
  // Generate date range for charts
  const dateRange: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dateRange.push(date.toISOString().split('T')[0])
  }

  const analytics: Record<string, unknown> = {
    period: `${days} days`,
    dateRange
  }

  if (type === 'all' || type === 'revenue') {
    analytics.revenue = await generateRevenueAnalytics(startDate, dateRange)
  }

  if (type === 'all' || type === 'services') {
    analytics.services = await generateServiceAnalytics(startDate)
  }

  if (type === 'all' || type === 'employees') {
    analytics.employees = await generateEmployeeAnalytics(startDate, dateRange)
  }

  if (type === 'all') {
    analytics.summary = await generateSummaryAnalytics(startDate, days)
  }

  return analytics
}

async function generateRevenueAnalytics(startDate: Date, dateRange: string[]) {
  // In a real implementation, this would aggregate appointment data
  // For demo, generate sample data
  const revenueData = dateRange.map(date => ({
    date,
    revenue: Math.floor(Math.random() * 5000) + 10000, // $10k - $15k
    appointments: Math.floor(Math.random() * 20) + 40, // 40-60 appointments
    services: Math.floor(Math.random() * 30) + 60 // 60-90 services
  }))

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalAppointments = revenueData.reduce((sum, item) => sum + item.appointments, 0)

  return {
    data: revenueData,
    totalRevenue,
    totalAppointments,
    averageRevenue: totalRevenue / revenueData.length,
    averageAppointments: totalAppointments / revenueData.length,
    trend: calculateTrend(revenueData.map(d => d.revenue))
  }
}

async function generateServiceAnalytics(startDate: Date) {
  // In a real implementation, this would aggregate service usage data
  const services = [
    { name: 'Hair Cut & Style', count: 234, revenue: 35100, rating: 4.8, duration: 45 },
    { name: 'Beard Trim & Shape', count: 156, revenue: 15600, rating: 4.7, duration: 25 },
    { name: 'Color Treatment', count: 89, revenue: 26700, rating: 4.6, duration: 120 },
    { name: 'Full Service Package', count: 67, revenue: 40200, rating: 4.9, duration: 90 },
    { name: 'Men\'s Facial', count: 45, revenue: 6750, rating: 4.5, duration: 60 },
    { name: 'Hot Towel Shave', count: 78, revenue: 11700, rating: 4.8, duration: 30 }
  ]

  return {
    data: services,
    topService: services.reduce((prev, current) => (prev.count > current.count) ? prev : current),
    totalServices: services.reduce((sum, s) => sum + s.count, 0),
    totalRevenue: services.reduce((sum, s) => sum + s.revenue, 0),
    averageRating: services.reduce((sum, s) => sum + s.rating, 0) / services.length
  }
}

async function generateEmployeeAnalytics(startDate: Date, dateRange: string[]) {
  // Generate sample employee performance data
  const employeeData = dateRange.map(date => ({
    date,
    efficiency: Math.floor(Math.random() * 10) + 85, // 85-95%
    satisfaction: Math.floor(Math.random() * 10) + 85, // 85-95%
    performance: Math.floor(Math.random() * 10) + 85, // 85-95%
    punctuality: Math.floor(Math.random() * 5) + 95, // 95-100%
    bookings: Math.floor(Math.random() * 6) + 5 // 5-11 bookings
  }))

  const latestData = employeeData[employeeData.length - 1]

  return {
    data: employeeData,
    latest: latestData,
    averages: {
      efficiency: employeeData.reduce((sum, d) => sum + d.efficiency, 0) / employeeData.length,
      satisfaction: employeeData.reduce((sum, d) => sum + d.satisfaction, 0) / employeeData.length,
      performance: employeeData.reduce((sum, d) => sum + d.performance, 0) / employeeData.length,
      punctuality: employeeData.reduce((sum, d) => sum + d.punctuality, 0) / employeeData.length
    },
    totalBookings: employeeData.reduce((sum, d) => sum + d.bookings, 0)
  }
}

async function generateSummaryAnalytics(startDate: Date, days: number) {
  // Generate summary statistics
  const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)

  // Mock current and previous period data
  const currentPeriod = {
    revenue: 125000,
    appointments: 450,
    customers: 320,
    rating: 4.7
  }

  const previousPeriod = {
    revenue: 112000,
    appointments: 420,
    customers: 300,
    rating: 4.6
  }

  return {
    current: currentPeriod,
    previous: previousPeriod,
    comparisons: {
      revenue: ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue * 100).toFixed(1),
      appointments: ((currentPeriod.appointments - previousPeriod.appointments) / previousPeriod.appointments * 100).toFixed(1),
      customers: ((currentPeriod.customers - previousPeriod.customers) / previousPeriod.customers * 100).toFixed(1),
      rating: (currentPeriod.rating - previousPeriod.rating).toFixed(1)
    }
  }
}

function calculateTrend(data: number[]): { direction: 'up' | 'down' | 'stable', percentage: number } {
  if (data.length < 2) return { direction: 'stable', percentage: 0 }

  const first = data[0]
  const last = data[data.length - 1]
  const change = ((last - first) / first) * 100

  return {
    direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
    percentage: Math.abs(change)
  }
}
