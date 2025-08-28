'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ClockRecord {
  id: string;
  action: 'clock-in' | 'clock-out';
  timestamp: string;
  staff: string;
}

interface StaffClockProps {
  userId: string;
  tenantId: string;
}

export default function StaffClock({ userId, tenantId }: StaffClockProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastClockRecord, setLastClockRecord] = useState<ClockRecord | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'clocked-out' | 'clocked-in' | 'unknown'>('unknown');

  const fetchLastClockRecord = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/staff-schedules/clock?staff=${userId}&limit=1&sort=-timestamp`);
      if (response.ok) {
        const data = await response.json();
        const records = data.docs || [];
        if (records.length > 0) {
          setLastClockRecord(records[0]);
          setCurrentStatus(records[0].action === 'clock-in' ? 'clocked-in' : 'clocked-out');
        } else {
          setCurrentStatus('clocked-out');
        }
      }
    } catch (error) {
      console.error('Error fetching last clock record:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchLastClockRecord();
  }, [fetchLastClockRecord]);

  const handleClockAction = async (action: 'clock-in' | 'clock-out') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/staff-schedules/clock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          tenantId,
          staffId: userId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          action === 'clock-in'
            ? 'Successfully clocked in! Welcome back!'
            : 'Successfully clocked out! Have a great day!'
        );
        setCurrentStatus(action === 'clock-in' ? 'clocked-in' : 'clocked-out');
        setLastClockRecord(result);
      } else {
        toast.error(result.error || `Failed to ${action.replace('-', ' ')}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing:`, error);
      toast.error(`Failed to ${action.replace('-', ' ')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'clocked-in':
        return 'bg-green-100 text-green-800';
      case 'clocked-out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case 'clocked-in':
        return 'Currently Clocked In';
      case 'clocked-out':
        return 'Currently Clocked Out';
      default:
        return 'Status Unknown';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          Staff Clock
        </CardTitle>
        <CardDescription>
          Track your work hours and manage your attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="text-center">
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Last Clock Record */}
        {lastClockRecord && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Last {lastClockRecord.action === 'clock-in' ? 'Clock In' : 'Clock Out'}:
              </span>
              <span className="font-medium">
                {formatTime(lastClockRecord.timestamp)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(lastClockRecord.timestamp).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Clock Action Buttons */}
        <div className="space-y-2">
          {currentStatus === 'clocked-out' ? (
            <Button
              onClick={() => handleClockAction('clock-in')}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Clocking In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Clock In
                </>
              )}
            </Button>
          ) : currentStatus === 'clocked-in' ? (
            <Button
              onClick={() => handleClockAction('clock-out')}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Clocking Out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Clock Out
                </>
              )}
            </Button>
          ) : (
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Unable to determine current status
              </p>
              <Button
                onClick={fetchLastClockRecord}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Refresh Status
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <Button
            onClick={() => window.location.href = '/admin/collections/clock-records'}
            variant="outline"
            size="sm"
            className="w-full"
          >
            View All Clock Records
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
