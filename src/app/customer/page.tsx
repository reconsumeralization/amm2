"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function CustomerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/customer')
    } else if ((session as any).user?.role !== 'customer') {
      router.push('/auth/signin?callbackUrl=/customer')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || (session as any).user?.role !== 'customer') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {(session as any).user?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Profile */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg">{(session as any).user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{(session as any).user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg">{((session as any).user as any)?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-lg">{((session as any).user as any)?.address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer ID</label>
                  <p className="text-lg font-mono">{((session as any).user as any)?.customerId || 'N/A'}</p>
                </div>
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Classic Haircut</h4>
                      <p className="text-sm text-gray-600">with Michael Chen</p>
                      <p className="text-sm text-gray-500">Friday, January 15, 2024 at 2:00 PM</p>
                    </div>
                    <Badge variant="outline">Confirmed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Beard Trim</h4>
                      <p className="text-sm text-gray-600">with David Rodriguez</p>
                      <p className="text-sm text-gray-500">Monday, January 22, 2024 at 10:30 AM</p>
                    </div>
                    <Badge variant="outline">Confirmed</Badge>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Book New Appointment
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent visits and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Premium Haircut & Beard Trim</h4>
                      <p className="text-sm text-gray-600">December 28, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$50.00</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Classic Haircut</h4>
                      <p className="text-sm text-gray-600">December 14, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$35.00</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Executive Shave</h4>
                      <p className="text-sm text-gray-600">November 30, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$40.00</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common customer tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="w-full" variant="outline">
                    Book Appointment
                  </Button>
                  <Button className="w-full" variant="outline">
                    View Services
                  </Button>
                  <Button className="w-full" variant="outline">
                    Contact Support
                  </Button>
                  <Button className="w-full" variant="outline">
                    View Receipts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
