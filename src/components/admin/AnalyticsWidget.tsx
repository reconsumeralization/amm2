'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsWidget() {
  const [stats, setStats] = useState({ revenue: 0, bookings: 0 });
  const [contentCount, setContentCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const [paymentRes, apptRes] = await Promise.all([
        fetch('/api/stripe-payments?where[status][equals]=paid'),
        fetch('/api/appointments?where[status][equals]=confirmed'),
      ]);
      const payments = await paymentRes.json();
      const appointments = await apptRes.json();
      setStats({
        revenue: payments.docs.reduce((sum: number, p: any) => sum + p.amount, 0) / 100,
        bookings: appointments.totalDocs,
      });
    };
    fetchStats();
    fetch('/api/business-documentation').then((res) => res.json()).then((data) => setContentCount(data.totalDocs));
  }, []);

  return (
    <div className="p-2">
      <h3 className="text-lg">Quick Analytics</h3>
      <p>Revenue: ${stats.revenue.toFixed(2)}</p>
      <p>Bookings: {stats.bookings}</p>
      <p>Service Descriptions: {contentCount}</p>
      <button
        onClick={() => router.push('/admin/payload/collections/appointments')}
        className="text-blue-500"
      >
        View Details
      </button>
    </div>
  );
}