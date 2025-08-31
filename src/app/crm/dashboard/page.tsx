import config from '@/payload.config'
// src/app/crm/dashboard/page.tsx
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, Activity } from '@/lib/icon-mapping';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

async function getDashboardData() {
  const session = await getServerSession(authOptions);
  if (!(session as any)?.user || (((session as any).user)?.role !== 'admin' && ((session as any).user)?.role !== 'manager')) {
    throw new Error('Unauthorized'); 
  }

      const payload = await getPayloadClient();

  // ... (data fetching logic is the same)

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysAppointments = await payload.find({
    collection: 'appointments',
    where: {
      date: {
        greater_than_equal: today.toISOString(),
        less_than: tomorrow.toISOString(),
      },
    },
  });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const newCustomersThisWeek = await payload.find({
      collection: 'customers',
      where: {
          createdAt: {
              greater_than_equal: oneWeekAgo.toISOString(),
          },
      },
  });

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const completedAppointmentsThisMonth = await payload.find({
      collection: 'appointments',
      where: {
          status: { equals: 'completed' },
          date: {
              greater_than_equal: thisMonth.toISOString(),
          },
      },
      limit: 1000,
  });

  const totalRevenueThisMonth = completedAppointmentsThisMonth.docs.reduce((total: number, app: any) => total + (app.price || 0), 0);

  const recentActivity = await payload.find({
      collection: 'appointments',
      sort: '-createdAt',
      limit: 5,
      depth: 1,
  });

  return {
    stats: {
      upcomingAppointmentsToday: todaysAppointments.totalDocs,
      newCustomersThisWeek: newCustomersThisWeek.totalDocs,
      totalRevenueThisMonth: totalRevenueThisMonth,
    },
    recentActivity: recentActivity.docs,
  };
}

const DashboardContent = async () => {
  const data = await getDashboardData();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.upcomingAppointmentsToday}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.stats.newCustomersThisWeek}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(data.stats.totalRevenueThisMonth / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <ul>
              {data.recentActivity.map((activity: any) => (
                <li key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-3 text-gray-500" />
                    <p>{activity.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;
