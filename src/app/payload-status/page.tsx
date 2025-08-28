'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

interface PayloadStatus {
  success: boolean
  message?: string
  error?: string
  data?: any
}

export default function PayloadStatusPage() {
  const [status, setStatus] = useState<PayloadStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkPayloadStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payload-test')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        success: false,
        error: 'Failed to connect to Payload API'
      })
    } finally {
      setLoading(false)
    }
  }

  const testAdminAccess = () => {
    window.open('/admin', '_blank')
  }

  useEffect(() => {
    checkPayloadStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-amber-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl text-white font-bold">✂</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-amber-600 to-blue-800 bg-clip-text text-transparent">
                  Payload CMS Status
                </h1>
                <p className="text-sm text-gray-600">Check Payload CMS integration status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payload Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-amber-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Icons.database className="h-5 w-5" />
                <span>Payload CMS Status</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Current connection status
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {status === null ? (
                <div className="flex items-center space-x-2">
                  <Icons.spinner className="h-4 w-4 animate-spin text-amber-600" />
                  <span className="text-gray-600">Checking status...</span>
                </div>
              ) : status.success ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-semibold">Connected</span>
                  </div>
                  <p className="text-sm text-gray-600">{status.message}</p>
                  {status.data && (
                    <div className="text-sm text-gray-600">
                      <p>Services: {status.data.servicesCount}</p>
                      <p>Total Docs: {status.data.totalDocs}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-semibold">Disconnected</span>
                  </div>
                  <p className="text-sm text-red-600">{status.error}</p>
                </div>
              )}

              <Button
                onClick={checkPayloadStatus}
                disabled={loading}
                variant="outline"
                className="w-full mt-4 border-amber-200 hover:border-amber-300 hover:bg-amber-50"
              >
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Icons.refreshCw className="mr-2 h-4 w-4" />
                    Refresh Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Icons.settings className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </CardTitle>
              <CardDescription className="text-amber-100">
                Access Payload CMS admin interface
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Access the full Payload CMS management system to manage customers,
                  appointments, services, and business operations.
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Admin Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Customer management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Appointment scheduling</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Service catalog</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Business analytics</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={testAdminAccess}
                  className="w-full bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Icons.externalLink className="mr-2 h-4 w-4" />
                  Access Admin System
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Variables Info */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-amber-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Icons.info className="h-5 w-5" />
              <span>Required Environment Variables</span>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Ensure these are set in your Vercel project
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Required Variables:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-1 rounded">PAYLOAD_SECRET</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">DATABASE_URL</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">NEXTAUTH_SECRET</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">NEXTAUTH_URL</code></li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Optional Variables:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">PAYLOAD_PUBLIC_SERVER_URL</code></li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Make sure your DATABASE_URL points to a PostgreSQL database
                and PAYLOAD_SECRET is a strong, random string for security.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-16 bg-white border-t border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 Modern Men Barbershop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
