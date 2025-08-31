import React from 'react'

type ContactInfoProps = {
  address?: string
  phone?: string
  email?: string
  hours?: string
}

export function ContactInfo({ address, phone, email, hours }: ContactInfoProps) {
  const addr = address || '#4 - 425 Victoria Ave East, Regina, SK, S4N 0N8'
  const ph = phone || '(306) 522-4111'
  const em = email || 'info@modernmen.ca'
  const hrs = hours || 'Mon–Sat: 9am–8pm • Sun: Closed'

  return (
    <section className="py-16 bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto px-4 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text:white mb-4">Contact</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>{addr}</li>
            <li>{ph}</li>
            <li>{em}</li>
            <li>{hrs}</li>
          </ul>
        </div>
        <div className="rounded-xl bg-gray-100 dark:bg-gray-900 h-64 w-full flex items-center justify-center text-gray-500">
          Map Placeholder
        </div>
      </div>
    </section>
  )
}
