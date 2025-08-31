'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeProvider({ children, ...props }: any) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering theme provider on server
  if (!mounted) {
    return <div style={{ visibility: 'hidden', opacity: 0 }}>{children}</div>
  }

  return (
    <div style={{ visibility: 'visible', opacity: 1 }}>
      <NextThemesProvider
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...props}
      >
        {children}
      </NextThemesProvider>
    </div>
  )
}
