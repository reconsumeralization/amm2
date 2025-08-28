'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight as LogIn, LogOut, User, AlertTriangle as AlertCircle, Activity } from '@/lib/icon-mapping';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ClockStats {
  clockIns: number;
  clockOuts: number;
  activeEmployees: number;
  totalHoursToday: number;
}

interface RecentActivity {
  id: string;
  employeeName: string;
  action: 'clock-in' | 'clock-out';
  timestamp: string;
}

export default function ClockWidget() {
  const [clockStats, setClockStats] = useState<ClockStats>({
    clockIns: 0,
    clockOuts: 0,
    activeEmployees: 0,
    totalHoursToday: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      
      const [inRes, outRes, recentRes] = await Promise.all([
        fetch(`/api/clock-records?where[action][equals]=clock-in&where[createdAt][gte]=${today}`),
        fetch(`/api/clock-records?where[action][equals]=clock-out&where[createdAt][gte]=${today}`),
        fetch(`/api/clock-records?limit=5&sort=-createdAt`)
      ]);

      if (!inRes.ok || !outRes.ok) {
        throw new Error('Failed to fetch clock data');
      }

      const clockIns = await inRes.json();
      const clockOuts = await outRes.json();
      const recent = recentRes.ok ? await recentRes.json() : { docs: [] };

      // Calculate active employees (more clock-ins than clock-outs today)
      const activeEmployees = Math.max(0, (clockIns.totalDocs || 0) - (clockOuts.totalDocs || 0));
      
      // Mock calculation for total hours - in reality this would be calculated from paired clock-in/out records
      const totalHoursToday = (clockOuts.totalDocs || 0) * 8; // Placeholder calculation

      setClockStats({
        clockIns: clockIns.totalDocs || 0,
        clockOuts: clockOuts.totalDocs || 0,
        activeEmployees,
        totalHoursToday
      });

      setRecentActivity(recent.docs?.slice(0, 3) || []);
    } catch (err) {
      console.error('Error fetching clock stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch clock data');
      toast.error('Failed to load clock data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh every minute to show real-time data
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Staff Clock Activity
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
            Clock System Error
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Staff Clock Activity
          </CardTitle>
          <CardDescription>
            Real-time employee attendance tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <LogIn className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">Clock-Ins</span>
              </div>
              <p className="text-xl font-bold text-green-700">{clockStats.clockIns}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <LogOut className="h-3 w-3 text-red-600" />
                <span className="text-xs font-medium text-red-600">Clock-Outs</span>
              </div>
              <p className="text-xl font-bold text-red-700">{clockStats.clockOuts}</p>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Currently Active</span>
            </div>
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              {clockStats.activeEmployees} employees
            </Badge>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Recent Activity
              </h4>
              <div className="space-y-1">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {activity.action === 'clock-in' ? (
                        <LogIn className="h-3 w-3 text-green-500" />
                      ) : (
                        <LogOut className="h-3 w-3 text-red-500" />
                      )}
                      <span className="font-medium truncate max-w-20">
                        {activity.employeeName || 'Employee'}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={() => router.push('/admin/collections/clock-records')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              View All Clock Records
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}