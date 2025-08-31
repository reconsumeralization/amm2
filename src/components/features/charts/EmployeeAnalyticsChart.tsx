'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { motion } from 'framer-motion'

interface EmployeeData {
  date: string
  efficiency: number
  satisfaction: number
  performance: number
  punctuality: number
  bookings: number
}

interface EmployeeAnalyticsChartProps {
  data: EmployeeData[]
  className?: string
}

export function EmployeeAnalyticsChart({ data, className = "" }: EmployeeAnalyticsChartProps) {
  const latestData = data[data.length - 1] || {
    efficiency: 0,
    satisfaction: 0,
    performance: 0,
    punctuality: 0,
    bookings: 0
  }

  const averageEfficiency = data.reduce((sum, item) => sum + item.efficiency, 0) / data.length
  const averageSatisfaction = data.reduce((sum, item) => sum + item.satisfaction, 0) / data.length
  const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0)

  // Radar chart data
  const radarData = [
    { subject: 'Efficiency', A: latestData.efficiency, fullMark: 100 },
    { subject: 'Satisfaction', A: latestData.satisfaction, fullMark: 100 },
    { subject: 'Performance', A: latestData.performance, fullMark: 100 },
    { subject: 'Punctuality', A: latestData.punctuality, fullMark: 100 }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-600'
    if (value >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (value: number) => {
    if (value >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (value >= 80) return { text: 'Good', color: 'bg-blue-100 text-blue-800' }
    if (value >= 70) return { text: 'Average', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Icons.users className="h-5 w-5 text-purple-600" />
                <span>Employee Performance Analytics</span>
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-sm text-gray-600">
                  Total Bookings: {totalBookings.toLocaleString()}
                </div>
                <Badge className={getPerformanceBadge(averageEfficiency).color}>
                  {getPerformanceBadge(averageEfficiency).text}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend Chart */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-center">Performance Trends</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="satisfaction"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Current Performance Radar */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-center">Current Performance</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" fontSize={12} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                    <Radar
                      name="Performance"
                      dataKey="A"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Icons.barChart3 className="h-5 w-5 text-purple-600" />
                <span className={`text-sm font-bold ${getPerformanceColor(latestData.efficiency)}`}>
                  {latestData.efficiency.toFixed(1)}%
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-700">Efficiency</h4>
              <p className="text-xs text-gray-600">Task completion rate</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Icons.info className="h-5 w-5 text-green-600" />
                <span className={`text-sm font-bold ${getPerformanceColor(latestData.satisfaction)}`}>
                  {latestData.satisfaction.toFixed(1)}%
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-700">Satisfaction</h4>
              <p className="text-xs text-gray-600">Client feedback score</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Icons.scissors className="h-5 w-5 text-blue-600" />
                <span className={`text-sm font-bold ${getPerformanceColor(latestData.performance)}`}>
                  {latestData.performance.toFixed(1)}%
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-700">Performance</h4>
              <p className="text-xs text-gray-600">Service quality score</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Icons.clock className="h-5 w-5 text-yellow-600" />
                <span className={`text-sm font-bold ${getPerformanceColor(latestData.punctuality)}`}>
                  {latestData.punctuality.toFixed(1)}%
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-700">Punctuality</h4>
              <p className="text-xs text-gray-600">On-time arrival rate</p>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Performance Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Average Efficiency:</span>
                <span className={`ml-2 font-medium ${getPerformanceColor(averageEfficiency)}`}>
                  {averageEfficiency.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Average Satisfaction:</span>
                <span className={`ml-2 font-medium ${getPerformanceColor(averageSatisfaction)}`}>
                  {averageSatisfaction.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Bookings:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {totalBookings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
