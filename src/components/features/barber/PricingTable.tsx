import React from 'react'

type PriceItem = {
  name: string
  price: string
  description?: string
}

const defaultItems: PriceItem[] = [
  { name: 'Classic Cut', price: '$30', description: 'Tailored to your style' },
  { name: 'Razor Shave', price: '$25', description: 'Hot towel finish' },
  { name: 'Beard Trim', price: '$20', description: 'Shape & condition' },
]

export function PricingTable({ items = defaultItems }: { items?: PriceItem[] }) {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-black dark:text-white mb-8">Pricing</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.name} className="card-premium p-6">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-semibold text-black dark:text-white">{it.name}</h3>
                <span className="text-red-600 font-bold">{it.price}</span>
              </div>
              {it.description && <p className="text-sm text-gray-600 dark:text-gray-300">{it.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
