'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdvancedSearch } from '@/components/ui/advanced-search'
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
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Activity,
  TrendingUp,

} from '@/lib/icon-mapping'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const adminNavigation = [
  // Main Admin Features
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Admin home and overview',
    badge: null
  },
  {
    name: 'Content Manager',
    href: '/admin/content',
    icon: FileText,
    description: 'Manage website content',
    badge: null
  },
  {
    name: 'Page Builder',
    href: '/admin/page-builder',
    icon: BookOpen,
    description: 'Visual page builder',
    badge: null
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Business insights and reports',
    badge: null
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and roles',
    badge: null
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration',
    badge: null
  },
  {
    name: 'Backups',
    href: '/admin/backups',
    icon: Database,
    description: 'Backup and restore system',
    badge: null
  },
  // Payload CMS Collections
  {
    name: 'Appointments',
    href: '/admin/collections/appointments',
    icon: Calendar,
    description: 'Manage bookings and schedules',
    badge: null
  },
  {
    name: 'Customers',
    href: '/admin/collections/customers',
    icon: Users,
    description: 'Client database and profiles',
    badge: null
  },
  {
    name: 'Services',
    href: '/admin/collections/services',
    icon: Scissors,
    description: 'Service offerings and pricing',
    badge: null
  },
  {
    name: 'Stylists',
    href: '/admin/collections/stylists',
    icon: Star,
    description: 'Staff management and profiles',
    badge: null
  },
  {
    name: 'Staff Schedules',
    href: '/admin/collections/staff-schedules',
    icon: Clock,
    description: 'Employee scheduling',
    badge: null
  },
  {
    name: 'Clock Records',
    href: '/admin/collections/clock-records',
    icon: Clock,
    description: 'Time tracking and payroll',
    badge: null
  },
  {
    name: 'Media',
    href: '/admin/collections/media',
    icon: Camera,
    description: 'Images, videos, and files',
    badge: null
  },
  {
    name: 'Products',
    href: '/admin/collections/products',
    icon: Gift,
    description: 'Product catalog and inventory',
    badge: null
  },
  {
    name: 'Payload CMS',
    href: '/admin/payload',
    icon: Database,
    description: 'Payload CMS admin panel',
    badge: null
  }
]

const quickActions = [
  {
    name: 'Content Manager',
    href: '/admin/content',
    icon: FileText,
    description: 'Manage website content',
    color: 'bg-blue-500'
  },
  {
    name: 'Page Builder',
    href: '/admin/page-builder',
    icon: BookOpen,
    description: 'Visual page builder with drag-and-drop',
    color: 'bg-purple-500'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'View business analytics',
    color: 'bg-green-500'
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and roles',
    color: 'bg-orange-500'
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configure system settings',
    color: 'bg-pink-500'
  },
  {
    name: 'Create Backup',
    href: '/admin/backups',
    icon: Database,
    description: 'Backup system data',
    color: 'bg-indigo-500'
  }
]

const dashboardStats = [
  {
    title: 'Today\'s Appointments',
    value: '12',
    change: '+2 from yesterday',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    title: 'Active Customers',
    value: '248',
    change: '+15 this month',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    title: 'Revenue Today',
    value: '$1,240',
    change: '+8% from yesterday',
    icon: 'DollarSign',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    title: 'Services Active',
    value: '18',
    change: '2 new this week',
    icon: Scissors,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
]

export function AdminNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications] = useState(3) // Mock notification count

  const isActivePath = (href: string) => {
    if (!pathname) return false
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handleSearchSelect = (result: any) => {
    // Handle search result selection
    console.log('Selected search result:', result)
  }

  if (!(session as any)?.user || ((session as any).user)?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Admin Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BarChart3 className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Modern Men</span>
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                    Admin
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <AdvancedSearch
                placeholder="Search appointments, customers, services..."
                onSelect={handleSearchSelect}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </motion.div>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">View Site</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 shadow-lg"
          >
            <div className="px-4 py-4 space-y-2">
              <AdvancedSearch
                placeholder="Search..."
                onSelect={handleSearchSelect}
                className="w-full mb-4"
              />
              {adminNavigation.slice(0, 6).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActivePath(item.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="h-5 w-5 flex items-center justify-center">{typeof item.icon === 'string' ? item.icon : '📄'}</div>
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Collections
              </h2>
              <nav className="space-y-1">
                {adminNavigation.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200",
                        isActivePath(item.href)
                          ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                          isActivePath(item.href) 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        )}>
                          <div className={cn(
                            "h-4 w-4 flex items-center justify-center transition-colors text-lg",
                            isActivePath(item.href)
                              ? 'text-blue-600'
                              : 'text-gray-600 group-hover:text-gray-700'
                          )}>{typeof item.icon === 'string' ? item.icon : '📄'}</div>
                        </div>
                        <div>
                          <span className="font-medium text-sm">{item.name}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <Badge 
                            variant={item.badge === 'New' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </div>

          {/* Enhanced Main Content Area */}
          <div className="lg:col-span-3">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md",
                    stat.borderColor
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                      <div className={cn("h-6 w-6 flex items-center justify-center text-xl", stat.color)}>
                        {typeof stat.icon === 'string' ? stat.icon : '📄'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Quick Actions
                </h2>
                <Badge variant="outline" className="text-xs">
                  {quickActions.length} available
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={action.href}
                      className="group block p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-sm group-hover:shadow-md transition-shadow",
                          action.color
                        )}>
                          <div className="h-6 w-6 flex items-center justify-center text-xl">{typeof action.icon === 'string' ? action.icon : '📄'}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Enhanced Admin Dashboard Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
                  barber Management Hub
                </h2>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  All Systems Operational
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Welcome to your comprehensive barber management dashboard. Monitor operations, 
                manage appointments, track customer relationships, and optimize your business 
                performance from this centralized control center.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center mb-3">
                    <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="font-semibold text-blue-900">Appointment System</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Comprehensive booking management with real-time availability, 
                    automated confirmations, and customer notifications.
                  </p>
                  <Link href="/admin/collections/appointments">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Manage Bookings
                    </Button>
                  </Link>
                </motion.div>

                <motion.div 
                  className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center mb-3">
                    <Users className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="font-semibold text-green-900">Customer Relations</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    Complete client database with service history, preferences, 
                    loyalty tracking, and personalized communication tools.
                  </p>
                  <Link href="/admin/collections/customers">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      View Customers
                    </Button>
                  </Link>
                </motion.div>

                <motion.div 
                  className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center mb-3">
                    <Scissors className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="font-semibold text-purple-900">Service Management</h3>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    Dynamic service catalog with flexible pricing, duration settings, 
                    staff assignments, and promotional capabilities.
                  </p>
                  <Link href="/admin/collections/services">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Manage Services
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Additional Features Grid */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Staff Management</h4>
                      <p className="text-sm text-gray-600">Schedule, performance, and payroll tracking</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Analytics Dashboard</h4>
                      <p className="text-sm text-gray-600">Revenue insights and performance metrics</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Gift className="h-5 w-5 text-pink-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Loyalty Program</h4>
                      <p className="text-sm text-gray-600">Customer rewards and retention tools</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Settings className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">System Configuration</h4>
                      <p className="text-sm text-gray-600">Business settings and customization</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
