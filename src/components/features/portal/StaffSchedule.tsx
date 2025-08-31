'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin as Map, CheckCircle, X as XCircle, AlertTriangle as AlertCircle } from '@/lib/icon-mapping';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  staff: { id: string; name: string };
  startTime: string;
  endTime: string;
  available: boolean;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
  services?: Array<{ id: string; name: string }>;
  maxAppointments?: number;
}

interface StaffScheduleProps {
  userId: string;
  tenantId: string;
}

export default function StaffSchedule({ userId, tenantId }: StaffScheduleProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const response = await fetch(
        `/api/admin/staff-schedules?staff=${userId}&tenant=${tenantId}&startDate=${today}&endDate=${nextWeekStr}&sort=startTime`
      );

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.docs || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  }, [userId, tenantId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules, userId, tenantId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      case 'in-progress':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Schedule
          </CardTitle>
          <CardDescription>Loading your schedule...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          My Schedule
        </CardTitle>
        <CardDescription>
          Your upcoming shifts and appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming schedules</h3>
            <p className="text-gray-600">
              You don't have any scheduled shifts in the next week.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {formatDate(schedule.startTime)}
                        </span>
                      </div>
                      <Badge className={getStatusColor(schedule.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(schedule.status)}
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </div>
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </span>
                      {schedule.location && (
                        <div className="flex items-center gap-1">
                          <Map className="h-3 w-3" />
                          <span>{schedule.location}</span>
                        </div>
                      )}
                    </div>

                    {schedule.services && schedule.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {schedule.services.slice(0, 3).map((service) => (
                          <Badge key={service.id} variant="outline" className="text-xs">
                            {service.name}
                          </Badge>
                        ))}
                        {schedule.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{schedule.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {schedule.notes && (
                      <p className="text-sm text-gray-600 mt-2">{schedule.notes}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {schedule.available ? 'Available' : 'Unavailable'}
                    </div>
                    {schedule.maxAppointments && (
                      <div className="text-xs text-gray-400 mt-1">
                        Max: {schedule.maxAppointments} appointments
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t mt-6">
          <Button
            onClick={() => window.location.href = '/admin/collections/staff-schedules'}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Manage All Schedules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
