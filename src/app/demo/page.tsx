"use client"

import dynamic from 'next/dynamic'

// Dynamic import of the modular demo page
const DemoPage = dynamic(() => import('@/modules/demo/components/DemoPage'), {
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading demo page...</p>
      </div>
    </div>
  ),
  ssr: false
})

export default function Page() {
  return <DemoPage />
}
