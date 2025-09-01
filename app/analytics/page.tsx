"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Star,
  Download,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle
} from "@/lib/icon-mapping"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from "@/lib/utils"
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"

interface RevenueData {
  date: string
  revenue: number
  appointments: number
  products: number
}

interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  averageSpend: number
  lifetimeValue: number
}

interface ServiceAnalytics {
  serviceName: string
  bookings: number
  revenue: number
  averagePrice: number
  popularity: number
}

interface StaffPerformance {
  staffName: string
  appointments: number
  revenue: number
  rating: number
  efficiency: number
}

interface InventoryMetrics {
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  inventoryValue: number
  turnoverRate: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics>({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    averageSpend: 0,
    lifetimeValue: 0
  })
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics[]>([])
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([])
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics>({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    inventoryValue: 0,
    turnoverRate: 0
  })

  // Mock data
  useEffect(() => {
    // Generate revenue data for the last 30 days
    const generateRevenueData = () => {
      const data: RevenueData[] = []
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i)
        data.push({
          date: format(date, 'yyyy-MM-dd'),
          revenue: Math.floor(Math.random() * 1000) + 500,
          appointments: Math.floor(Math.random() * 15) + 5,
          products: Math.floor(Math.random() * 200) + 100
        })
      }
      return data
    }

    setRevenueData(generateRevenueData())

    setCustomerMetrics({
      totalCustomers: 1250,
      newCustomers: 45,
      returningCustomers: 1205,
      averageSpend: 65.50,
      lifetimeValue: 890.25
    })

    setServiceAnalytics([
      { serviceName: 'Haircut', bookings: 245, revenue: 17150, averagePrice: 70, popularity: 35 },
      { serviceName: 'Beard Trim', bookings: 189, revenue: 7560, averagePrice: 40, popularity: 27 },
      { serviceName: 'Haircut & Beard', bookings: 156, revenue: 15600, averagePrice: 100, popularity: 22 },
      { serviceName: 'Premium Shave', bookings: 98, revenue: 6860, averagePrice: 70, popularity: 14 },
      { serviceName: 'Hair Coloring', bookings: 45, revenue: 9000, averagePrice: 200, popularity: 6 }
    ])

    setStaffPerformance([
      { staffName: 'Mike Johnson', appointments: 89, revenue: 6230, rating: 4.8, efficiency: 92 },
      { staffName: 'Sarah Davis', appointments: 76, revenue: 5320, rating: 4.9, efficiency: 88 },
      { staffName: 'Alex Rodriguez', appointments: 65, revenue: 3900, rating: 4.7, efficiency: 85 },
      { staffName: 'Emma Wilson', appointments: 52, revenue: 3120, rating: 4.6, efficiency: 90 }
    ])

