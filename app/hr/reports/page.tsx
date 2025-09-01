'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  FileText,
  Download,
  Calendar,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface ReportData {
  employeeStats: {
    totalEmployees: number
    activeEmployees: number
    newHires: number
    terminations: number
  }
  timeStats: {
    totalHoursWorked: number
    averageHoursPerEmployee: number
    overtimeHours: number
    punctualityRate: number
  }
  payrollStats: {
    totalPayroll: number
    averageSalary: number
    totalDeductions: number
    netPayroll: number
  }
  scheduleStats: {
    totalShifts: number
    filledShifts: number
    openShifts: number
    scheduleAdherence: number
  }
}

interface ChartData {
  name: string
  value: number
  color?: string
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [timeRange, setTimeRange] = useState('last-30-days')
  const [reportType, setReportType] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadReportData()
  }, [timeRange, reportType])

  const loadReportData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/hr/reports?timeRange=${timeRange}&type=${reportType}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.reportData)

        // Generate chart data based on report type
        setChartData(generateChartData(data.reportData, reportType))
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load report data',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to load report data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateChartData = (data: ReportData, type: string): ChartData[] => {
    switch (type) {
      case 'payroll':
        return [
          { name: 'Gross Pay', value: data.payrollStats.totalPayroll, color: '#3b82f6' },
          { name: 'Deductions', value: data.payrollStats.totalDeductions, color: '#ef4444' },
          { name: 'Net Pay', value: data.payrollStats.netPayroll, color: '#10b981' },
        ]
      case 'time':
        return [
          { name: 'Regular Hours', value: data.timeStats.totalHoursWorked - data.timeStats.overtimeHours, color: '#3b82f6' },
          { name: 'Overtime Hours', value: data.timeStats.overtimeHours, color: '#f59e0b' },
        ]
      case 'employees':
        return [
          { name: 'Active', value: data.employeeStats.activeEmployees, color: '#10b981' },
          { name: 'New Hires', value: data.employeeStats.newHires, color: '#3b82f6' },
          { name: 'Terminations', value: data.employeeStats.terminations, color: '#ef4444' },
        ]
      default:
        return [
          { name: 'Employees', value: data.employeeStats.totalEmployees, color: '#3b82f6' },
          { name: 'Hours Worked', value: data.timeStats.totalHoursWorked, color: '#10b981' },
          { name: 'Total Payroll', value: data.payrollStats.totalPayroll, color: '#f59e0b' },
        ]
    }
  }

  const handleExportReport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/hr/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeRange,
          reportType,
          format: 'pdf', // or 'excel', 'csv'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `hr-report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: 'Success',
          description: 'Report exported successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to export report',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-8">Loading report data...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HR Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive reporting on employee performance, payroll, and business metrics
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="timeRange">Time Range</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="reportType">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="employees">Employee Stats</SelectItem>
              <SelectItem value="time">Time Tracking</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
              <SelectItem value="schedules">Schedule Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={handleExportReport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {reportData && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.employeeStats.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">
                    {reportData.employeeStats.activeEmployees} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.timeStats.totalHoursWorked.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    {reportData.timeStats.averageHoursPerEmployee.toFixed(1)} avg per employee
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(reportData.payrollStats.totalPayroll)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(reportData.payrollStats.averageSalary)} average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Schedule Adherence</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(reportData.scheduleStats.scheduleAdherence)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reportData.scheduleStats.filledShifts} of {reportData.scheduleStats.totalShifts} shifts filled
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Distribution</CardTitle>
                  <CardDescription>Employees by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Key metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Turnover</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatPercentage(reportData.employeeStats.terminations / reportData.employeeStats.totalEmployees)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reportData.employeeStats.terminations} terminations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Hires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {reportData.employeeStats.newHires}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {reportData.employeeStats.activeEmployees}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Currently employed
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {reportData.timeStats.totalHoursWorked.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hours worked this period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overtime Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {reportData.timeStats.overtimeHours.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hours over 8 per day
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Punctuality Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatPercentage(reportData.timeStats.punctualityRate)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    On-time clock-ins
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gross Payroll</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrency(reportData.payrollStats.totalPayroll)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total wages before deductions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrency(reportData.payrollStats.totalDeductions)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Taxes and other deductions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Net Payroll</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrency(reportData.payrollStats.netPayroll)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Take-home pay
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {reportData.scheduleStats.totalShifts}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scheduled shifts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Filled Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {reportData.scheduleStats.filledShifts}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Shifts with assigned staff
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule Adherence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatPercentage(reportData.scheduleStats.scheduleAdherence)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Shifts completed as scheduled
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
