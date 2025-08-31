'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package as DollarSign, Calendar, FileText, AlertTriangle as AlertCircle } from '@/lib/icon-mapping';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AnalyticsStats {
  revenue: number;
  bookings: number;
  contentCount: number;
  revenueGrowth?: number;
  bookingGrowth?: number;
}

export default function AnalyticsWidget() {
  const [stats, setStats] = useState<AnalyticsStats>({
    revenue: 0,
    bookings: 0,
    contentCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date ranges for current period (last 30 days) and previous period (30 days before that)
      const now = new Date();
      const currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
      const previousPeriodEnd = currentPeriodStart;

      // Format dates for API queries
      const formatDate = (date: Date) => date.toISOString();
      
      const currentPeriodQuery = `where[createdAt][greater_than_equal]=${formatDate(currentPeriodStart)}`;
      const previousPeriodQuery = `where[createdAt][greater_than_equal]=${formatDate(previousPeriodStart)}&where[createdAt][less_than]=${formatDate(previousPeriodEnd)}`;

      const [
        currentPaymentRes, 
        currentApptRes, 
        previousPaymentRes, 
        previousApptRes,
        docsRes
      ] = await Promise.all([
        // Current period data
        fetch(`/api/stripe-payments?where[status][equals]=paid&${currentPeriodQuery}`),
        fetch(`/api/appointments?where[status][equals]=confirmed&${currentPeriodQuery}`),
        // Previous period data
        fetch(`/api/stripe-payments?where[status][equals]=paid&${previousPeriodQuery}`),
        fetch(`/api/appointments?where[status][equals]=confirmed&${previousPeriodQuery}`),
        // Documentation (no time-based comparison needed)
        fetch('/api/business-documentation')
      ]);

      const currentPayments = currentPaymentRes.ok ? await currentPaymentRes.json() : { docs: [] };
      const currentAppointments = currentApptRes.ok ? await currentApptRes.json() : { totalDocs: 0 };
      const previousPayments = previousPaymentRes.ok ? await previousPaymentRes.json() : { docs: [] };
      const previousAppointments = previousApptRes.ok ? await previousApptRes.json() : { totalDocs: 0 };
      const docs = docsRes.ok ? await docsRes.json() : { totalDocs: 0 };

      // Calculate revenue for current and previous periods
      const currentRevenue = currentPayments.docs?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) / 100 || 0;
      const previousRevenue = previousPayments.docs?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) / 100 || 0;
      
      // Calculate current and previous bookings
      const currentBookings = currentAppointments.totalDocs || 0;
      const previousBookings = previousAppointments.totalDocs || 0;

      // Calculate growth percentages
      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) {
          return current > 0 ? 100 : 0; // If no previous data but have current data, show 100% growth
        }
        return ((current - previous) / previous) * 100;
      };

      const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
      const bookingGrowth = calculateGrowth(currentBookings, previousBookings);

      setStats({
        revenue: currentRevenue,
        bookings: currentBookings,
        contentCount: docs.totalDocs || 0,
        revenueGrowth,
        bookingGrowth
      });
    } catch (err) {
      console.error('Error fetching analytics stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quick Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Analytics Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button onClick={fetchStats} size="sm" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      label: 'Revenue',
      value: `$${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      growth: stats.revenueGrowth,
      color: 'text-green-600'
    },
    {
      label: 'Bookings',
      value: stats.bookings,
      icon: Calendar,
      growth: stats.bookingGrowth,
      color: 'text-blue-600'
    },
    {
      label: 'Documentation',
      value: stats.contentCount,
      icon: FileText,
      color: 'text-purple-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quick Analytics
          </CardTitle>
          <CardDescription>
            Key performance metrics at a glance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white">
                    <IconComponent className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
                {item.growth !== undefined && (
                  <Badge 
                    variant={item.growth >= 0 ? 'default' : 'secondary'}
                    className={item.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                  </Badge>
                )}
              </motion.div>
            );
          })}
          
          <div className="pt-2">
            <Button
              onClick={() => router.push('/admin/analytics')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
