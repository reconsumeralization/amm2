'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Star,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  Filter
} from "lucide-react";
import { motion } from 'framer-motion';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: Array<{ month: string; amount: number; growth: number }>;
    byService: Array<{ service: string; revenue: number; percentage: number }>;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    averageDuration: number;
    byDayOfWeek: Array<{ day: string; count: number }>;
    byTimeOfDay: Array<{ hour: string; count: number }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    averageLifetimeValue: number;
    retentionRate: number;
    topCustomers: Array<{ name: string; visits: number; spent: number }>;
  };
  services: {
    totalServices: number;
    popularServices: Array<{ service: string; bookings: number; revenue: number }>;
    performance: Array<{ service: string; rating: number; completionRate: number }>;
  };
  staff: {
    totalStaff: number;
    activeStaff: number;
    averageRating: number;
    performance: Array<{ staff: string; appointments: number; rating: number; revenue: number }>;
  };
}

interface AnalyticsDashboardProps {
  dateRange?: '7d' | '30d' | '90d' | '1y';
  refreshInterval?: number;
}

export default function AnalyticsDashboard({
  dateRange = '30d',
  refreshInterval = 300000 // 5 minutes
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(dateRange);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data generation
  const generateMockData = (): AnalyticsData => ({
    revenue: {
      total: 45678.90,
      monthly: [
        { month: 'Jan', amount: 3500, growth: 12.5 },
        { month: 'Feb', amount: 4200, growth: 20.0 },
        { month: 'Mar', amount: 3800, growth: -9.5 },
        { month: 'Apr', amount: 5100, growth: 34.2 },
        { month: 'May', amount: 4800, growth: -5.9 },
        { month: 'Jun', amount: 6200, growth: 29.2 }
      ],
      byService: [
        { service: 'Haircut', revenue: 18500, percentage: 40.5 },
        { service: 'Hair Color', revenue: 12400, percentage: 27.1 },
        { service: 'Styling', revenue: 8900, percentage: 19.5 },
        { service: 'Treatment', revenue: 5878, percentage: 12.9 }
      ]
    },
    appointments: {
      total: 245,
      completed: 220,
      cancelled: 15,
      noShow: 10,
      averageDuration: 65,
      byDayOfWeek: [
        { day: 'Mon', count: 35 },
        { day: 'Tue', count: 42 },
        { day: 'Wed', count: 38 },
        { day: 'Thu', count: 45 },
        { day: 'Fri', count: 52 },
        { day: 'Sat', count: 33 }
      ],
      byTimeOfDay: [
        { hour: '9:00', count: 8 },
        { hour: '10:00', count: 12 },
        { hour: '11:00', count: 15 },
        { hour: '12:00', count: 18 },
        { hour: '13:00', count: 22 },
        { hour: '14:00', count: 25 },
        { hour: '15:00', count: 20 },
        { hour: '16:00', count: 16 },
        { hour: '17:00', count: 12 }
      ]
    },
    customers: {
      total: 189,
      new: 23,
      returning: 166,
      averageLifetimeValue: 285.50,
      retentionRate: 87.8,
      topCustomers: [
        { name: 'Sarah Johnson', visits: 15, spent: 1275.00 },
        { name: 'Mike Chen', visits: 12, spent: 960.00 },
        { name: 'Emily Davis', visits: 10, spent: 850.00 },
        { name: 'John Smith', visits: 8, spent: 640.00 },
        { name: 'Lisa Brown', visits: 9, spent: 720.00 }
      ]
    },
    services: {
      totalServices: 12,
      popularServices: [
        { service: 'Classic Haircut', bookings: 89, revenue: 4450 },
        { service: 'Hair Coloring', bookings: 67, revenue: 10050 },
        { service: 'Styling', bookings: 54, revenue: 2700 },
        { service: 'Treatment', bookings: 35, revenue: 1750 }
      ],
      performance: [
        { service: 'Classic Haircut', rating: 4.8, completionRate: 98 },
        { service: 'Hair Coloring', rating: 4.6, completionRate: 95 },
        { service: 'Styling', rating: 4.7, completionRate: 97 },
        { service: 'Treatment', rating: 4.9, completionRate: 99 }
      ]
    },
    staff: {
      totalStaff: 8,
      activeStaff: 7,
      averageRating: 4.7,
      performance: [
        { staff: 'Maria Garcia', appointments: 45, rating: 4.9, revenue: 2250 },
        { staff: 'David Wilson', appointments: 42, rating: 4.8, revenue: 2100 },
        { staff: 'Lisa Chen', appointments: 38, rating: 4.7, revenue: 1900 },
        { staff: 'James Brown', appointments: 35, rating: 4.6, revenue: 1750 }
      ]
    }
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch from your API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = generateMockData();
        setData(mockData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data) {
        setIsRefreshing(true);
        // Simulate refresh
        setTimeout(() => {
          const updatedData = generateMockData();
          setData(updatedData);
          setIsRefreshing(false);
        }, 1000);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [data, refreshInterval]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const updatedData = generateMockData();
      setData(updatedData);
      setIsRefreshing(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const kpiCards = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(data.revenue.total),
        change: '+12.5%',
        changeType: 'positive' as const,
        icon: DollarSign,
        color: 'text-green-600'
      },
      {
        title: 'Total Appointments',
        value: formatNumber(data.appointments.total),
        change: '+8.2%',
        changeType: 'positive' as const,
        icon: Calendar,
        color: 'text-blue-600'
      },
      {
        title: 'Active Customers',
        value: formatNumber(data.customers.total),
        change: '+15.3%',
        changeType: 'positive' as const,
        icon: Users,
        color: 'text-purple-600'
      },
      {
        title: 'Average Rating',
        value: data.staff.averageRating.toFixed(1),
        change: '+0.2',
        changeType: 'positive' as const,
        icon: Star,
        color: 'text-yellow-600'
      },
      {
        title: 'Completion Rate',
        value: formatPercentage((data.appointments.completed / data.appointments.total) * 100),
        change: '+2.1%',
        changeType: 'positive' as const,
        icon: Target,
        color: 'text-emerald-600'
      },
      {
        title: 'Avg. Service Time',
        value: `${data.appointments.averageDuration}min`,
        change: '-3min',
        changeType: 'positive' as const,
        icon: Clock,
        color: 'text-orange-600'
      }
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Unable to load analytics data at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
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
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <IconComponent className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className={`flex items-center text-xs ${
                    kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.changeType === 'positive' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {kpi.change}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={data.revenue.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="amount" fill="#3b82f6" />
                      </BarChart>
                    ) : chartType === 'area' ? (
                      <AreaChart data={data.revenue.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      </AreaChart>
                    ) : (
                      <LineChart data={data.revenue.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: data.appointments.completed, fill: '#10b981' },
                          { name: 'Cancelled', value: data.appointments.cancelled, fill: '#ef4444' },
                          { name: 'No Show', value: data.appointments.noShow, fill: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Completed', value: data.appointments.completed, fill: '#10b981' },
                          { name: 'Cancelled', value: data.appointments.cancelled, fill: '#ef4444' },
                          { name: 'No Show', value: data.appointments.noShow, fill: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue by Service */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenue.byService.map((service, index) => (
                    <div key={service.service} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{service.service}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrency(service.revenue)}</div>
                        <div className="text-xs text-gray-500">{service.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.revenue.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="amount" />
                      <YAxis yAxisId="growth" orientation="right" />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'growth' ? `${value}%` : formatCurrency(value as number),
                          name === 'growth' ? 'Growth' : 'Revenue'
                        ]}
                      />
                      <Bar yAxisId="amount" dataKey="amount" fill="#3b82f6" />
                      <Line yAxisId="growth" type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Appointments by Day */}
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.appointments.byDayOfWeek}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Appointments by Time */}
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.appointments.byTimeOfDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.customers.topCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.visits} visits</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">{formatCurrency(customer.spent)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Customers</span>
                    <span className="text-lg font-semibold">{formatNumber(data.customers.total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New This Period</span>
                    <span className="text-lg font-semibold text-green-600">+{data.customers.new}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <span className="text-lg font-semibold">{formatPercentage(data.customers.retentionRate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Lifetime Value</span>
                    <span className="text-lg font-semibold">{formatCurrency(data.customers.averageLifetimeValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Staff Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.staff.performance.map((staff, index) => (
                    <div key={staff.staff} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                          {staff.staff.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{staff.staff}</div>
                          <div className="text-xs text-gray-500">{staff.appointments} appointments</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrency(staff.revenue)}</div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {staff.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Staff Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Staff</span>
                    <span className="text-lg font-semibold">{data.staff.totalStaff}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Staff</span>
                    <span className="text-lg font-semibold text-green-600">{data.staff.activeStaff}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <span className="text-lg font-semibold">{data.staff.averageRating.toFixed(1)} ⭐</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Utilization Rate</span>
                    <span className="text-lg font-semibold">{formatPercentage(87.5)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
