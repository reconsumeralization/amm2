'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { motion } from 'framer-motion'

interface ServiceData {
  name: string
  count: number
  revenue: number
  rating: number
  duration: number
}

interface ServicePerformanceChartProps {
  data: ServiceData[]
  className?: string
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

export function ServicePerformanceChart({ data, className = "" }: ServicePerformanceChartProps) {
  const totalServices = data.reduce((sum, item) => sum + item.count, 0)
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const averageRating = data.length > 0 ? data.reduce((sum, item) => sum + item.rating, 0) / data.length : 0

  // Transform data for pie chart
  const pieData = data.map((item, index) => ({
    name: item.name,
    value: item.revenue,
    count: item.count,
    rating: item.rating,
    color: COLORS[index % COLORS.length]
  }))

  // Transform data for bar chart
  const barData = data.map((item, index) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    count: item.count,
    revenue: item.revenue / 100, // Scale for better visualization
    rating: item.rating,
    color: COLORS[index % COLORS.length]
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.fullName || data.name}</p>
          <p className="text-sm text-blue-600">Services: {data.count}</p>
          <p className="text-sm text-green-600">Revenue: ${data.revenue * 100}</p>
          <p className="text-sm text-yellow-600">Rating: {data.rating?.toFixed(1)}★</p>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-green-600">Revenue: ${(data.value / 100).toLocaleString()}</p>
          <p className="text-sm text-blue-600">Services: {data.count}</p>
          <p className="text-sm text-yellow-600">Rating: {data.rating?.toFixed(1)}★</p>
        </div>
      )
    }
    return null
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
                <Icons.scissors className="h-5 w-5 text-blue-600" />
                <span>Service Performance</span>
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-sm text-gray-600">
                  Total Services: {totalServices.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Revenue: ${totalRevenue.toLocaleString()}
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {averageRating.toFixed(1)}★ avg rating
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Distribution Pie Chart */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-center">Revenue by Service</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service Count Bar Chart */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-center">Service Frequency</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      stroke="#6b7280"
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Service Details Table */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-800 mb-3">Service Details</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((service, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {service.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                        ${service.revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-600">
                        {service.rating.toFixed(1)} ★
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {service.duration} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
