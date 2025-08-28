'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AdminSegmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    // If not authenticated or not admin, redirect to signin
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(pathname))
      return
    }

    // Handle different admin routes
    const segments = pathname.replace('/admin/', '').split('/')

    // If no segments or trying to access payload admin, redirect appropriately
    if (segments.length === 0 || segments[0] === '') {
      router.push('/admin')
      return
    }

    // For payload admin routes, redirect to the payload dashboard
    if (segments[0] === 'payload' || segments[0] === 'collections' || segments[0] === 'globals') {
      router.push('/admin/payload')
      return
    }

    // For other routes, redirect to main admin dashboard
    router.push('/admin')
  }, [session, status, router, pathname])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Admin Panel...</h2>
        <p className="text-gray-600">Please wait while we redirect you to the appropriate section.</p>
      </div>
    </div>
  )
}