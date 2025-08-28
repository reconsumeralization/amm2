'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
// Using window.location.search instead of useSearchParams to avoid Next.js version issues
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Icons } from '@/components/ui/icons'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [callbackUrl, setCallbackUrl] = useState('/')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const callbackParam = urlParams.get('callbackUrl')
    const errorParam = urlParams.get('error')
    if (callbackParam) setCallbackUrl(callbackParam)
    if (errorParam) setError(errorParam)
  }, [])

  useEffect(() => {
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

  const renderCredentialsForm = () => {

    return (
      <>
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
              className="border-red-200 focus:border-red-400 focus:ring-red-400"
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
              className="border-red-200 focus:border-red-400 focus:ring-red-400"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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

        {/* Demo Accounts Section */}
        <div className="mt-8 p-4 bg-gradient-to-r from-red-50 to-gray-50 rounded-lg border border-red-200">
          <h3 className="text-sm font-semibold text-red-800 mb-3">Demo Accounts:</h3>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => {
                setEmail('admin@modernmen.ca')
                setPassword('admin123')
              }}
              className="w-full text-left p-2 rounded bg-white hover:bg-red-50 border border-red-100 text-gray-700 hover:text-gray-800 transition-colors"
            >
              <strong>Admin:</strong> admin@modernmen.ca<br/>
              <strong>Password:</strong> admin123
            </button>
            <button
              onClick={() => {
                setEmail('customer@modernmen.ca')
                setPassword('customer123')
              }}
              className="w-full text-left p-2 rounded bg-white hover:bg-red-50 border border-red-100 text-gray-700 hover:text-gray-800 transition-colors"
            >
              <strong>Customer:</strong> customer@modernmen.ca<br/>
              <strong>Password:</strong> customer123
            </button>
            <button
              onClick={() => {
                setEmail('stylist@modernmen.ca')
                setPassword('stylist123')
              }}
              className="w-full text-left p-2 rounded bg-white hover:bg-red-50 border border-red-100 text-gray-700 hover:text-gray-800 transition-colors"
            >
              <strong>Stylist:</strong> stylist@modernmen.ca<br/>
              <strong>Password:</strong> stylist123
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Modern Men Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl mb-6">
            <span className="text-3xl text-white font-bold">✂</span>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">
            Modern Men
          </h1>
          <p className="text-red-600 font-medium">Customer Portal</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <CardTitle className="text-2xl text-center text-gray-800">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Credentials Form */}
            {renderCredentialsForm()}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-red-600 hover:text-red-800 font-medium">
              Create account
            </Link>
          </p>
          <p className="text-sm">
            <Link href="/" className="text-red-600 hover:text-red-700 font-medium">
              ← Back to website
            </Link>
          </p>
          <div className="pt-4 border-t border-red-200">
            <p className="text-xs text-gray-500">
              © 2025 Modern Men Barbershop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
