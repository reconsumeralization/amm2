"use client"

import { WifiOff, RefreshCw } from '@/lib/icon-mapping'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <WifiOff className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">You're offline</h1>
          <p className="text-muted-foreground mb-6">
            {isOnline 
              ? "Connection restored! You can now reload the page."
              : "Check your internet connection and try again."
            }
          </p>
        </div>

        <Button 
          onClick={handleRetry}
          disabled={!isOnline}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isOnline ? 'Reload Page' : 'Retry'}
        </Button>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Some features may be available offline:</p>
          <ul className="mt-2 space-y-1">
            <li>• View cached content</li>
            <li>• Draft posts (will sync when online)</li>
            <li>• Browse saved articles</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
