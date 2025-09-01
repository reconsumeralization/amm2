// src/app/crm/dashboard/page.tsx
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, Activity } from '@/lib/icon-mapping';
import { getPayloadClient } from '@/payload';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

// Type definitions for better type safety
interface DashboardStats {
  upcomingAppointmentsToday: number;
  newCustomersThisWeek: number;
  totalRevenueThisMonth: number;
}

interface DashboardActivity {
  id: string;
  title: string;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: DashboardActivity[];
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const session: Session | null = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session?.user || !session.user.role) {
      redirect('/auth/signin?callbackUrl=/crm/dashboard');
    }

    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      redirect('/auth/signin?error=Unauthorized');
    }

    const payload = await getPayloadClient();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's appointments with better error handling
    const todaysAppointments = await payload.find({
      collection: 'appointments',
      where: {
        date: {
          greater_than_equal: today.toISOString(),
          less_than: tomorrow.toISOString(),
        },
      },
    }).catch((error: unknown) => {
      console.error('Error fetching today\'s appointments:', error);
      return { totalDocs: 0, docs: [] };
    });

    // Fetch new customers this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newCustomersThisWeek = await payload.find({
      collection: 'customers',
      where: {
        createdAt: {
          greater_than_equal: oneWeekAgo.toISOString(),
        },
      },
    }).catch((error: unknown) => {
      console.error('Error fetching new customers:', error);
      return { totalDocs: 0, docs: [] };
    });

    // Fetch completed appointments this month
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
    }).catch((error: unknown) => {
      console.error('Error fetching completed appointments:', error);
      return { docs: [] };
    });

    // Calculate total revenue with proper type safety
    const totalRevenueThisMonth = completedAppointmentsThisMonth.docs.reduce(
      (total: number, app: any) => total + (Number(app.price) || 0), 
      0
    );

    // Fetch recent activity with better type handling
    const recentActivity = await payload.find({
      collection: 'appointments',
      sort: '-createdAt',
      limit: 5,
      depth: 1,
    }).catch((error: unknown) => {
      console.error('Error fetching recent activity:', error);
      return { docs: [] };
    });

    return {
      stats: {
        upcomingAppointmentsToday: todaysAppointments.totalDocs || 0,
        newCustomersThisWeek: newCustomersThisWeek.totalDocs || 0,
        totalRevenueThisMonth: totalRevenueThisMonth,
      },
      recentActivity: recentActivity.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title || 'Untitled Appointment',
        createdAt: doc.createdAt,
      })) || [],
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    // Return empty data with proper typing instead of throwing error
    return {
      stats: {
        upcomingAppointmentsToday: 0,
        newCustomersThisWeek: 0,
        totalRevenueThisMonth: 0,
      },
      recentActivity: [],
    };
  }
}

const DashboardContent = async () => {
  const data = await getDashboardData();

  // Format currency properly
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  // Format date and time
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.upcomingAppointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.upcomingAppointmentsToday === 1 ? 'appointment' : 'appointments'} today
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.stats.newCustomersThisWeek}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.stats.totalRevenueThisMonth)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            {data.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivity.map((activity: DashboardActivity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Appointment created
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;
