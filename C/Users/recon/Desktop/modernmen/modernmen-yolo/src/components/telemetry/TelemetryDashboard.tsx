'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMonitoring } from '@/hooks/useMonitoring';

const TelemetryDashboard = () => {
  const { getMetrics } = useMonitoring();
  const [metrics, setMetrics] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await getMetrics('barbershop');
      setMetrics(data);
    };
    fetchMetrics();
  }, [getMetrics]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Barbershop Telemetry Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Booking Events</h3>
          <p>Total Bookings: {metrics.bookings?.total || 0}</p>
          <p>Completed Bookings: {metrics.bookings?.completed || 0}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">User Activity</h3>
          <p>Active Users: {metrics.users?.active || 0}</p>
          <p>Page Views: {metrics.pageViews?.total || 0}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelemetryDashboard;
