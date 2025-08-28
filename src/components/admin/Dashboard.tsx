'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    appointments: 0,
    pendingPayments: 0,
    users: 0,
    revenue: 0,
    staffSchedules: 0,
    clockIns: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ dashboard: { enabledWidgets: [], chartType: 'line', refreshInterval: 300 } });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, apptRes, paymentRes, userRes, scheduleRes, clockRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/appointments?where[status][equals]=confirmed'),
          fetch('/api/stripe-payments?where[status][equals]=paid'),
          fetch('/api/users'),
          fetch('/api/staff-schedules?where[available][equals]=true'),
          fetch('/api/clock-records?where[action][equals]=clock-in'),
        ]);
        const settingsData = await settingsRes.json();
        const appointments = await apptRes.json();
        const payments = await paymentRes.json();
        const users = await userRes.json();
        const schedules = await scheduleRes.json();
        const clockIns = await clockRes.json();

        const revenue = payments.docs.reduce((sum: number, payment: any) => sum + payment.amount, 0) / 100;
        const analyticsRes = await fetch('/api/admin/analytics/appointments');
        const analytics = await analyticsRes.json();
        setChartData(analytics);
        setSettings(settingsData);

        setStats({
          appointments: appointments.totalDocs,
          pendingPayments: payments.totalDocs,
          users: users.totalDocs,
          revenue,
          staffSchedules: schedules.totalDocs,
          clockIns: clockIns.totalDocs,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, settings.dashboard.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.dashboard.refreshInterval]);

  const ChartComponent = settings.dashboard.chartType === 'bar' ? BarChart : settings.dashboard.chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = settings.dashboard.chartType === 'bar' ? Bar : settings.dashboard.chartType === 'area' ? Area : Line;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {settings.dashboard.enabledWidgets.includes('appointments') && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl">Confirmed Appointments</h2>
            <p>{stats.appointments}</p>
            <button
              onClick={() => router.push('/admin/payload/collections/appointments')}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Manage
            </button>
          </div>
        )}
        {settings.dashboard.enabledWidgets.includes('revenue') && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl">Total Revenue</h2>
            <p>{settings.stripe.currency.toUpperCase()} {stats.revenue.toFixed(2)}</p>
            <button
              onClick={() => router.push('/admin/payload/collections/stripe-payments')}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Review
            </button>
          </div>
        )}
        {settings.dashboard.enabledWidgets.includes('clock') && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl">Staff Clock-Ins</h2>
            <p>{stats.clockIns}</p>
            <button
              onClick={() => router.push('/admin/payload/collections/clock-records')}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              View Records
            </button>
          </div>
        )}
        {settings.dashboard.enabledWidgets.includes('schedules') && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl">Available Schedules</h2>
            <p>{stats.staffSchedules}</p>
            <button
              onClick={() => router.push('/admin/payload/collections/staff-schedules')}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Manage
            </button>
          </div>
        )}
      </div>
      <section className="mb-8">
        <h2 className="text-xl mb-2">Settings Overview</h2>
        <p>Chatbot: {settings.chatbot?.enabled ? 'Enabled' : 'Disabled'}</p>
        <p>Clock-In/Out: {settings.clock?.enabled ? 'Enabled' : 'Disabled'}</p>
        <p>Google Calendar Sync: {settings.googleCalendar?.enabled ? 'Enabled' : 'Disabled'}</p>
        <button
          onClick={() => router.push('/admin/payload/collections/settings')}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Manage Settings
        </button>
      </section>
      <section className="mb-8">
        <h2 className="text-xl mb-2">Appointment Trends</h2>
        <ChartComponent width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
        </ChartComponent>
      </section>
      <section>
        <h2 className="text-xl mb-2">AI Scheduling</h2>
        <button
          onClick={async () => {
            const res = await fetch('/api/integrations/openai/schedule-suggestions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ collection: 'staff-schedules', tenantId: 'tenant-id-placeholder', preferences: { duration: 60 } }),
            });
            const { times } = await res.json();
            alert(times?.length ? `Suggested times: ${times.join(', ')}` : 'No suggestions available');
          }}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Generate Staff Schedule Suggestions
        </button>
      </section>
    </div>
  );
}