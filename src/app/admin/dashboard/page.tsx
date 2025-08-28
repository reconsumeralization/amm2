'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { UserManagement } from '@/components/admin/UserManagement'
import { EmployeeManagement } from '@/components/admin/EmployeeManagement'
import { AuditLogs } from '@/components/admin/AuditLogs'
import { PayloadHealthCheck } from '@/components/admin/PayloadHealthCheck'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/portal/login')
      return
    }

    if (session.user?.role !== 'admin' && session.user?.role !== 'manager') {
      router.push('/portal')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icons.spinner className="h-6 w-6 animate-spin text-amber-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'manager')) {
    return null // Will redirect in useEffect
  }

  const isAdmin = session.user?.role === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-amber-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">⚙️</span>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <span className="text-blue-200">|</span>
              <span className="text-blue-100">Management Console</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100">Welcome, {session.user?.name}</span>
              <NotificationCenter userId={session.user?.id || ''} />
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => router.push('/portal')}
              >
                Back to Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Quick Actions</p>
                  <p className="text-2xl font-bold">Add User</p>
                </div>
                <Icons.users className="h-8 w-8 text-blue-200" />
              </div>
              <Button
                className="mt-4 bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => document.querySelector('[data-user-management]')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Employee Hub</p>
                  <p className="text-2xl font-bold">Team Management</p>
                </div>
                <Icons.users className="h-8 w-8 text-amber-200" />
              </div>
              <Button
                className="mt-4 bg-white text-amber-600 hover:bg-amber-50"
                onClick={() => document.querySelector('[data-employee-management]')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Manage Team
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">System Health</p>
                  <p className="text-2xl font-bold">Audit Logs</p>
                </div>
                <Icons.barChart3 className="h-8 w-8 text-green-200" />
              </div>
              <Button
                className="mt-4 bg-white text-green-600 hover:bg-green-50"
                onClick={() => document.querySelector('[data-audit-logs]')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Logs
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Business Tools</p>
                  <p className="text-2xl font-bold">Reports</p>
                </div>
                <Icons.info className="h-8 w-8 text-purple-200" />
              </div>
              <Button
                className="mt-4 bg-white text-purple-600 hover:bg-purple-50"
                onClick={() => router.push('/admin')}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Icons.database className="h-5 w-5 mr-2 text-blue-600" />
                Database Status
              </CardTitle>
              <CardDescription>Payload CMS Connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">All collections operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Icons.settings className="h-5 w-5 mr-2 text-amber-600" />
                Role Access
              </CardTitle>
              <CardDescription>Current Permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {session.user?.role?.toUpperCase()}
                </Badge>
                {isAdmin && (
                  <Badge className="bg-red-100 text-red-800">FULL ACCESS</Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {isAdmin ? 'Complete system access' : 'Management level access'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Icons.info className="h-5 w-5 mr-2 text-green-600" />
                Last Activity
              </CardTitle>
              <CardDescription>Recent System Activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Dashboard accessed</p>
              <p className="text-xs text-gray-600">Just now</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payload CMS Health Check */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <PayloadHealthCheck />
          </motion.div>
        )}

        {/* User Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
          data-user-management
        >
          <UserManagement />
        </motion.div>

        {/* Employee Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
          data-employee-management
        >
          <EmployeeManagement />
        </motion.div>

        {/* Audit Logs Section */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            data-audit-logs
          >
            <AuditLogs />
          </motion.div>
        )}
      </div>
    </div>
  )
}
