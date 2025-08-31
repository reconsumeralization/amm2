'use client';

import React, { useState } from 'react'

type FAQ = { q: string; a: string }

const defaultFAQs: FAQ[] = [
  { q: 'Do you accept walk-ins?', a: 'Yes, when availability allows. Booking is recommended.' },
  { q: 'What forms of payment do you accept?', a: 'Credit/debit and cash are accepted.' },
  { q: 'What are your hours?', a: 'Mon–Sat 9am–8pm; Sun closed.' },
]

export function FAQAccordion({ faqs = defaultFAQs }: { faqs?: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-black dark:text-white mb-6">FAQs</h2>
        <div className="divide-y divide-gray-200 dark:divide-gray-800 border rounded-lg">
          {faqs.map((item, idx) => (
            <div key={idx} className="p-4">
              <button
                className="w-full flex justify-between items-center text-left"
                onClick={() => setOpen(open === idx ? null : idx)}
              >
                <span className="font-medium text-black dark:text-white">{item.q}</span>
                <span className="text-red-600">{open === idx ? '-' : '+'}</span>
              </button>
              {open === idx && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
