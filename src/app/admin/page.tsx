'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi } from '@/lib/admin-api';
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw,
  Settings,
  Database,
  FileText,
  Shield,
  Clock,
  Star,
  Target,
  Zap,
  Eye,
  UserCheck,
  CalendarDays,
  CreditCard
} from '@/lib/icon-mapping';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface DashboardStats {
  totalPageViews: number;
  activeUsers: number;
  totalRevenue: number;
  pendingAppointments: number;
  todayAppointments: number;
  newCustomers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  badge?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPageViews: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    newCustomers: 0,
    systemHealth: 'healthy',
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const quickActions: QuickAction[] = [
    {
      title: 'Content Manager',
      description: 'Create and edit website content',
      icon: FileText,
      href: '/admin/content',
      color: 'bg-blue-500',
      badge: 'New'
    },
    {
      title: 'Page Builder',
      description: 'Build pages with drag & drop',
      icon: Zap,
      href: '/admin/page-builder',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View business insights',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-green-500'
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: Users,
      href: '/admin/users',
      color: 'bg-orange-500'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-pink-500'
    },
    {
      title: 'Backups',
      description: 'Manage system backups',
      icon: Database,
      href: '/admin/backups',
      color: 'bg-indigo-500'
    },
    {
      title: 'Appointments',
      description: 'View and manage bookings',
      icon: Calendar,
      href: '/admin/collections/appointments',
      color: 'bg-cyan-500'
    },
    {
      title: 'Staff',
      description: 'Manage staff and schedules',
      icon: Clock,
      href: '/admin/collections/stylists',
      color: 'bg-emerald-500'
    }
  ];

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Fetch data using centralized API client
      const [pageViewsRes, usersRes, revenueRes, appointmentsRes, customersRes] = await Promise.all([
        adminApi.getPageViews({ dateRange: selectedPeriod }),
        adminApi.getUserAnalytics({ dateRange: selectedPeriod }),
        adminApi.getRevenueAnalytics({ dateRange: selectedPeriod }),
        adminApi.getAppointmentAnalytics({ dateRange: selectedPeriod }),
        adminApi.getCustomerAnalytics({ dateRange: selectedPeriod })
      ]);

      if (!pageViewsRes.success || !usersRes.success || !revenueRes.success ||
          !appointmentsRes.success || !customersRes.success) {
        throw new Error('Failed to fetch dashboard data');
      }

      const pageViewsData = pageViewsRes.data as any || { total: 0 };
      const usersData = usersRes.data as any || { active: 0 };
      const revenueData = revenueRes.data as any || { total: 0 };
      const appointmentsData = appointmentsRes.data as any || { pending: 0, today: 0 };
      const customersData = customersRes.data as any || { new: 0 };

      setStats({
        totalPageViews: pageViewsData.total || 0,
        activeUsers: usersData.active || 0,
        totalRevenue: revenueData.total || 0,
        pendingAppointments: appointmentsData.pending || 0,
        todayAppointments: appointmentsData.today || 0,
        newCustomers: customersData.new || 0,
        systemHealth: 'healthy',
        lastUpdated: new Date().toISOString()
      });

      if (isRefresh) {
        toast.success('Dashboard data refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
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

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your Modern Men admin panel. Monitor your business performance and manage operations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getSystemHealthColor(stats.systemHealth)}>
            System {stats.systemHealth}
          </Badge>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalPageViews)}</div>
              <p className="text-xs text-muted-foreground">+12.5% from last week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.activeUsers)}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingAppointments} pending
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Services</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Gateway</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-xs text-gray-500">
                      {new Date(stats.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg. Response Time</span>
                    <span className="text-sm font-semibold">245ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-semibold text-green-600">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <span className="text-sm font-semibold">{stats.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Server Load</span>
                    <span className="text-sm font-semibold">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => router.push(action.href)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recent-activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New appointment booked</p>
                    <p className="text-xs text-gray-500">John Doe - Haircut - 2:00 PM</p>
                  </div>
                  <span className="text-xs text-gray-500">5 min ago</span>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New customer registered</p>
                    <p className="text-xs text-gray-500">Jane Smith joined the platform</p>
                  </div>
                  <span className="text-xs text-gray-500">15 min ago</span>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-gray-500">$85.00 for haircut service</p>
                  </div>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Service completed</p>
                    <p className="text-xs text-gray-500">Mike Johnson - Excellent service</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
