'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { ServicePerformanceChart } from '@/components/charts/ServicePerformanceChart'
import { EmployeeAnalyticsChart } from '@/components/charts/EmployeeAnalyticsChart'
import { motion } from 'framer-motion'

interface DashboardStats {
  totalRevenue: number
  totalAppointments: number
  totalCustomers: number
  averageRating: number
  periodComparison: {
    revenue: number
    appointments: number
    customers: number
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Sample data - In a real app, this would come from your APIs
  const revenueData = [
    { date: '2024-08-01', revenue: 12500, appointments: 45, services: 67 },
    { date: '2024-08-02', revenue: 11800, appointments: 42, services: 63 },
    { date: '2024-08-03', revenue: 13200, appointments: 48, services: 71 },
    { date: '2024-08-04', revenue: 14100, appointments: 52, services: 78 },
    { date: '2024-08-05', revenue: 12800, appointments: 46, services: 69 },
    { date: '2024-08-06', revenue: 13500, appointments: 49, services: 74 },
    { date: '2024-08-07', revenue: 15200, appointments: 55, services: 82 },
    { date: '2024-08-08', revenue: 13800, appointments: 50, services: 75 },
    { date: '2024-08-09', revenue: 14200, appointments: 51, services: 77 },
    { date: '2024-08-10', revenue: 14900, appointments: 54, services: 81 },
    { date: '2024-08-11', revenue: 15600, appointments: 56, services: 84 },
    { date: '2024-08-12', revenue: 14300, appointments: 52, services: 78 },
    { date: '2024-08-13', revenue: 16100, appointments: 58, services: 87 },
    { date: '2024-08-14', revenue: 14700, appointments: 53, services: 80 },
    { date: '2024-08-15', revenue: 15800, appointments: 57, services: 86 }
  ]

  const serviceData = [
    { name: 'Hair Cut & Style', count: 234, revenue: 35100, rating: 4.8, duration: 45 },
    { name: 'Beard Trim & Shape', count: 156, revenue: 15600, rating: 4.7, duration: 25 },
    { name: 'Color Treatment', count: 89, revenue: 26700, rating: 4.6, duration: 120 },
    { name: 'Full Service Package', count: 67, revenue: 40200, rating: 4.9, duration: 90 },
    { name: 'Men\'s Facial', count: 45, revenue: 6750, rating: 4.5, duration: 60 },
    { name: 'Hot Towel Shave', count: 78, revenue: 11700, rating: 4.8, duration: 30 }
  ]

  const employeeData = [
    { date: '2024-08-01', efficiency: 85, satisfaction: 92, performance: 88, punctuality: 95, bookings: 8 },
    { date: '2024-08-02', efficiency: 87, satisfaction: 94, performance: 90, punctuality: 96, bookings: 7 },
    { date: '2024-08-03', efficiency: 89, satisfaction: 91, performance: 87, punctuality: 94, bookings: 9 },
    { date: '2024-08-04', efficiency: 91, satisfaction: 95, performance: 92, punctuality: 97, bookings: 10 },
    { date: '2024-08-05', efficiency: 88, satisfaction: 93, performance: 89, punctuality: 95, bookings: 8 },
    { date: '2024-08-06', efficiency: 90, satisfaction: 96, performance: 91, punctuality: 98, bookings: 9 },
    { date: '2024-08-07', efficiency: 92, satisfaction: 97, performance: 93, punctuality: 99, bookings: 11 },
    { date: '2024-08-08', efficiency: 89, satisfaction: 94, performance: 88, punctuality: 96, bookings: 9 },
    { date: '2024-08-09', efficiency: 91, satisfaction: 95, performance: 90, punctuality: 97, bookings: 10 },
    { date: '2024-08-10', efficiency: 93, satisfaction: 98, performance: 92, punctuality: 98, bookings: 10 }
  ]

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Calculate stats
      const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
      const totalAppointments = revenueData.reduce((sum, item) => sum + item.appointments, 0)
      const totalServices = revenueData.reduce((sum, item) => sum + item.services, 0)

      setStats({
        totalRevenue,
        totalAppointments,
        totalCustomers: Math.floor(totalAppointments * 0.7), // Estimate unique customers
        averageRating: 4.7,
        periodComparison: {
          revenue: 12.5,
          appointments: 8.3,
          customers: 5.2
        }
      })
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      // In a real implementation, this would generate and download the report
      console.log(`Exporting ${format} report for ${timeRange} days`)

      // Simulate export
      setTimeout(() => {
        // Create a simple text export for demo
        const data = `Analytics Report - ${timeRange} Days
Total Revenue: $${stats?.totalRevenue?.toLocaleString()}
Total Appointments: ${stats?.totalAppointments?.toLocaleString()}
Total Customers: ${stats?.totalCustomers?.toLocaleString()}
Average Rating: ${stats?.averageRating}

Generated on: ${new Date().toLocaleDateString()}`

        const blob = new Blob([data], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-report-${timeRange}-days-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 1000)

    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.barChart3 className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Analytics</h2>
          <p className="text-gray-600">Please wait while we load your business insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-amber-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">📊</span>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              </div>
              <span className="text-blue-200">|</span>
              <span className="text-blue-100">Business Intelligence</span>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      +{stats.periodComparison.revenue}% vs previous
                    </p>
                  </div>
                  <Icons.barChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalAppointments.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      +{stats.periodComparison.appointments}% vs previous
                    </p>
                  </div>
                  <Icons.calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customers</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalCustomers.toLocaleString()}
                    </p>
                    <p className="text-xs text-purple-600 font-medium">
                      +{stats.periodComparison.customers}% vs previous
                    </p>
                  </div>
                  <Icons.users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.averageRating} ★
                    </p>
                    <p className="text-xs text-gray-600">
                      Customer satisfaction
                    </p>
                  </div>
                  <Icons.info className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="mb-2"
          >
            <Icons.barChart3 className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'revenue' ? 'default' : 'outline'}
            onClick={() => setActiveTab('revenue')}
            className="mb-2"
          >
            <Icons.barChart3 className="h-4 w-4 mr-2" />
            Revenue
          </Button>
          <Button
            variant={activeTab === 'services' ? 'default' : 'outline'}
            onClick={() => setActiveTab('services')}
            className="mb-2"
          >
            <Icons.scissors className="h-4 w-4 mr-2" />
            Services
          </Button>
          <Button
            variant={activeTab === 'employees' ? 'default' : 'outline'}
            onClick={() => setActiveTab('employees')}
            className="mb-2"
          >
            <Icons.users className="h-4 w-4 mr-2" />
            Employees
          </Button>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportReport('csv')}
              className="mb-2"
            >
              <Icons.download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('pdf')}
              className="mb-2"
            >
              <Icons.info className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <RevenueChart data={revenueData} title="Revenue Overview" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ServicePerformanceChart data={serviceData} />
                <EmployeeAnalyticsChart data={employeeData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'revenue' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RevenueChart data={revenueData} title="Revenue Analysis" />
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ServicePerformanceChart data={serviceData} />
            </motion.div>
          )}

          {activeTab === 'employees' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EmployeeAnalyticsChart data={employeeData} />
            </motion.div>
          )}
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Icons.info className="h-5 w-5 mr-2 text-green-600" />
                Top Performing Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">Full Service Package</div>
              <div className="text-sm text-gray-600 mb-3">Most popular and highest rated service</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue generated</span>
                <span className="font-medium text-green-600">$40,200</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Icons.users className="h-5 w-5 mr-2 text-blue-600" />
                Peak Performance Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">Saturday</div>
              <div className="text-sm text-gray-600 mb-3">Highest appointment volume</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg appointments</span>
                <span className="font-medium text-blue-600">58 per day</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Icons.scissors className="h-5 w-5 mr-2 text-purple-600" />
                Customer Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">4.7★</div>
              <div className="text-sm text-gray-600 mb-3">Average rating across all services</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total reviews</span>
                <span className="font-medium text-purple-600">1,247</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
