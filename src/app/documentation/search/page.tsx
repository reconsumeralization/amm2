'use client';

import React, { Suspense } from 'react';
// Using window.location.search instead of useSearchParams to avoid Next.js version issues
import { DocumentationSearch } from '@/components/features/documentation/DocumentationSearch';
import { Card, CardContent } from '@/components/ui/card';
// Using text alternatives for icons due to package compatibility issues

function searchPageContent() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get('q') || '';

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-blue-500 text-2xl">🔍</span>
          <h1 className="text-3xl font-bold text-slate-100">
            Search Documentation
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Find guides, API references, and resources across our comprehensive documentation.
        </p>
      </div>

      <DocumentationSearch 
        initialQuery={initialQuery}
        showFilters={true}
        compact={false}
      />
    </div>
  );
}

function searchPageLoading() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-blue-500 text-2xl">🔍</span>
          <h1 className="text-3xl font-bold text-slate-100">
            Search Documentation
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Find guides, API references, and resources across our comprehensive documentation.
        </p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <span className="text-slate-400 text-2xl mx-auto mb-4 animate-spin">⟳</span>
          <p className="text-slate-400">Loading search...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function searchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search Documentation</h1>
        <p className="text-gray-600">Search functionality coming soon...</p>
      </div>
    </Suspense>
  );
}