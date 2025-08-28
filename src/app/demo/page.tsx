"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@modernmen.ca',
    password: 'admin123',
    role: 'admin',
    description: 'Full system access - manage appointments, customers, services, and view reports',
    permissions: ['manage_appointments', 'manage_customers', 'manage_services', 'view_reports'],
    dashboardUrl: '/admin'
  },
  {
    name: 'John Smith',
    email: 'customer@modernmen.ca',
    password: 'customer123',
    role: 'customer',
    description: 'Customer access - view appointments, book services, manage profile',
    permissions: ['view_appointments', 'book_appointments', 'view_profile'],
    dashboardUrl: '/customer',
    customerId: 'CUST001',
    phone: '(306) 555-0123',
    address: '123 Main St, Regina, SK'
  },
  {
    name: 'Michael Chen',
    email: 'stylist@modernmen.ca',
    password: 'stylist123',
    role: 'stylist',
    description: 'Stylist access - view appointments, manage own schedule, view customers',
    permissions: ['view_appointments', 'manage_own_appointments', 'view_customers'],
    dashboardUrl: '/stylist',
    stylistId: 'STYL001',
    specialties: ['Fades', 'Pompadours', 'Beard Grooming']
  }
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Demo Accounts</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Use these demo accounts to test different user roles and permissions in the Modern Men Hair Salon application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoUsers.map((user) => (
            <Card key={user.email} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={
                      user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                      user.role === 'customer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }
                  >
                    {user.role}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {user.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Password</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.password}</p>
                  </div>
                  {user.customerId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Customer ID</label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.customerId}</p>
                    </div>
                  )}
                  {user.stylistId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Stylist ID</label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.stylistId}</p>
                    </div>
                  )}
                  {user.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                  )}
                  {user.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-sm">{user.address}</p>
                    </div>
                  )}
                  {user.specialties && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Specialties</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Permissions</label>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button asChild className="flex-1">
                    <Link href={`/auth/signin?callbackUrl=${user.dashboardUrl}`}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={user.dashboardUrl}>
                      Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>How to Use Demo Accounts</CardTitle>
              <CardDescription>Instructions for testing the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="space-y-2">
                <h4 className="font-medium">1. Choose a Demo Account</h4>
                <p className="text-sm text-gray-600">
                  Select one of the demo accounts above based on the role you want to test.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Login</h4>
                <p className="text-sm text-gray-600">
                  Click the "Login" button to go to the sign-in page with the selected account pre-filled.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. Access Dashboard</h4>
                <p className="text-sm text-gray-600">
                  After successful login, you'll be redirected to the appropriate dashboard for that user role.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">4. Test Features</h4>
                <p className="text-sm text-gray-600">
                  Explore the different features and permissions available to each user role.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
