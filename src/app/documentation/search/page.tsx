'use client';

import React, { Suspense } from 'react';
import { userchParams } from 'next/navigation';
import { DocumentationSearch } from '@/components/documentation/DocumentationSearch';
import { Card, CardContent } from '@/components/ui/card';
import { rch, Loader2 } from '@/lib/icon-mapping';

function rchPageContent() {
  const rchParams = userchParams();
  const initialQuery = rchParams.get('q') || '';

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <rch className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-100">
            rch Documentation
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

function rchPageLoading() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <rch className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-100">
            rch Documentation
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Find guides, API references, and resources across our comprehensive documentation.
        </p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-400">Loading rch...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function rchPage() {
  return (
    <Suspense fallback={<rchPageLoading />}>
      <rchPageContent />
    </Suspense>
  );
}