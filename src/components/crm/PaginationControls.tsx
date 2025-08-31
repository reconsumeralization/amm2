'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationControlsProps {
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ totalDocs, page, limit, totalPages, hasNextPage, hasPrevPage }) => {
  const router = useRouter();

  const handlePrev = () => {
    router.push(`/crm/customers?page=${page - 1}&limit=${limit}`);
  };

  const handleNext = () => {
    router.push(`/crm/customers?page=${page + 1}&limit=${limit}`);
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min((page - 1) * limit + 1, totalDocs)} to {Math.min(page * limit, totalDocs)} of {totalDocs} results
      </div>
      <div className="flex items-center space-x-2">
        <Button onClick={handlePrev} disabled={!hasPrevPage} variant="outline">
          Previous
        </Button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Button onClick={handleNext} disabled={!hasNextPage} variant="outline">
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
