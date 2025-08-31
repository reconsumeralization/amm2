'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, DollarSign, Users, Clock, TrendingUp, Activity, RefreshCw } from '@/lib/icon-mapping';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface DashboardStats {
  appointments: number;
  pendingPayments: number;
  users: number;
  revenue: number;
  staffSchedules: number;
  clockIns: number;
}

interface ChartDataPoint {
  date: string;
  count: number;
  revenue?: number;
}

interface DashboardSettings {
  dashboard: {
    enabledWidgets: string[];
    chartType: 'line' | 'bar' | 'area';
    refreshInterval: number;
  };
  stripe: {
    currency: string;
  };
  chatbot?: { enabled?: boolean };
  clock?: { enabled?: boolean };
  googleCalendar?: { enabled?: boolean };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    appointments: 0,
    pendingPayments: 0,
    users: 0,
    revenue: 0,
    staffSchedules: 0,
    clockIns: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [settings, setSettings] = useState<DashboardSettings>({
    dashboard: { enabledWidgets: [], chartType: 'line', refreshInterval: 300 },
    stripe: { currency: 'usd' }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [settingsRes, apptRes, paymentRes, userRes, scheduleRes, clockRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/appointments?where[status][equals]=confirmed'),
        fetch('/api/stripe-payments?where[status][equals]=paid'),
        fetch('/api/users'),
        fetch('/api/staff-schedules?where[available][equals]=true'),
        fetch('/api/clock-records?where[action][equals]=clock-in'),
      ]);

      // Check for API errors
      if (!settingsRes.ok || !apptRes.ok || !paymentRes.ok || !userRes.ok || !scheduleRes.ok || !clockRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const settingsData = await settingsRes.json();
      const appointments = await apptRes.json();
      const payments = await paymentRes.json();
      const users = await userRes.json();
      const schedules = await scheduleRes.json();
      const clockIns = await clockRes.json();

      const revenue = payments.docs?.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) / 100 || 0;
      
      // Fetch analytics data
      const analyticsRes = await fetch('/api/admin/analytics/appointments');
      const analytics = analyticsRes.ok ? await analyticsRes.json() : [];
      
      setChartData(Array.isArray(analytics) ? analytics : []);
      setSettings({
        ...settingsData,
        dashboard: settingsData.dashboard || { enabledWidgets: [], chartType: 'line', refreshInterval: 300 },
        stripe: settingsData.stripe || { currency: 'usd' }
      });

      setStats({
        appointments: appointments.totalDocs || 0,
        pendingPayments: payments.totalDocs || 0,
        users: users.totalDocs || 0,
        revenue,
        staffSchedules: schedules.totalDocs || 0,
        clockIns: clockIns.totalDocs || 0,
      });

      if (isRefresh) {
        toast.success('Dashboard data refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isLoading && settings.dashboard.refreshInterval > 0) {
      const interval = setInterval(() => fetchData(true), settings.dashboard.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, settings.dashboard.refreshInterval, isLoading]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const ChartComponent = settings.dashboard.chartType === 'bar' ? BarChart : settings.dashboard.chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = settings.dashboard.chartType === 'bar' ? Bar : settings.dashboard.chartType === 'area' ? Area : Line;

  const statsCards = [
    {
      id: 'appointments',
      title: 'Total Appointments',
      value: stats.appointments,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/collections/appointments'
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `${settings.stripe.currency.toUpperCase()} ${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/collections/stripe-payments'
    },
    {
      id: 'users',
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/admin/collections/users'
    },
    {
      id: 'clock',
      title: 'Staff Clock-Ins',
      value: stats.clockIns,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/admin/collections/clock-records'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-2">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your BarberShop's performance and manage operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => router.push('/admin/analytics')}
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(card.href)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Settings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Overview of key system features and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Chatbot</span>
              <Badge variant={settings.chatbot?.enabled ? 'default' : 'secondary'}>
                {settings.chatbot?.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Clock System</span>
              <Badge variant={settings.clock?.enabled ? 'default' : 'secondary'}>
                {settings.clock?.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Calendar Sync</span>
              <Badge variant={settings.googleCalendar?.enabled ? 'default' : 'secondary'}>
                {settings.googleCalendar?.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => router.push('/admin/collections/settings')}
              variant="outline"
            >
              Manage Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>
              Track appointment patterns and business growth over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ChartComponent data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <DataComponent 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    fill={settings.dashboard.chartType === 'area' ? '#3b82f6' : undefined}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </ChartComponent>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI-Powered Features
          </CardTitle>
          <CardDescription>
            Leverage artificial intelligence to optimize your BarberShop operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/integrations/openai/schedule-suggestions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        collection: 'staff-schedules', 
                        tenantId: 'tenant-id-placeholder', 
                        preferences: { duration: 60 } 
                      }),
                    });
                    const { times } = await res.json();
                    if (times?.length) {
                      toast.success(`AI suggested times: ${times.join(', ')}`);
                    } else {
                      toast.info('No AI schedule suggestions available at this time');
                    }
                  } catch (error) {
                    toast.error('Failed to generate AI schedule suggestions');
                  }
                }}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Activity className="h-4 w-4 mr-2" />
                Generate Schedule Suggestions
              </Button>
              <Button
                onClick={() => router.push('/admin/ai-insights')}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View AI Insights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
