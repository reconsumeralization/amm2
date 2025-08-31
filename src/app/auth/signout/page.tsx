'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Loader2 } from '@/lib/icon-mapping';

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut({
          callbackUrl: '/',
          redirect: false
        })
        setIsSigningOut(false)
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (err) {
        console.error('Sign out error:', err)
        setError('Failed to sign out. Please try again.')
        setIsSigningOut(false)
      }
    }

    handleSignOut()
  }, [router])

  const handleManualSignOut = async () => {
    setIsSigningOut(true)
    setError(null)
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true
      })
    } catch (err) {
      console.error('Manual sign out error:', err)
      setError('Failed to sign out. Please try again.')
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogOut className="h-5 w-5" />
            Signing Out
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSigningOut ? (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Please wait while we sign you out...</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              {error ? (
                <>
                  <p className="text-red-600">{error}</p>
                  <Button onClick={handleManualSignOut} className="w-full">
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-green-600">You have been successfully signed out.</p>
                  <p className="text-gray-600 text-sm">Redirecting you to the home page...</p>
                  <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