    setInventoryMetrics({
      totalProducts: 85,
      lowStockItems: 12,
      outOfStockItems: 3,
      inventoryValue: 15420,
      turnoverRate: 4.2
    })
  }, [timeRange])

  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0)
  const totalAppointments = revenueData.reduce((sum, day) => sum + day.appointments, 0)
  const totalProductSales = revenueData.reduce((sum, day) => sum + day.products, 0)
  const averageDailyRevenue = totalRevenue / revenueData.length

  const exportReport = () => {
    // Mock export functionality
    alert('Report exported successfully!')
  }

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={refreshData} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Daily Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageDailyRevenue.toFixed(0)}</div>
              <p className="text-xs text-gray-600">
                Per day average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.2 from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="staff">Staff Performance</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Trend Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Services</CardTitle>
                  <CardDescription>Most popular services by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceAnalytics.slice(0, 5).map((service, index) => (
                      <div key={service.serviceName} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{service.serviceName}</p>
                            <p className="text-sm text-gray-600">{service.bookings} bookings</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${service.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{service.popularity}% of total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Insights */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Customers</span>
                    <span className="font-medium">{customerMetrics.totalCustomers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New This Month</span>
                    <span className="font-medium text-green-600">+{customerMetrics.newCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returning</span>
                    <span className="font-medium">{customerMetrics.returningCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Spend</span>
                    <span className="font-medium">${customerMetrics.averageSpend}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {staffPerformance.slice(0, 3).map((staff) => (
                    <div key={staff.staffName} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{staff.staffName}</p>
                        <p className="text-xs text-gray-600">{staff.appointments} appointments</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${staff.revenue}</p>
                        <div className="flex items-center text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {staff.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Products</span>
                    <span className="font-medium">{inventoryMetrics.totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low Stock</span>
                    <span className="font-medium text-orange-600">{inventoryMetrics.lowStockItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Out of Stock</span>
                    <span className="font-medium text-red-600">{inventoryMetrics.outOfStockItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inventory Value</span>
                    <span className="font-medium">${inventoryMetrics.inventoryValue.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Services vs Products revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Service Revenue</span>
                      <span className="font-medium">${(totalRevenue - totalProductSales).toLocaleString()}</span>
                    </div>
                    <Progress value={((totalRevenue - totalProductSales) / totalRevenue) * 100} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>Product Sales</span>
                      <span className="font-medium">${totalProductSales.toLocaleString()}</span>
                    </div>
                    <Progress value={(totalProductSales / totalRevenue) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Day</CardTitle>
                  <CardDescription>Last 7 days performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueData.slice(-7).map((day) => (
                      <div key={day.date} className="flex justify-between items-center">
                        <span className="text-sm">{format(new Date(day.date), 'MMM dd')}</span>
                        <span className="font-medium">${day.revenue}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Acquisition</CardTitle>
                  <CardDescription>New vs returning customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>New Customers</span>
                      <span className="font-medium text-green-600">{customerMetrics.newCustomers}</span>
                    </div>
                    <Progress value={(customerMetrics.newCustomers / customerMetrics.totalCustomers) * 100} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>Returning Customers</span>
                      <span className="font-medium">{customerMetrics.returningCustomers}</span>
                    </div>
                    <Progress value={(customerMetrics.returningCustomers / customerMetrics.totalCustomers) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Value</CardTitle>
                  <CardDescription>Average spend and lifetime value</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      ${customerMetrics.averageSpend}
                    </div>
                    <p className="text-sm text-gray-600">Average transaction value</p>
                  </div>
                  <div className="text-center pt-4">
                    <div className="text-3xl font-bold text-green-600">
                      ${customerMetrics.lifetimeValue}
                    </div>
                    <p className="text-sm text-gray-600">Customer lifetime value</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Revenue and popularity by service</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg Price</TableHead>
                      <TableHead>Popularity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceAnalytics.map((service) => (
                      <TableRow key={service.serviceName}>
                        <TableCell className="font-medium">{service.serviceName}</TableCell>
                        <TableCell>{service.bookings}</TableCell>
                        <TableCell>${service.revenue.toLocaleString()}</TableCell>
                        <TableCell>${service.averagePrice}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={service.popularity} className="w-16 h-2" />
                            <span className="text-sm">{service.popularity}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance Metrics</CardTitle>
                <CardDescription>Appointments, revenue, and customer satisfaction by staff member</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Efficiency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffPerformance.map((staff) => (
                      <TableRow key={staff.staffName}>
                        <TableCell className="font-medium">{staff.staffName}</TableCell>
                        <TableCell>{staff.appointments}</TableCell>
                        <TableCell>${staff.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {staff.rating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={staff.efficiency} className="w-16 h-2" />
                            <span className="text-sm">{staff.efficiency}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Overview</CardTitle>
                  <CardDescription>Stock levels and inventory health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Products</span>
                    <span className="font-medium">{inventoryMetrics.totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Stock Items</span>
                    <span className="font-medium text-orange-600">{inventoryMetrics.lowStockItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Out of Stock</span>
                    <span className="font-medium text-red-600">{inventoryMetrics.outOfStockItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory Value</span>
                    <span className="font-medium">${inventoryMetrics.inventoryValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turnover Rate</span>
                    <span className="font-medium">{inventoryMetrics.turnoverRate}x</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Alerts</CardTitle>
                  <CardDescription>Items requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Low Stock Alert</p>
                        <p className="text-sm text-gray-600">12 items below minimum stock level</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Out of Stock</p>
                        <p className="text-sm text-gray-600">3 items completely out of stock</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Well Stocked</p>
                        <p className="text-sm text-gray-600">70 items at optimal levels</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}