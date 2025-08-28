'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ScheduleStats {
  availableSlots: number;
  totalSlots: number;
  bookedSlots: number;
  activeStaff: number;
}

interface UpcomingSchedule {
  id: string;
  staffName: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export default function ScheduleWidget() {
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats>({
    availableSlots: 0,
    totalSlots: 0,
    bookedSlots: 0,
    activeStaff: 0
  });
  const [upcomingSchedules, setUpcomingSchedules] = useState<UpcomingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      
      const [availableRes, totalRes, upcomingRes] = await Promise.all([
        fetch(`/api/staff-schedules?where[available][equals]=true&where[date][gte]=${today}`),
        fetch(`/api/staff-schedules?where[date][gte]=${today}`),
        fetch(`/api/staff-schedules?where[date][gte]=${today}&limit=5&sort=date,startTime`)
      ]);

      if (!availableRes.ok || !totalRes.ok) {
        throw new Error('Failed to fetch schedule data');
      }

      const available = await availableRes.json();
      const total = await totalRes.json();
      const upcoming = upcomingRes.ok ? await upcomingRes.json() : { docs: [] };

      const availableSlots = available.totalDocs || 0;
      const totalSlots = total.totalDocs || 0;
      const bookedSlots = totalSlots - availableSlots;
      
      // Calculate unique staff members
      const uniqueStaff = new Set(total.docs?.map((schedule: any) => schedule.staffId) || []);
      const activeStaff = uniqueStaff.size;

      setScheduleStats({
        availableSlots,
        totalSlots,
        bookedSlots,
        activeStaff
      });

      setUpcomingSchedules(upcoming.docs?.slice(0, 4) || []);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule data');
      toast.error('Failed to load schedule data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSchedules, 300000);
    return () => clearInterval(interval);
  }, [fetchSchedules]);

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const getUtilizationRate = () => {
    if (scheduleStats.totalSlots === 0) return 0;
    return Math.round((scheduleStats.bookedSlots / scheduleStats.totalSlots) * 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Staff Schedules
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
            Schedule Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button onClick={fetchSchedules} size="sm" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const utilizationRate = getUtilizationRate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Staff Schedules
          </CardTitle>
          <CardDescription>
            Current scheduling overview and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-700">{scheduleStats.availableSlots}</p>
              <p className="text-xs text-green-600">Available</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="h-3 w-3 text-red-600" />
              </div>
              <p className="text-lg font-bold text-red-700">{scheduleStats.bookedSlots}</p>
              <p className="text-xs text-red-600">Booked</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-700">{scheduleStats.activeStaff}</p>
              <p className="text-xs text-blue-600">Staff</p>
            </div>
          </div>

          {/* Utilization Rate */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Schedule Utilization</span>
              <Badge 
                variant={utilizationRate > 80 ? 'default' : utilizationRate > 50 ? 'secondary' : 'outline'}
                className={
                  utilizationRate > 80 ? 'bg-red-100 text-red-800' :
                  utilizationRate > 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }
              >
                {utilizationRate}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  utilizationRate > 80 ? 'bg-red-500' :
                  utilizationRate > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${utilizationRate}%` }}
              ></div>
            </div>
          </div>

          {/* Upcoming Schedules */}
          {upcomingSchedules.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Next Schedules
              </h4>
              <div className="space-y-1">
                {upcomingSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {schedule.available ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="font-medium truncate max-w-16">
                        {schedule.staffName || 'Staff Member'}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={() => router.push('/admin/collections/staff-schedules')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Manage Schedules
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}