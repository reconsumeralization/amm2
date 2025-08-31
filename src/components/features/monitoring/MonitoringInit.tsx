'use client'

import { useEffect } from 'react'
import { useMonitoring } from '@/hooks/useMonitoring'
import { logger } from '@/lib/logger'

export function MonitoringInit() {
  useEffect(() => {
    // Application initialized

    // Track page load performance
    const trackPageLoad = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        if (navigation) {
          console.log(`Page loaded in ${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`);
        }
      }
    }

    // Track when page becomes visible (user actually sees the page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible to user')
      }
    }

    // Track page unload
    const handleBeforeUnload = () => {
      console.log('Page unloading')
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Track page load after a short delay to ensure everything is loaded
    const timeoutId = setTimeout(trackPageLoad, 1000)

    logger.info('Monitoring initialization component mounted')

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearTimeout(timeoutId)
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
