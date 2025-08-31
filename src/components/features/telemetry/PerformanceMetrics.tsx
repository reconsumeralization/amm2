'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMonitoring } from '@/hooks/useMonitoring';

const PerformanceMetrics = () => {
  const { getPerformanceMetrics } = useMonitoring();
  const [metrics, setMetrics] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await getPerformanceMetrics();
      setMetrics(data);
    };
    fetchMetrics();
  }, [getPerformanceMetrics]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Page Load Times</h3>
          <p>Booking Page: {metrics.bookingPage?.loadTime || 'N/A'} ms</p>
          <p>Portal Page: {metrics.portalPage?.loadTime || 'N/A'} ms</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">API Response Times</h3>
          <p>Appointments API: {metrics.api?.appointments || 'N/A'} ms</p>
          <p>Analytics API: {metrics.api?.analytics || 'N/A'} ms</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
