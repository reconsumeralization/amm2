'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports to prevent SSR issues
const Navbar = dynamic(() => import('./navbar').then(mod => ({ default: mod.Navbar })), { 
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b animate-pulse" />
})

const Footer = dynamic(() => import('./footer').then(mod => ({ default: mod.Footer })), { 
  ssr: false,
  loading: () => <div className="h-20 bg-gray-50 animate-pulse" />
})

const BookingChatbot = dynamic(() => import('../features/chatbot/BookingChatbot'), { 
  ssr: false,
  loading: () => null
})

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Always render the navbar container to prevent layout shift */}
      <div className="h-16">
        {mounted && <Navbar />}
      </div>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <div className="mt-auto">
        {mounted && <Footer />}
      </div>
      
      {/* Chatbot - only render when mounted */}
      {mounted && <BookingChatbot />}
    </div>
  )
}
