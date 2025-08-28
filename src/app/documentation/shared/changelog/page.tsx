import React from 'react';
import { DocumentationLayoutClient } from '@/app/documentation/DocumentationLayoutClient';
import { Metadata } from 'next';
import { getChangelogEntries } from '@/lib/changelog-generator';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'System changelog for Modern Men documentation platform.',
};

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();

  return (
    <DocumentationLayoutClient>
      <section className="prose mx-auto py-8">
        <h1>Changelog</h1>
        <p>All notable changes to the documentation system are listed here.</p>

        {entries.length === 0 ? (
          <p>No changelog entries available.</p>
        ) : (
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.version} className="border-b border-slate-700 pb-4">
                <h2 className="text-xl font-semibold">
                  {entry.version} – {new Date(entry.date).toLocaleDateString()}
                </h2>
                <p className="text-sm text-slate-400">{entry.title}</p>
                <ul className="list-disc list-inside mt-2">
                  {entry.changes.map((change: string, idx: number) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DocumentationLayoutClient>
  );
}
