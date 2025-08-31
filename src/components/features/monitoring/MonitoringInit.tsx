'use client'

import { useEffect } from 'react'
import { useMonitoring } from '@/hooks/useMonitoring'
import { logger } from '@/lib/logger'

export function MonitoringInit() {
  const { addBreadcrumb } = useMonitoring()

  useEffect(() => {
    // Add initial breadcrumb for app start
    addBreadcrumb('Application initialized', 'app', 'info')

    // Track page load performance
    const trackPageLoad = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        if (navigation) {
          addBreadcrumb(
            `Page loaded in ${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`,
            'performance',
            'info'
          )
        }
      }
    }

    // Track when page becomes visible (user actually sees the page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        addBreadcrumb('Page became visible to user', 'user', 'info')
      }
    }

    // Track page unload
    const handleBeforeUnload = () => {
      addBreadcrumb('Page unloading', 'navigation', 'info')
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
  }, [addBreadcrumb])

  // This component doesn't render anything visible
  return null
}
