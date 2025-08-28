'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Scissors, 
  Settings, 
  FileText, 
  Camera, 
  Clock, 
  Star,
  Gift,
  BookOpen,
  Database,
  LogOut,
  Home,
  Plus,
  Search
} from '@/lib/icon-mapping'
import { motion } from 'framer-motion'

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Overview and analytics'
  },
  {
    name: 'Appointments',
    href: '/admin/collections/appointments',
    icon: Calendar,
    description: 'Manage bookings and schedules'
  },
  {
    name: 'Customers',
    href: '/admin/collections/customers',
    icon: Users,
    description: 'Client database and profiles'
  },
  {
    name: 'Services',
    href: '/admin/collections/services',
    icon: Scissors,
    description: 'Service offerings and pricing'
  },
  {
    name: 'Stylists',
    href: '/admin/collections/stylists',
    icon: Star,
    description: 'Staff management and profiles'
  },
  {
    name: 'Products',
    href: '/admin/collections/products',
    icon: Gift,
    description: 'Product catalog and inventory'
  },
  {
    name: 'Events',
    href: '/admin/collections/events',
    icon: Calendar,
    description: 'Special events and promotions'
  },
  {
    name: 'Media',
    href: '/admin/collections/media',
    icon: Camera,
    description: 'Images, videos, and files'
  },
  {
    name: 'Staff Schedules',
    href: '/admin/collections/staff-schedules',
    icon: Clock,
    description: 'Employee scheduling and availability'
  },
  {
    name: 'Clock Records',
    href: '/admin/collections/clock-records',
    icon: Clock,
    description: 'Time tracking and payroll'
  },
  {
    name: 'Settings',
    href: '/admin/collections/settings',
    icon: Settings,
    description: 'System configuration'
  },
  {
    name: 'Documentation',
    href: '/admin/collections/business-documentation',
    icon: FileText,
    description: 'Business documents and policies'
  }
]

const quickActions = [
  {
    name: 'Content Editor',
    href: '/admin/editor',
    icon: BookOpen,
    description: 'Rich text content editor'
  },
  {
    name: 'Page Builder',
    href: '/admin/page-builder',
    icon: BookOpen,
    description: 'Visual page builder with drag-and-drop'
  },
  {
    name: 'New Appointment',
    href: '/admin/collections/appointments/create',
    icon: Plus,
    description: 'Create a new booking'
  },
  {
    name: 'New Customer',
    href: '/admin/collections/customers/create',
    icon: Users,
    description: 'Add a new client'
  },
  {
    name: 'New Service',
    href: '/admin/collections/services/create',
    icon: Scissors,
    description: 'Add a new service'
  }
]

export function AdminNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActivePath = (href: string) => {
    if (!pathname) return false
    return pathname.startsWith(href)
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
              </Link>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {session.user.role}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  View Site
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
              <nav className="space-y-2">
                {adminNavigation.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActivePath(item.href)
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                                             <div className={`flex items-center justify-center w-6 h-6 rounded ${
                         isActivePath(item.href) ? 'bg-blue-100' : 'bg-gray-100'
                       }`}>
                         <item.icon className={`h-3 w-3 ${isActivePath(item.href) ? 'text-blue-600' : 'text-gray-600'}`} />
                       </div>
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <motion.div
                    key={action.name}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={action.href}
                      className="block p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-blue-300 hover:from-blue-50 hover:to-blue-100 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                                                 <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                           <action.icon className="h-5 w-5 text-blue-600" />
                         </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{action.name}</h3>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Admin Dashboard Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome to Admin Panel</h2>
              <p className="text-gray-600 mb-6">
                Manage your salon operations, appointments, customers, and settings from this central dashboard.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">Appointments</h3>
                  <p className="text-sm text-blue-700">Manage bookings and schedules</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-2">Customers</h3>
                  <p className="text-sm text-green-700">Client database and profiles</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-900 mb-2">Services</h3>
                  <p className="text-sm text-purple-700">Service offerings and pricing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
