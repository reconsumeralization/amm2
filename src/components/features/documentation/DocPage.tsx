'use client';

import { useState } from 'react';

export function DocPage({ children, lastUpdated }: { children: React.ReactNode, lastUpdated: string }) {
  const [helpful, setHelpful] = useState<boolean | null>(null);

  return (
    <article className="prose prose-invert max-w-none">
      {children}
      <div className="mt-8 pt-8 border-t border-gray-700">
        <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-400">Was this page helpful?</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setHelpful(true)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                helpful === true ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setHelpful(false)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                helpful === false ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              No
            </button>
          </div>
          {helpful !== null && (
            <p className="text-sm text-gray-400 mt-2">
              Thank you for your feedback!
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
