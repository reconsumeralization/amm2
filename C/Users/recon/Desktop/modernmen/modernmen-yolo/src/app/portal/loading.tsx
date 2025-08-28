'use client';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <LoadingSpinner className="w-12 h-12 text-blue-600" />
      <p className="ml-4 text-lg">Loading your barbershop booking...</p>
    </div>
  );
}
