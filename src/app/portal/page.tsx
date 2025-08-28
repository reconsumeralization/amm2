'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BookingChatbot from '@/components/chatbot/BookingChatbot'
import StaffClock from '@/components/portal/StaffClock'
import StaffSchedule from '@/components/portal/StaffSchedule'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoaderCircle, LogOut, User } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function PortalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [clockRecords, setClockRecords] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/portal/login')
      return
    }

    // Fetch user data and portal information
    fetchPortalData()
  }, [session, status, router])

  const fetchPortalData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch user profile data
      const userResponse = await fetch('/api/auth/user/profile')
      if (userResponse.ok) {
        const userProfile = await userResponse.json()
        setUserData(userProfile)
      }

      // Fetch appointments
      const appointmentsResponse = await fetch('/api/appointments')
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData.docs || [])
      }

      // Fetch services
      const servicesResponse = await fetch('/api/services')
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData.docs || [])
      }

      // Fetch clock records for staff users
      if (session.user.role === 'staff') {
        const clockResponse = await fetch('/api/admin/clock-records')
        if (clockResponse.ok) {
          const clockData = await clockResponse.json()
          setClockRecords(clockData.docs || [])
        }
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/analytics/user')
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }

    } catch (err) {
      console.error('Error fetching portal data:', err)
      setError('Failed to load portal data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/',
      redirect: true
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Portal...</h2>
          <p className="text-gray-600">Please wait while we set up your dashboard.</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null // Will redirect via useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchPortalData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <User className="h-6 w-6 text-amber-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Customer Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {session?.user?.name || session?.user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Staff Components */}
            {(session.user as any).role === 'staff' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StaffClock userId={session.user.id} tenantId="default" />
                <StaffSchedule userId={session.user.id} tenantId="default" />
              </div>
            )}

            {/* Appointments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map((appointment: any) => (
                      <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{appointment.service || 'Service'}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
            </div>
          ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No appointments found.</p>
                )}
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.slice(0, 6).map((service: any) => (
                      <div key={service.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <p className="text-sm font-semibold text-green-600 mt-2">${service.price}</p>
            </div>
          ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No services available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="font-semibold">{appointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="font-semibold">
                    {appointments.filter((apt: any) => new Date(apt.date) > new Date()).length}
                  </span>
                </div>
                {(session.user as any).role === 'staff' && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Clock Records</span>
                    <span className="font-semibold">{clockRecords.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Clock Records for Staff */}
            {(session.user as any).role === 'staff' && clockRecords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {clockRecords.slice(0, 3).map((record: any) => (
                      <div key={record.id} className="flex justify-between items-center text-sm">
                        <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.action === 'clock-in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chatbot */}
        <div className="mt-8">
          <BookingChatbot />
        </div>
      </div>
    </div>
  )
}