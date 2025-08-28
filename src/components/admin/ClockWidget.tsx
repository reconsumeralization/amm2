'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClockWidget() {
  const [clockStats, setClockStats] = useState({ clockIns: 0, clockOuts: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [inRes, outRes] = await Promise.all([
          fetch('/api/clock-records?where[action][equals]=clock-in'),
          fetch('/api/clock-records?where[action][equals]=clock-out'),
        ]);
        const clockIns = await inRes.json();
        const clockOuts = await outRes.json();
        setClockStats({ clockIns: clockIns.totalDocs, clockOuts: clockOuts.totalDocs });
      } catch (error) {
        console.error('Error fetching clock stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-2">
      <h3 className="text-lg">Staff Clock Activity</h3>
      <p>Clock-Ins: {clockStats.clockIns}</p>
      <p>Clock-Outs: {clockStats.clockOuts}</p>
      <button
        onClick={() => router.push('/admin/payload/collections/clock-records')}
        className="text-blue-500"
      >
        View Clock Records
      </button>
    </div>
  );
}