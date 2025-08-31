'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function EditorRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/content')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to content manager...</p>
      </div>
    </div>
  )
}
