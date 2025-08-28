'use client';
import { useRouter } from 'next/navigation';

export default function SyncCalendarButton() {
  const router = useRouter();

  const syncAll = async () => {
    try {
      const res = await fetch('/api/calendar/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        alert('Calendar sync complete');
        router.refresh();
      } else {
        alert('Sync failed');
      }
    } catch {
      alert('Error syncing calendar');
    }
  };

  return (
    <button
      onClick={syncAll}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Sync All Appointments with Google Calendar
    </button>
  );
}