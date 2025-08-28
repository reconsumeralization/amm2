import React, { useState, useEffect } from 'react'
import { Card, Heading, Text, Button, Select, Table } from '@payloadcms/ui'

interface ReportData {
  totalRevenue: number
  totalAppointments: number
  averageTicket: number
  topServices: Array<{
    name: string
    revenue: number
    count: number
  }>
  stylistPerformance: Array<{
    name: string
    revenue: number
    appointments: number
    rating: number
  }>
  customerRetention: {
    newCustomers: number
    returningCustomers: number
    retentionRate: number
  }
  inventoryStatus: {
    lowStockItems: number
    outOfStockItems: number
    totalValue: number
  }
}

interface BusinessReportsProps {
  dateRange: {
    start: Date
    end: Date
  }
}

export const BusinessReports: React.FC<BusinessReportsProps> = ({ dateRange }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [reportType, setReportType] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - in real implementation, this would fetch from API
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setReportData({
        totalRevenue: 452500, // $4,525.00
        totalAppointments: 156,
        averageTicket: 2901, // $29.01
        topServices: [
          { name: 'Men\'s Haircut', revenue: 156000, count: 78 },
          { name: 'Beard Trim', revenue: 78000, count: 52 },
          { name: 'Hair Color', revenue: 117000, count: 26 },
          { name: 'Complete Style', revenue: 101500, count: 29 }
        ],
        stylistPerformance: [
          { name: 'Emma Davis', revenue: 142500, appointments: 48, rating: 4.8 },
          { name: 'David Wilson', revenue: 128000, appointments: 42, rating: 4.6 },
          { name: 'Sarah Johnson', revenue: 182000, appointments: 66, rating: 4.9 }
        ],
        customerRetention: {
          newCustomers: 23,
          returningCustomers: 133,
          retentionRate: 85.3
        },
        inventoryStatus: {
          lowStockItems: 5,
          outOfStockItems: 2,
          totalValue: 12500 // $125.00
        }
      })
      setIsLoading(false)
    }, 1000)
  }, [dateRange, reportType])

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text className="text-gray-600">Generating report...</Text>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <Card className="p-6 text-center">
        <Text className="text-gray-500">No data available for the selected period</Text>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex justify-between items-center">
        <Heading className="text-2xl font-bold text-gray-900">Business Reports</Heading>
        <div className="flex space-x-3">
          <Select
            value={reportType}
            onChange={(value) => setReportType(value)}
            options={[
              { label: 'Overview', value: 'overview' },
              { label: 'Revenue', value: 'revenue' },
              { label: 'Services', value: 'services' },
              { label: 'Staff Performance', value: 'staff' },
              { label: 'Customer Analytics', value: 'customers' },
              { label: 'Inventory', value: 'inventory' }
            ]}
          />
          <Button variant="primary">Export PDF</Button>
          <Button variant="secondary">Export Excel</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">Total Revenue</Text>
              <Heading className="text-2xl font-bold text-gray-900">
                {formatCurrency(reportData.totalRevenue)}
              </Heading>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">Total Appointments</Text>
              <Heading className="text-2xl font-bold text-gray-900">
                {reportData.totalAppointments}
              </Heading>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">Average Ticket</Text>
              <Heading className="text-2xl font-bold text-gray-900">
                {formatCurrency(reportData.averageTicket)}
              </Heading>
            </div>
            <div className="text-3xl">🎫</div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">Customer Retention</Text>
              <Heading className="text-2xl font-bold text-gray-900">
                {formatPercentage(reportData.customerRetention.retentionRate)}
              </Heading>
            </div>
            <div className="text-3xl">🔄</div>
          </div>
        </Card>
      </div>

      {/* Report Content Based on Type */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Heading className="text-lg font-semibold text-gray-900 mb-4">Top Services</Heading>
            <div className="space-y-3">
              {reportData.topServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <Text className="font-medium text-gray-900">{service.name}</Text>
                    <Text className="text-sm text-gray-500">{service.count} appointments</Text>
                  </div>
                  <Text className="font-semibold text-gray-900">
                    {formatCurrency(service.revenue)}
                  </Text>
                </div>
              ))}
            </div>
          </Card>

          {/* Stylist Performance */}
          <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Heading className="text-lg font-semibold text-gray-900 mb-4">Stylist Performance</Heading>
            <div className="space-y-3">
              {reportData.stylistPerformance.map((stylist, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <Text className="font-medium text-gray-900">{stylist.name}</Text>
                    <Text className="text-sm text-gray-500">
                      {stylist.appointments} appts • ⭐ {stylist.rating}
                    </Text>
                  </div>
                  <Text className="font-semibold text-gray-900">
                    {formatCurrency(stylist.revenue)}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {reportType === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Heading className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition</Heading>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text className="text-gray-600">New Customers</Text>
                <Text className="font-semibold">{reportData.customerRetention.newCustomers}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-600">Returning Customers</Text>
                <Text className="font-semibold">{reportData.customerRetention.returningCustomers}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-600">Retention Rate</Text>
                <Text className="font-semibold">{formatPercentage(reportData.customerRetention.retentionRate)}</Text>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Heading className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</Heading>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text className="text-gray-600">Average Visit Frequency</Text>
                <Text className="font-semibold">2.3 visits/month</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-600">Preferred Days</Text>
                <Text className="font-semibold">Tuesday, Thursday</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-600">Peak Hours</Text>
                <Text className="font-semibold">10 AM - 2 PM</Text>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Heading className="text-lg font-semibold text-gray-900 mb-4">Loyalty Program</Heading>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text className="text-gray-600">Active Members</Text>
                <Text className="font-semibold">142</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-600">Points Redeemed</Text>
                <Text className="font-semibold">3,456</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-600">Average Tier</Text>
                <Text className="font-semibold">Silver</Text>
              </div>
            </div>
          </Card>
        </div>
      )}

      {reportType === 'inventory' && (
        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <Heading className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</Heading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{reportData.inventoryStatus.lowStockItems}</div>
              <Text className="text-gray-600">Low Stock Items</Text>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-800">{reportData.inventoryStatus.outOfStockItems}</div>
              <Text className="text-gray-600">Out of Stock Items</Text>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{formatCurrency(reportData.inventoryStatus.totalValue)}</div>
              <Text className="text-gray-600">Total Inventory Value</Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
