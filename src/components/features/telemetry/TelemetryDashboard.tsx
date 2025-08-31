'use client';

import React, { useEffect, useState } from 'react';

interface TelemetryData {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
}

export default function TelemetryDashboard() {
  const [data, setData] = useState<TelemetryData>({
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    uptime: 100
  });

  useEffect(() => {
    // Mock data for now - replace with actual telemetry service
    const mockData: TelemetryData = {
      totalRequests: 1250,
      averageResponseTime: 245,
      errorRate: 0.5,
      uptime: 99.9
    };

    setData(mockData);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Telemetry Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Requests</h3>
          <p className="text-2xl font-bold text-blue-600">{data.totalRequests.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Avg Response Time</h3>
          <p className="text-2xl font-bold text-green-600">{data.averageResponseTime}ms</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Error Rate</h3>
          <p className="text-2xl font-bold text-red-600">{data.errorRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Uptime</h3>
          <p className="text-2xl font-bold text-purple-600">{data.uptime}%</p>
        </div>
      </div>
    </div>
  );
}
