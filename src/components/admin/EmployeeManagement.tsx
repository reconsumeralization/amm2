'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface Employee {
  id: string
  name: string
  userInfo?: {
    email: string
    phone?: string
    role: string
    isActive: boolean
  }
  performance?: {
    rating?: number
    reviewCount?: number
    totalAppointments?: number
  }
  recentAppointmentsCount?: number
  isActive: boolean
  featured?: boolean
}

interface EmployeeStats {
  total: number
  active: number
  featured: number
  avgRating: number
  totalAppointments: number
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [rchTerm, setrchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')

  useEffect(() => {
    fetchEmployees()
  }, [rchTerm, statusFilter, ratingFilter])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = new URLrchParams()
      if (rchTerm) params.set('rch', rchTerm)
      if (statusFilter !== 'all') {
        params.set('isActive', statusFilter === 'active' ? 'true' : 'false')
      }

      const response = await fetch(`/api/employees?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch employees')

      const data = await response.json()
      setEmployees(data.employees)

      // Calculate stats
      const totalEmployees = data.total || data.employees.length
      const activeEmployees = data.employees.filter((e: Employee) => e.isActive).length
      const featuredEmployees = data.employees.filter((e: Employee) => e.featured).length
      const totalAppointments = data.employees.reduce((sum: number, e: Employee) =>
        sum + (e.recentAppointmentsCount || 0), 0
      )
      const avgRating = data.employees.length > 0
        ? data.employees.reduce((sum: number, e: Employee) =>
            sum + (e.performance?.rating || 0), 0
          ) / data.employees.length
        : 0

      setStats({
        total: totalEmployees,
        active: activeEmployees,
        featured: featuredEmployees,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalAppointments
      })
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update employee status')

      toast.success(`Employee ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchEmployees()
    } catch (error) {
      console.error('Error updating employee status:', error)
      toast.error('Failed to update employee status')
    }
  }

  const handleToggleFeatured = async (employeeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update featured status')

      toast.success(`Employee ${!currentStatus ? 'featured' : 'unfeatured'}`)
      fetchEmployees()
    } catch (error) {
      console.error('Error updating featured status:', error)
      toast.error('Failed to update featured status')
    }
  }

  const handleViewAnalytics = (employeeId: string, employeeName: string) => {
    // This would open analytics modal or navigate to analytics page
    toast.info(`Analytics for ${employeeName} - Feature coming soon`)
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Employees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600">{stats.featured}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</div>
              <div className="text-sm text-gray-600">Recent Appointments</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Employee Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="rch employees..."
                  value={rchTerm}
                  onChange={(e) => setrchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ratings</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                    <SelectItem value="4.0">4.0+ stars</SelectItem>
                    <SelectItem value="3.5">3.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Icons.users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-4">
                {rchTerm || statusFilter !== 'all' || ratingFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No employees have been created yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center relative">
                      {employee.name ? (
                        <span className="text-xl font-medium text-gray-700">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      ) : (
                        <Icons.users className="h-8 w-8 text-gray-400" />
                      )}
                      {employee.featured && (
                        <Badge className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs px-1 py-0">
                          ★
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-800 text-lg">{employee.name}</h3>
                        {employee.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {employee.userInfo?.email} • {employee.userInfo?.phone || 'No phone'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        {employee.performance?.rating && (
                          <div className="flex items-center space-x-1">
                            {renderStars(employee.performance.rating)}
                            <span className="text-gray-600">
                              ({employee.performance.reviewCount || 0} reviews)
                            </span>
                          </div>
                        )}
                        <div className="text-gray-600">
                          {employee.recentAppointmentsCount || 0} recent appointments
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalytics(employee.id, employee.name)}
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Icons.barChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFeatured(employee.id, employee.featured || false)}
                        className={employee.featured
                          ? 'border-amber-500 text-amber-600 hover:bg-amber-50'
                          : 'border-gray-500 text-gray-600 hover:bg-gray-50'
                        }
                      >
                        <Icons.info className="h-4 w-4 mr-1" />
                        {employee.featured ? 'Featured' : 'Feature'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(employee.id, employee.isActive)}
                        className={employee.isActive
                          ? 'border-green-500 text-green-600 hover:bg-green-50'
                          : 'border-red-500 text-red-600 hover:bg-red-50'
                        }
                      >
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
