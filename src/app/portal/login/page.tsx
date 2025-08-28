'use client'

import { getProviders, signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Icons } from '@/components/ui/icons'

export default function PortalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const callbackUrl = searchParams?.get('callbackUrl') || '/portal'
  const error = searchParams?.get('error')

  useEffect(() => {
    const getProvidersData = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    getProvidersData()

    if (error) {
      toast.error(error === 'CredentialsSignin' ? 'Invalid credentials' : 'Authentication failed')
    }
  }, [error])

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Sign in failed: ' + result.error)
      } else {
        toast.success('Signed in successfully! Welcome back!')
        router.push(callbackUrl)
      }
    } catch (error) {
      toast.error('Sign in failed: An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignIn = (providerId: string) => {
    signIn(providerId, { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Modern Men Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 via-amber-600 to-blue-800 rounded-full flex items-center justify-center shadow-xl mb-6">
            <span className="text-3xl text-white font-bold">✂</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-amber-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Modern Men
          </h1>
          <p className="text-amber-800 font-medium">Customer Portal</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <CardTitle className="text-2xl text-center text-gray-800">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Providers */}
            {providers && Object.values(providers)
              .filter((provider: any) => provider.id !== 'credentials')
              .map((provider: any) => (
                <Button
                  key={provider.name}
                  variant="outline"
                  onClick={() => handleProviderSignIn(provider.id)}
                  className="w-full border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-gray-700"
                  disabled={isLoading}
                >
                  {provider.id === 'google' && <Icons.google className="mr-2 h-4 w-4" />}
                  {provider.id === 'github' && <Icons.gitHub className="mr-2 h-4 w-4" />}
                  Continue with {provider.name}
                </Button>
              ))}

            {/* Divider */}
            {providers && Object.values(providers).length > 1 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-amber-700 font-medium">Or continue with</span>
                </div>
              </div>
            )}

            {/* Credentials Form */}
            {providers && Object.values(providers).some((p: any) => p.id === 'credentials') && (
              <form onSubmit={handleCredentialsSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            )}

            {/* Demo Accounts Section */}
            <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg border border-amber-200">
              <h3 className="text-sm font-semibold text-amber-800 mb-3">Demo Accounts:</h3>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => {
                    setEmail('john.smith@email.com')
                    setPassword('password123')
                  }}
                  className="w-full text-left p-2 rounded bg-white hover:bg-amber-50 border border-amber-100 text-gray-700 hover:text-gray-800 transition-colors"
                >
                  <strong>Email:</strong> john.smith@email.com<br/>
                  <strong>Password:</strong> password123
                </button>
                <button
                  onClick={() => {
                    setEmail('mike.brown@email.com')
                    setPassword('password123')
                  }}
                  className="w-full text-left p-2 rounded bg-white hover:bg-amber-50 border border-amber-100 text-gray-700 hover:text-gray-800 transition-colors"
                >
                  <strong>Email:</strong> mike.brown@email.com<br/>
                  <strong>Password:</strong> password123
                </button>
                <button
                  onClick={() => {
                    setEmail('rob.davis@email.com')
                    setPassword('password123')
                  }}
                  className="w-full text-left p-2 rounded bg-white hover:bg-amber-50 border border-amber-100 text-gray-700 hover:text-gray-800 transition-colors"
                >
                  <strong>Email:</strong> rob.davis@email.com<br/>
                  <strong>Password:</strong> password123
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
              Create account
            </Link>
          </p>
          <p className="text-sm">
            <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
              ← Back to website
            </Link>
          </p>
          <div className="pt-4 border-t border-amber-200">
            <p className="text-xs text-gray-500">
              © 2025 Modern Men Barbershop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
