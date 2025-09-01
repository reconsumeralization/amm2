"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { CustomerAnalytics } from "@/components/analytics/customer-analytics"
import { StaffPerformance } from "@/components/analytics/staff-performance"
import { ServiceAnalytics } from "@/components/analytics/service-analytics"
import { AppointmentTrends } from "@/components/analytics/appointment-trends"
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download } from "lucide-react"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"

const kpiData = {
  totalRevenue: { value: 45680, change: 12.5, period: "vs last month" },
  totalCustomers: { value: 1247, change: 8.3, period: "vs last month" },
  avgBookingValue: { value: 67, change: -2.1, period: "vs last month" },
  customerRetention: { value: 89, change: 5.2, period: "vs last month" },
  staffUtilization: { value: 87, change: 3.1, period: "vs last month" },
  appointmentsBooked: { value: 682, change: 15.7, period: "vs last month" },
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [timeframe, setTimeframe] = useState("30d")

  const exportReport = () => {
    // Export functionality would be implemented here
    console.log("Exporting report...")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics & Reporting</h1>
                <p className="text-muted-foreground">Track performance and gain business insights</p>
              </div>
              <div className="flex items-center gap-2">
                <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
                <Select value={timeframe} onValueChange={setTimeframe}>
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
                <Button onClick={exportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${kpiData.totalRevenue.value.toLocaleString()}</div>
                  <p className={`text-xs ${kpiData.totalRevenue.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpiData.totalRevenue.change > 0 ? "+" : ""}
                    {kpiData.totalRevenue.change}% {kpiData.totalRevenue.period}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.totalCustomers.value.toLocaleString()}</div>
                  <p className={`text-xs ${kpiData.totalCustomers.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpiData.totalCustomers.change > 0 ? "+" : ""}
                    {kpiData.totalCustomers.change}% {kpiData.totalCustomers.period}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Booking Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${kpiData.avgBookingValue.value}</div>
                  <p className={`text-xs ${kpiData.avgBookingValue.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpiData.avgBookingValue.change > 0 ? "+" : ""}
                    {kpiData.avgBookingValue.change}% {kpiData.avgBookingValue.period}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Customer Retention</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.customerRetention.value}%</div>
                  <p className={`text-xs ${kpiData.customerRetention.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpiData.customerRetention.change > 0 ? "+" : ""}
                    {kpiData.customerRetention.change}% {kpiData.customerRetention.period}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Staff Utilization</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.staffUtilization.value}%</div>
                  <p className={`text-xs ${kpiData.staffUtilization.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpiData.staffUtilization.change > 0 ? "+" : ""}
                    {kpiData.staffUtilization.change}% {kpiData.staffUtilization.period}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.appointmentsBooked.value}</div>
                  <p className={`text-xs ${kpiData.appointmentsBooked.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpiData.appointmentsBooked.change > 0 ? "+" : ""}
                    {kpiData.appointmentsBooked.change}% {kpiData.appointmentsBooked.period}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Analytics */}
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="staff">Staff Performance</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <RevenueChart timeframe={timeframe} />
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Breakdown</CardTitle>
                      <CardDescription>Revenue by service category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                            <span className="text-sm">Haircuts</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$18,450</div>
                            <div className="text-xs text-muted-foreground">40.4%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                            <span className="text-sm">Beard Services</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$12,340</div>
                            <div className="text-xs text-muted-foreground">27.0%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                            <span className="text-sm">Full Service</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$10,890</div>
                            <div className="text-xs text-muted-foreground">23.8%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-chart-4 rounded-full"></div>
                            <span className="text-sm">Premium Services</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$4,000</div>
                            <div className="text-xs text-muted-foreground">8.8%</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Daily Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$1,522</div>
                      <p className="text-xs text-green-600">+8.2% from last period</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Peak Revenue Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Saturday</div>
                      <p className="text-xs text-muted-foreground">$2,340 average</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Growth Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+12.5%</div>
                      <p className="text-xs text-green-600">Month over month</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="customers" className="space-y-4">
                <CustomerAnalytics timeframe={timeframe} />
              </TabsContent>

              <TabsContent value="staff" className="space-y-4">
                <StaffPerformance timeframe={timeframe} />
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <ServiceAnalytics timeframe={timeframe} />
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <AppointmentTrends timeframe={timeframe} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
