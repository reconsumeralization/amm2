import React from 'react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-extrabold mb-4">Modern Men BarberShop</h1>
        <p className="text-lg text-gray-300 mb-8">Precision cuts, classic shaves, and refined style.</p>
        <Link href="/book" className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold">Book Now</Link>
      </div>
    </section>
  )
}
