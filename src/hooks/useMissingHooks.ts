/**
 * Placeholder implementations for any missing custom hooks.
 * These stubs allow the TypeScript compiler to succeed while the real
 * implementations are being developed.
 *
 * Each hook returns a minimal, type‑safe value that matches the expected
 * shape used throughout the codebase.
 */

import { useEffect, useState } from 'react'

/**
 * usePageGuard – placeholder that mimics the real hook signature.
 * Returns a dummy user object, loading state, and authentication flag.
 */
export function usePageGuard(
  requiredRole?: string | string[],
  requiredPermission?: string
) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate async user fetch – replace with real logic later.
    setTimeout(() => {
      setUser({ role: 'guest', permissions: [] })
      setIsLoading(false)
    }, 0)
  }, [])

  const isAuthenticated = !!user

  return { user, isLoading, isAuthenticated }
}

/**
 * unalytics – placeholder analytics hook.
 * Returns no‑op functions for tracking events.
 */
export function unalytics() {
  const trackEvent = (..._args: any[]) => {
    // No‑op placeholder
  }

  const identifyUser = (..._args: any[]) => {
    // No‑op placeholder
  }

  return { trackEvent, identifyUser }
}

/**
 * usePayloadIntegration – placeholder for payload integration hook.
 * Returns empty objects and functions.
 */
export function usePayloadIntegration() {
  const sync = async (..._args: any[]) => {
    // No‑op placeholder
  }

  const fetchData = async (..._args: any[]) => {
    // No‑op placeholder
    return null
  }

  return { sync, fetchData }
}

/**
 * useMonitoring – placeholder monitoring hook.
 * Returns a no‑op report function.
 */
export function useMonitoring() {
  const report = (..._args: any[]) => {
    // No‑op placeholder
  }

  return { report }
}

/**
 * useSession – re‑export from the mock next‑auth module.
 * This ensures TypeScript can resolve the hook without pulling in the real library.
 */
export { useSession } from 'next-auth/react'
