import React from 'react'

export function AboutUs() {
  return (
    <section className="py-16 bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto px-4 grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white mb-3">Our Story</h2>
          <p className="text-gray-700 dark:text-gray-300">Founded in Regina, Modern Men delivers elevated grooming with attention to detail, hospitality, and classic technique.</p>
        </div>
        <div className="rounded-xl bg-gray-100 dark:bg-gray-900 h-48 w-full flex items-center justify-center text-gray-500">
          Placeholder
        </div>
      </div>
    </section>
  )
}
