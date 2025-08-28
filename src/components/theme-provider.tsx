'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { useEffect, useState } from 'react'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ visibility: 'hidden', opacity: 0 }}>{children}</div>
  }

  return (
    <div style={{ visibility: 'visible', opacity: 1 }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </div>
  )
}
