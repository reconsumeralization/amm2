'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScheduleWidget() {
  const [schedules, setSchedules] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchSchedules = async () => {
      const res = await fetch('/api/staff-schedules?where[available][equals]=true');
      const data = await res.json();
      setSchedules(data.totalDocs);
    };
    fetchSchedules();
  }, []);

  return (
    <div className="p-2">
      <h3 className="text-lg">Staff Schedules</h3>
      <p>Available Slots: {schedules}</p>
      <button
        onClick={() => router.push('/admin/payload/collections/staff-schedules')}
        className="text-blue-500"
      >
        Manage Schedules
      </button>
    </div>
  );
}