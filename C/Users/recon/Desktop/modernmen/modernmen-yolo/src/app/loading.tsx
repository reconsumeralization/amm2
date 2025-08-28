'use client';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner className="w-12 h-12" />
    </div>
  );
}
