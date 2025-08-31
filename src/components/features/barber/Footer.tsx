import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-bold mb-3">Modern Men</h3>
          <p className="text-sm text-gray-400">Premium barbering in Regina.</p>
          <p className="text-xs text-gray-500 mt-2">© {new Date().getFullYear()} Modern Men. All rights reserved.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>#4 - 425 Victoria Ave East</li>
            <li>Regina, SK, S4N 0N8</li>
            <li>(306) 522-4111</li>
            <li>info@modernmen.ca</li>
            <li>Mon–Sat: 9am–8pm • Sun: Closed</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Navigate</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-red-500" href="/services">Services</Link></li>
            <li><Link className="hover:text-red-500" href="/team">Team</Link></li>
            <li><Link className="hover:text-red-500" href="/gallery">Gallery</Link></li>
            <li><Link className="hover:text-red-500" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-red-500" href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Follow</h4>
          <div className="flex gap-3 text-sm">
            <Link className="hover:text-red-500" href="#">Instagram</Link>
            <Link className="hover:text-red-500" href="#">Facebook</Link>
            <Link className="hover:text-red-500" href="#">TikTok</Link>
          </div>
          <div className="mt-4">
            <Link href="/book" className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm">Book Now</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
