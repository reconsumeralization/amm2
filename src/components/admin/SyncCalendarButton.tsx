'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SyncCalendarButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const syncAll = async () => {
    setIsLoading(true);
    setLastResult(null);

    try {
      // Use the comprehensive sync endpoint
      const res = await fetch('/api/sync/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: ['calendar'],
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const message = `Calendar sync completed: ${data.summary?.totalSynced || 0} synced, ${data.summary?.totalFailed || 0} failed`;
        setLastResult(message);
        
        if (data.summary?.allErrors?.length > 0) {
          console.warn('Sync errors:', data.summary.allErrors);
        }
        
        router.refresh();
      } else {
        const errorMsg = data.error || 'Sync failed';
        setLastResult(`Error: ${errorMsg}`);
        console.error('Sync error:', data);
      }
    } catch (error) {
      const errorMsg = 'Network error during sync';
      setLastResult(errorMsg);
      console.error('Network error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/sync/health?detailed=true');
      const data = await res.json();
      
      if (res.ok) {
        alert(`Sync Health Status: ${data.overall}\n\nServices:\n${
          Object.entries(data.services)
            .map(([service, status]: [string, any]) => `${service}: ${status.status}`)
            .join('\n')
        }`);
      } else {
        alert(`Health check failed: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to check sync health');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={syncAll}
          disabled={isLoading}
          className={`px-4 py-2 text-white rounded transition-colors ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Syncing...' : 'Sync Calendar'}
        </button>
        
        <button
          onClick={checkHealth}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Check Health
        </button>
      </div>
      
      {lastResult && (
        <div className={`p-2 text-sm rounded ${
          lastResult.includes('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {lastResult}
        </div>
      )}
    </div>
  );
}